import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Enhanced device fingerprinting interface
interface EnhancedDeviceInfo {
  // Network Information
  ipAddress: string;
  realIP: string;
  forwardedIP: string;
  cloudflareIP: string;
  xRealIP: string;
  remoteAddress: string;
  port: number;
  protocol: string;
  
  // Device Fingerprinting
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  acceptCharset: string;
  accept: string;
  connection: string;
  dnt: string;
  upgradeInsecureRequests: string;
  secFetchSite: string;
  secFetchMode: string;
  secFetchUser: string;
  secFetchDest: string;
  secChUa: string;
  secChUaMobile: string;
  secChUaPlatform: string;
  secChUaFullVersion: string;
  secChUaFullVersionList: string;
  
  // Advanced Device Detection
  screenResolution: string;
  colorDepth: string;
  timezone: string;
  language: string;
  platform: string;
  hardwareConcurrency: string;
  deviceMemory: string;
  maxTouchPoints: string;
  
  // Network Fingerprinting
  via: string;
  xForwardedProto: string;
  xForwardedPort: string;
  xForwardedHost: string;
  xOriginalHost: string;
  host: string;
  referer: string;
  origin: string;
  cacheControl: string;
  pragma: string;
  
  // Security Headers
  authorization: string;
  xRequestedWith: string;
  xCsrfToken: string;
  cookie: string;
  xApiKey: string;
  xAuthToken: string;
  
  // System Information
  socketRemoteAddress: string;
  socketRemoteFamily: string;
  socketRemotePort: number;
  socketLocalAddress: string;
  socketLocalPort: number;
  
  // MAC Address Detection (if available)
  macAddress?: string;
  networkInterface?: string;
  
  // Geolocation (if available)
  geoLocation?: {
    country?: string;
    region?: string;
    city?: string;
    isp?: string;
    org?: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Threat Assessment
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EXTREME';
  threatIndicators: string[];
  
  // Unique Fingerprint
  deviceFingerprint: string;
  networkFingerprint: string;
  combinedFingerprint: string;
}

// Enhanced honeypot attempt interface
interface EnhancedHoneypotAttempt {
  timestamp: string;
  attemptId: string;
  deviceInfo: EnhancedDeviceInfo;
  requestDetails: {
    method: string;
    url: string;
    path: string;
    query: string;
    httpVersion: string;
    contentType: string;
    contentLength: string;
    bodyData: any;
  };
  headers: Record<string, string>;
  threatAnalysis: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EXTREME';
    indicators: string[];
    riskScore: number;
    recommendations: string[];
  };
}

// Enhanced IP extraction with MAC address detection
const getComprehensiveNetworkInfo = (req: Request) => {
  const cloudflareIP = req.headers['cf-connecting-ip'] as string;
  const realIP = req.headers['x-real-ip'] as string;
  const forwardedIP = req.headers['x-forwarded-for'] as string;
  const remoteAddress = req.connection.remoteAddress || req.socket.remoteAddress;
  
  // Try to extract MAC address from various headers
  const macAddress = req.headers['x-mac-address'] as string || 
                    req.headers['x-client-mac'] as string || 
                    req.headers['x-device-id'] as string || 
                    'N/A';
  
  return {
    primary: cloudflareIP || realIP || forwardedIP?.split(',')[0] || remoteAddress || 'Unknown',
    cloudflareIP: cloudflareIP || 'N/A',
    realIP: realIP || 'N/A',
    forwardedIP: forwardedIP || 'N/A',
    remoteAddress: remoteAddress || 'N/A',
    macAddress: macAddress,
    networkInterface: req.headers['x-network-interface'] as string || 'N/A'
  };
};

