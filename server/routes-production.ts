/**
 * Production Routes Configuration
 * Clean, production-ready routing with proper logging
 * 
 * @author Production Team
 * @version 1.0.0 - Production Ready
 */

import { Express } from 'express';
import { logError, logWarn, logInfo, logSecurity, silentLog } from './production-logger';

export async function setupProductionRoutes(app: Express) {
  try {
    // Import required modules
    const { generateSecureCaptcha, validateCaptcha } = await import('./captcha-secure');
    const { handleFileUpload, securityScanMiddleware, uploadMiddleware, serveFile } = await import('./fileUpload');
    const { createCitizenCommunication, getCommunications, updateCommunicationStatus, 
            createBusinessSubmission, getBusinessSubmissions, getAdminStatistics,
            getWeeklyTrends, getMonthlyTrends, getDailyTrends } = await import('./storage');
    const { honeypotMiddleware, setupHoneypotRoutes } = await import('./honeypot');
    const { createMinistryEmailService } = await import('./ministryEmailService');
    const { createAIService } = await import('./aiService');
    const { securityScanMiddleware: inputSecurityMiddleware } = await import('./input-security');
    const { uploadLimiter, formLimiter, adminLimiter } = await import('./index');
    const { seamlessSecurityMiddleware, seamlessRateLimitingMiddleware } = await import('./enhanced-security-seamless');

    // Initialize services
    let ministryEmailService: any = null;
    let aiService: any = null;

    try {
      ministryEmailService = await createMinistryEmailService();
      logInfo('Ministry email service initialized');
    } catch (error) {
      logWarn('Ministry email service initialization failed, continuing without email notifications');
    }

    try {
      aiService = await createAIService();
      logInfo('AI service initialized');
    } catch (error) {
      logWarn('AI service initialization failed, continuing without AI features');
    }

    // Setup honeypot protection
    setupHoneypotRoutes(app);
    silentLog.security('Honeypot system activated');

    // Create test users if needed
    try {
      const { createTestUsers } = await import('./createTestUsers');
      await createTestUsers();
    } catch (error) {
      logError('Error creating test users', { error: error.message });
    }

    // CAPTCHA endpoint
    app.post('/api/captcha', uploadLimiter, async (req, res) => {
      try {
        const captcha = await generateSecureCaptcha(req);
        res.json(captcha);
      } catch (error) {
        logError('Error generating CAPTCHA', { error: error.message });
        res.status(500).json({ message: 'حدث خطأ في إنشاء الرمز الأمني' });
      }
    });

    // Secure file upload endpoint
    app.post("/api/uploads", 
      uploadLimiter, 
      seamlessRateLimitingMiddleware,
      uploadMiddleware, 
      seamlessSecurityMiddleware,
      securityScanMiddleware, 
      handleFileUpload
    );

    // File serving endpoint
    app.get('/api/files/:filename', serveFile);

    // Authentication routes
    const authModule = await import('./auth');
    app.post('/api/login', authModule.loginHandler);
    app.post('/api/admin/users', adminLimiter, authModule.adminCreateUser);

    // Citizen communication endpoint
    app.post('/api/citizen-communications', 
      formLimiter,
      inputSecurityMiddleware,
      honeypotMiddleware,
      async (req, res) => {
        try {
          silentLog.debug('Citizen communication endpoint accessed');

          // Validate CAPTCHA
          const captchaValid = await validateCaptcha(req.body.captcha);
          if (!captchaValid) {
            logSecurity('Invalid CAPTCHA attempt', { ip: req.ip });
            return res.status(400).json({ 
              message: 'الرمز الأمني غير صحيح', 
              error: 'INVALID_CAPTCHA' 
            });
          }

          silentLog.debug('CAPTCHA validation successful');

          // Security validation
          const securityThreats = ['<script', 'javascript:', 'vbscript:', 'onload=', 'onerror='];
          for (const field in req.body) {
            const value = String(req.body[field]).toLowerCase();
            for (const threat of securityThreats) {
              if (value.includes(threat)) {
                logSecurity(`XSS attempt blocked: ${threat}`, { ip: req.ip, field });
                return res.status(400).json({
                  message: 'تم رفض الطلب لأسباب أمنية',
                  error: 'SECURITY_VIOLATION'
                });
              }
            }
          }

          // Malicious pattern detection
          const maliciousPatterns = [
            /union\s+select/gi,
            /drop\s+table/gi, 
            /'.*or.*'.*=/gi,
            /exec\s*\(/gi,
            /system\s*\(/gi
          ];

          for (const field in req.body) {
            const value = String(req.body[field]);
            for (const pattern of maliciousPatterns) {
              if (pattern.test(value)) {
                logSecurity(`Malicious pattern blocked: ${pattern}`, { ip: req.ip, field });
                return res.status(400).json({
                  message: 'تم رفض الطلب لأسباب أمنية',
                  error: 'SECURITY_VIOLATION'
                });
              }
            }
          }

          // Validation schema
          const schema = {
            name: { required: true, maxLength: 100 },
            nationalId: { required: true, pattern: /^\d{11}$/ },
            email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
            phone: { required: true, maxLength: 20 },
            communicationType: { required: true },
            subject: { required: true, maxLength: 200 },
            message: { required: true, maxLength: 2000 }
          };

          // Validate required fields
          for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field];
            
            if (rules.required && (!value || String(value).trim() === '')) {
              return res.status(400).json({
                message: `حقل ${field} مطلوب`,
                error: 'VALIDATION_FAILED',
                field
              });
            }

            if (value && rules.maxLength && String(value).length > rules.maxLength) {
              return res.status(400).json({
                message: `حقل ${field} طويل جداً`,
                error: 'VALIDATION_FAILED',
                field
              });
            }

            if (value && rules.pattern && !rules.pattern.test(String(value))) {
              return res.status(400).json({
                message: `تنسيق حقل ${field} غير صحيح`,
                error: 'VALIDATION_FAILED',
                field
              });
            }
          }

          silentLog.debug('All validation checks passed');

          // Create communication record
          const communicationWithMetadata = {
            ...req.body,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            submittedAt: new Date().toISOString()
          };

          const createdCommunication = await createCitizenCommunication(communicationWithMetadata);
          silentLog.debug('Communication created successfully');

          // Send notifications (async, don't block response)
          if (ministryEmailService) {
            ministryEmailService.sendNewCommunicationAlert(createdCommunication)
              .then(() => silentLog.debug('Email notification sent'))
              .catch((error: any) => logError('Email notification failed', { error: error.message }));

            ministryEmailService.sendCitizenConfirmation(createdCommunication)
              .then(() => silentLog.debug('Confirmation email sent'))
              .catch((error: any) => logError('Confirmation email failed', { error: error.message }));
          }

          res.json({
            message: 'تم إرسال رسالتك بنجاح وسيتم الرد عليك في أقرب وقت ممكن',
            success: true,
            id: createdCommunication.id
          });

        } catch (error) {
          logError('Unhandled error in citizen communications', { 
            error: error.message, 
            stack: error.stack 
          });
          res.status(500).json({ message: 'حدث خطأ داخلي في الخادم' });
        }
      }
    );

    // Admin endpoints
    app.get('/api/admin/communications', 
      adminLimiter,
      authModule.requireAdmin,
      async (req, res) => {
        try {
          const { status, type: communicationType, search, page = '1', limit = '20', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
          
          const pageNum = Math.max(1, parseInt(page as string) || 1);
          const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));

          const result = await getCommunications({
            status: status as string,
            communicationType: communicationType as string, 
            search: search as string,
            page: pageNum,
            limit: limitNum,
            sortBy: sortBy as string,
            sortOrder: sortOrder as 'asc' | 'desc'
          });

          silentLog.debug('Admin communications retrieved');
          res.json(result);
        } catch (error) {
          logError('Admin API error', { error: error.message });
          res.status(500).json({ message: 'خطأ في تحميل البيانات' });
        }
      }
    );

    // Business submission endpoint
    app.post('/api/business-submissions',
      formLimiter,
      inputSecurityMiddleware,
      honeypotMiddleware,
      async (req, res) => {
        try {
          const createdSubmission = await createBusinessSubmission(req.body);
          
          // Send notification (async)
          if (ministryEmailService) {
            ministryEmailService.sendBusinessSubmissionAlert(createdSubmission)
              .catch((error: any) => logError('Business email notification failed', { error: error.message }));
          }

          res.json({
            message: 'تم إرسال طلبك بنجاح',
            success: true,
            id: createdSubmission.id
          });
        } catch (error) {
          logError('Business submission error', { error: error.message });
          res.status(500).json({ message: 'حدث خطأ في إرسال الطلب' });
        }
      }
    );

    // Statistics endpoints
    app.get('/api/admin/statistics', adminLimiter, authModule.requireAdmin, async (req, res) => {
      try {
        const stats = await getAdminStatistics();
        res.json(stats);
      } catch (error) {
        logError('Statistics error', { error: error.message });
        res.status(500).json({ message: 'خطأ في تحميل الإحصائيات' });
      }
    });

    // AI endpoints (if available)
    if (aiService) {
      app.post('/api/admin/ai/analyze/:id', adminLimiter, authModule.requireAdmin, async (req, res) => {
        try {
          const result = await aiService.analyzeCommunication(req.params.id);
          res.json(result);
        } catch (error) {
          logError('AI analysis error', { error: error.message });
          res.status(500).json({ message: 'خطأ في تحليل الرسالة' });
        }
      });
    }

    // Security middleware for blocking attack tools
    app.use((req, res, next) => {
      const userAgent = req.get('User-Agent')?.toLowerCase() || '';
      const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'burp', 'owasp', 'zap'];
      
      for (const agent of suspiciousAgents) {
        if (userAgent.includes(agent)) {
          logSecurity(`Blocked attack tool: ${agent}`, { ip: req.ip });
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      const suspiciousPatterns = ['/wp-admin', '/admin', '/phpmyadmin', '/.env', '/config'];
      for (const pattern of suspiciousPatterns) {
        if (req.path.includes(pattern)) {
          logSecurity(`Suspicious path pattern: ${pattern}`, { ip: req.ip });
          return res.status(404).json({ message: 'Not found' });
        }
      }

      next();
    });

    logInfo('Production routes setup completed successfully');

  } catch (error) {
    logError('Failed to setup production routes', { error: error.message });
    throw error;
  }
} 