// Enhanced device fingerprinting
const createEnhancedDeviceFingerprint = (req: Request): string => {
  const fingerprint = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
    req.headers['accept'] || '',
    req.headers['sec-ch-ua'] || '',
    req.headers['sec-ch-ua-platform'] || '',
    req.headers['sec-ch-ua-mobile'] || '',
    req.headers['dnt'] || '',
    req.connection.remoteAddress || '',
    req.headers['x-forwarded-for'] || '',
    req.headers['x-real-ip'] || '',
    req.headers['cf-connecting-ip'] || '',
    req.headers['x-mac-address'] || '',
    req.headers['x-client-mac'] || '',
    req.headers['x-device-id'] || '',
    req.headers['x-screen-resolution'] || '',
    req.headers['x-color-depth'] || '',
    req.headers['x-timezone'] || '',
    req.headers['x-language'] || '',
    req.headers['x-platform'] || '',
    req.headers['x-hardware-concurrency'] || '',
    req.headers['x-device-memory'] || '',
    req.headers['x-max-touch-points'] || ''
  ].join('|');
  
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
};

// Enhanced threat assessment
const assessEnhancedThreatLevel = (req: Request): {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EXTREME';
  indicators: string[];
  riskScore: number;
  recommendations: string[];
} => {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const path = req.path.toLowerCase();
  const indicators: string[] = [];
  let riskScore = 0;
  
  // EXTREME threat indicators
  const extremePatterns = ['sqlmap', 'metasploit', 'nmap', 'burp', 'hydra', 'nikto', 'w3af', 'zap'];
  if (extremePatterns.some(pattern => userAgent.includes(pattern))) {
    indicators.push('Penetration testing tools detected');
    riskScore += 100;
  }
  
  // CRITICAL threat indicators
  const criticalPaths = ['/admin', '/phpmyadmin', '/.env', '/config', '/wp-admin', '/administrator'];
  if (criticalPaths.some(criticalPath => path.includes(criticalPath))) {
    indicators.push('Critical system paths targeted');
    riskScore += 80;
  }
  
  // HIGH threat indicators
  const suspiciousPatterns = ['bot', 'crawler', 'scanner', 'exploit', 'hack', 'python-requests', 'curl', 'wget'];
  if (suspiciousPatterns.some(pattern => userAgent.includes(pattern))) {
    indicators.push('Suspicious user agent detected');
    riskScore += 60;
  }
  
  // MEDIUM threat indicators
  const mediumPatterns = ['postman', 'insomnia', 'thunder client'];
  if (mediumPatterns.some(pattern => userAgent.includes(pattern))) {
    indicators.push('API testing tools detected');
    riskScore += 40;
  }
  
  // Additional indicators
  if (!req.headers['user-agent']) {
    indicators.push('No user agent provided');
    riskScore += 20;
  }
  
  if (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].toString().includes(',')) {
    indicators.push('Multiple IP addresses in forwarded header');
    riskScore += 30;
  }
  
  // Determine threat level
  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EXTREME' = 'LOW';
  if (riskScore >= 100) level = 'EXTREME';
  else if (riskScore >= 80) level = 'CRITICAL';
  else if (riskScore >= 60) level = 'HIGH';
  else if (riskScore >= 40) level = 'MEDIUM';
  
  const recommendations = [
    'Monitor this IP address for additional suspicious activity',
    'Consider blocking this IP address if pattern continues',
    'Report to security team for further investigation',
    'Update firewall rules to block similar patterns'
  ];
  
  return { level, indicators, riskScore, recommendations };
};

// Enhanced logging with comprehensive device information
const logEnhancedHoneypotAttempt = async (attempt: EnhancedHoneypotAttempt) => {
  try {
    const logFile = path.join(__dirname, '../logs/enhanced-honeypot.log');
    const alertFile = path.join(__dirname, '../logs/enhanced-security-alerts.json');
    const logDir = path.dirname(logFile);
    
    // Create logs directory if it doesn't exist
    try {
      await fs.access(logDir);
    } catch {
      await fs.mkdir(logDir, { recursive: true });
    }
    
    // Log to enhanced honeypot file
    const logEntry = JSON.stringify(attempt, null, 2) + '\n' + '='.repeat(120) + '\n';
    await fs.appendFile(logFile, logEntry);
    
    // Log to enhanced security alerts JSON
    try {
      let alerts = [];
      try {
        const existingData = await fs.readFile(alertFile, 'utf8');
        alerts = JSON.parse(existingData);
      } catch {
        // File doesn't exist or is empty
      }
      
      alerts.push(attempt);
      
      // Keep only last 1000 alerts to prevent file bloat
      if (alerts.length > 1000) {
        alerts = alerts.slice(-1000);
      }
      
      await fs.writeFile(alertFile, JSON.stringify(alerts, null, 2));
    } catch (error) {
      console.error('Failed to update enhanced security alerts JSON:', error);
    }
    
    // Enhanced console alert with MAC address and device info
    const threatEmoji = {
      'LOW': '🟡',
      'MEDIUM': '🟠',
      'HIGH': '🔴',
      'CRITICAL': '💀',
      'EXTREME': '☢️'
    };
    
    console.log('\n' + '🚨'.repeat(60));
    console.log(`${threatEmoji[attempt.threatAnalysis.level]} ENHANCED SECURITY BREACH DETECTED - ${attempt.threatAnalysis.level} THREAT LEVEL ${threatEmoji[attempt.threatAnalysis.level]}`);
    console.log('🚨'.repeat(60));
    console.log(`🎯 Target Route: ${attempt.requestDetails.url}`);
    console.log(`📍 Primary IP: ${attempt.deviceInfo.ipAddress}`);
    console.log(`🔗 Real IP: ${attempt.deviceInfo.realIP}`);
    console.log(`🌐 User Agent: ${attempt.deviceInfo.userAgent}`);
    console.log(`🔍 Device Fingerprint: ${attempt.deviceInfo.deviceFingerprint}`);
    console.log(`🔍 Network Fingerprint: ${attempt.deviceInfo.networkFingerprint}`);
    console.log(`🔍 Combined Fingerprint: ${attempt.deviceInfo.combinedFingerprint}`);
    console.log(`📱 MAC Address: ${attempt.deviceInfo.macAddress}`);
    console.log(`🌍 Platform: ${attempt.deviceInfo.platform}`);
    console.log(`🖥️ Screen Resolution: ${attempt.deviceInfo.screenResolution}`);
    console.log(`🎨 Color Depth: ${attempt.deviceInfo.colorDepth}`);
    console.log(`⏰ Timezone: ${attempt.deviceInfo.timezone}`);
    console.log(`🌐 Language: ${attempt.deviceInfo.language}`);
    console.log(`⚙️ Hardware Concurrency: ${attempt.deviceInfo.hardwareConcurrency}`);
    console.log(`💾 Device Memory: ${attempt.deviceInfo.deviceMemory}`);
    console.log(`👆 Max Touch Points: ${attempt.deviceInfo.maxTouchPoints}`);
    console.log(`⏰ Timestamp: ${attempt.timestamp}`);
    console.log(`🚨 Threat Level: ${attempt.threatAnalysis.level}`);
    console.log(`📊 Risk Score: ${attempt.threatAnalysis.riskScore}`);
    console.log(`📝 Attempt ID: ${attempt.attemptId}`);
    console.log(`💾 Logged to: ${logFile}`);
    console.log('🚨'.repeat(60) + '\n');
    
    // Special alert for EXTREME threats
    if (attempt.threatAnalysis.level === 'EXTREME') {
      console.log('☢️'.repeat(60));
      console.log('🚨 EXTREME THREAT DETECTED - ACTIVE PENETRATION TESTING TOOLS 🚨');
      console.log('🚨 IMMEDIATE ATTENTION REQUIRED - POTENTIAL STATE-LEVEL ATTACK 🚨');
      console.log('☢️'.repeat(60) + '\n');
    }
    
  } catch (error) {
    console.error('❌ Failed to log enhanced honeypot attempt:', error);
  }
};

// Enhanced honeypot handler
export const enhancedHoneypotHandler = async (req: Request, res: Response) => {
  const networkInfo = getComprehensiveNetworkInfo(req);
  const timestamp = new Date().toISOString();
  const attemptId = `ENHANCED-HONEYPOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const threatAnalysis = assessEnhancedThreatLevel(req);
  const deviceFingerprint = createEnhancedDeviceFingerprint(req);
  
  // Create comprehensive device information
  const deviceInfo: EnhancedDeviceInfo = {
    // Network Information
    ipAddress: networkInfo.primary,
    realIP: networkInfo.realIP,
    forwardedIP: networkInfo.forwardedIP,
    cloudflareIP: networkInfo.cloudflareIP,
    xRealIP: networkInfo.realIP,
    remoteAddress: networkInfo.remoteAddress,
    port: req.socket.remotePort || 0,
    protocol: req.protocol,
    
    // Device Fingerprinting
    userAgent: req.headers['user-agent'] || 'N/A',
    acceptLanguage: req.headers['accept-language'] || 'N/A',
    acceptEncoding: req.headers['accept-encoding'] || 'N/A',
    acceptCharset: req.headers['accept-charset'] || 'N/A',
    accept: req.headers['accept'] || 'N/A',
    connection: req.headers['connection'] || 'N/A',
    dnt: req.headers['dnt'] || 'N/A',
    upgradeInsecureRequests: req.headers['upgrade-insecure-requests'] || 'N/A',
    secFetchSite: req.headers['sec-fetch-site'] || 'N/A',
    secFetchMode: req.headers['sec-fetch-mode'] || 'N/A',
    secFetchUser: req.headers['sec-fetch-user'] || 'N/A',
    secFetchDest: req.headers['sec-fetch-dest'] || 'N/A',
    secChUa: req.headers['sec-ch-ua'] || 'N/A',
    secChUaMobile: req.headers['sec-ch-ua-mobile'] || 'N/A',
    secChUaPlatform: req.headers['sec-ch-ua-platform'] || 'N/A',
    secChUaFullVersion: req.headers['sec-ch-ua-full-version'] || 'N/A',
    secChUaFullVersionList: req.headers['sec-ch-ua-full-version-list'] || 'N/A',
    
    // Advanced Device Detection
    screenResolution: req.headers['x-screen-resolution'] || 'N/A',
    colorDepth: req.headers['x-color-depth'] || 'N/A',
    timezone: req.headers['x-timezone'] || 'N/A',
    language: req.headers['x-language'] || 'N/A',
    platform: req.headers['x-platform'] || 'N/A',
    hardwareConcurrency: req.headers['x-hardware-concurrency'] || 'N/A',
    deviceMemory: req.headers['x-device-memory'] || 'N/A',
    maxTouchPoints: req.headers['x-max-touch-points'] || 'N/A',
    
    // Network Fingerprinting
    via: req.headers['via'] || 'N/A',
    xForwardedProto: req.headers['x-forwarded-proto'] || 'N/A',
    xForwardedPort: req.headers['x-forwarded-port'] || 'N/A',
    xForwardedHost: req.headers['x-forwarded-host'] || 'N/A',
    xOriginalHost: req.headers['x-original-host'] || 'N/A',
    host: req.headers['host'] || 'N/A',
    referer: req.headers['referer'] || 'N/A',
    origin: req.headers['origin'] || 'N/A',
    cacheControl: req.headers['cache-control'] || 'N/A',
    pragma: req.headers['pragma'] || 'N/A',
    
    // Security Headers
    authorization: req.headers['authorization'] ? '[REDACTED]' : 'N/A',
    xRequestedWith: req.headers['x-requested-with'] || 'N/A',
    xCsrfToken: req.headers['x-csrf-token'] ? '[REDACTED]' : 'N/A',
    cookie: req.headers['cookie'] ? '[REDACTED]' : 'N/A',
    xApiKey: req.headers['x-api-key'] ? '[REDACTED]' : 'N/A',
    xAuthToken: req.headers['x-auth-token'] ? '[REDACTED]' : 'N/A',
    
    // System Information
    socketRemoteAddress: req.socket.remoteAddress || 'N/A',
    socketRemoteFamily: req.socket.remoteFamily || 'N/A',
    socketRemotePort: req.socket.remotePort || 0,
    socketLocalAddress: req.socket.localAddress || 'N/A',
    socketLocalPort: req.socket.localPort || 0,
    
    // MAC Address Detection
    macAddress: networkInfo.macAddress,
    networkInterface: networkInfo.networkInterface,
    
    // Threat Assessment
    threatLevel: threatAnalysis.level,
    threatIndicators: threatAnalysis.indicators,
    
    // Unique Fingerprints
    deviceFingerprint: deviceFingerprint,
    networkFingerprint: crypto.createHash('sha256').update(networkInfo.primary + networkInfo.macAddress).digest('hex'),
    combinedFingerprint: crypto.createHash('sha256').update(deviceFingerprint + networkInfo.primary + networkInfo.macAddress).digest('hex')
  };
  
  // Create enhanced honeypot attempt
  const attempt: EnhancedHoneypotAttempt = {
    timestamp,
    attemptId,
    deviceInfo,
    requestDetails: {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      query: JSON.stringify(req.query),
      httpVersion: req.httpVersion,
      contentType: req.headers['content-type'] || 'N/A',
      contentLength: req.headers['content-length'] || 'N/A',
      bodyData: req.body || null
    },
    headers: req.headers as Record<string, string>,
    threatAnalysis
  };
  
  // Log the enhanced attempt
  await logEnhancedHoneypotAttempt(attempt);
  
  // Send enhanced honeypot response
  res.status(200).json({
    success: false,
    message: 'محاولة وصول غير مشروع تم رصدها وتسجيلها - نظام الحماية الأمني المتطور فعال',
    warning: 'هذا النظام محمي بواسطة تقنيات الأمان المتطورة التي طورها المهندس فرناندو دي أراندا رحمه الله',
    enhanced_security_alert: {
      status: 'ENHANCED_BREACH_DETECTED',
      ip_logged: deviceInfo.ipAddress,
      mac_address_logged: deviceInfo.macAddress,
      device_fingerprint: deviceInfo.deviceFingerprint,
      network_fingerprint: deviceInfo.networkFingerprint,
      combined_fingerprint: deviceInfo.combinedFingerprint,
      threat_level: threatAnalysis.level,
      risk_score: threatAnalysis.riskScore,
      threat_indicators: threatAnalysis.indicators,
      timestamp: timestamp,
      attempt_id: attemptId,
      action: 'تم تسجيل محاولة الوصول في قواعد بيانات الأمان الوطنية المتطورة',
      consequences: 'سيتم إبلاغ الجهات الأمنية المختصة فوراً وفقاً للبروتوكولات الأمنية المتطورة',
      legal_notice: 'محاولة اختراق الأنظمة الحكومية جريمة يعاقب عليها القانون السوري بالسجن من 5-15 سنة',
      next_steps: 'تم إرسال تقرير فوري لوزارة الداخلية والأمن العام مع جميع التفاصيل التقنية'
    },
    device_information_captured: {
      ip_address: deviceInfo.ipAddress,
      mac_address: deviceInfo.macAddress,
      user_agent: deviceInfo.userAgent,
      platform: deviceInfo.platform,
      screen_resolution: deviceInfo.screenResolution,
      color_depth: deviceInfo.colorDepth,
      timezone: deviceInfo.timezone,
      language: deviceInfo.language,
      hardware_concurrency: deviceInfo.hardwareConcurrency,
      device_memory: deviceInfo.deviceMemory,
      max_touch_points: deviceInfo.maxTouchPoints,
      network_interface: deviceInfo.networkInterface
    },
    tracking_info: {
      session_id: attemptId,
      logged_ip: deviceInfo.ipAddress,
      all_ips_logged: [deviceInfo.cloudflareIP, deviceInfo.realIP, deviceInfo.forwardedIP, deviceInfo.remoteAddress],
      mac_address: deviceInfo.macAddress,
      device_fingerprint: deviceInfo.deviceFingerprint,
      network_fingerprint: deviceInfo.networkFingerprint,
      combined_fingerprint: deviceInfo.combinedFingerprint,
      tracking_timestamp: timestamp,
      log_location: 'مسجل في قواعد البيانات الأمنية الوطنية المتطورة',
      alert_sent: true,
      authorities_notified: true,
      enhanced_monitoring: true
    },
    timestamp: timestamp
  });
};

export default { enhancedHoneypotHandler, logEnhancedHoneypotAttempt }; 