import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import xss from "xss-clean";
import cookieParser from "cookie-parser";
import csrf from "tiny-csrf";
import crypto from "crypto";

const app = express();

// Enable trust proxy for production environments
app.set('trust proxy', 1);

// Set security HTTP headers with stronger CSP configuration
// Different configs for production vs development
const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: isProduction 
        ? ["'self'"] // Production - strict
        : ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Dev - allow for hot reloading
      connectSrc: isProduction
        ? ["'self'"]
        : ["'self'", "wss:", "ws:"], // Dev needs WebSockets for hot reloading
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"], // Prevent <object>, <embed>, and <applet> elements
      ...(isProduction ? { upgradeInsecureRequests: [] } : {}), // Auto-upgrade HTTP to HTTPS in production
      frameAncestors: ["'none'"] // Prevents site from being embedded in iframes (clickjacking protection)
    },
  },
  // Enable other security headers
  referrerPolicy: { policy: 'same-origin' },
  xssFilter: true,
  hsts: isProduction, // HTTP Strict Transport Security - only in production
}));

// General API rate limiting
const apiLimiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'لقد تجاوزت الحد المسموح به من الطلبات، يرجى المحاولة مرة أخرى لاحقًا',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiting for login attempts to prevent brute force attacks
const loginLimiter = rateLimit({
  max: 5, // 5 login attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'تم تجاوز محاولات تسجيل الدخول، يرجى المحاولة مرة أخرى بعد 15 دقيقة',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);
app.use('/api/login', loginLimiter); // Stricter limits for login endpoint

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Generate a cookie secret for signing cookies
const COOKIE_SECRET = process.env.COOKIE_SECRET || (process.env.NODE_ENV === 'development'
  ? 'syrian-ministry-platform-cookie-secret-dev-only'
  : crypto.randomBytes(16).toString('hex'));

// Parse cookies for CSRF protection with signing secret
app.use(cookieParser(COOKIE_SECRET));

// CSRF protection
// Generate a strong random CSRF secret
let CSRF_SECRET: string;

if (process.env.CSRF_SECRET) {
  CSRF_SECRET = process.env.CSRF_SECRET;
} else {
  // Generate a secure random CSRF secret on deployment
  // This allows secure deployment without requiring environment variables
  console.log('Generating random CSRF_SECRET for this deployment');
  const randomBytes = crypto.randomBytes(16); // 16 bytes = 32 hex chars
  CSRF_SECRET = randomBytes.toString('hex');
}

app.use(csrf(CSRF_SECRET, ['POST', 'PUT', 'DELETE', 'PATCH']));

// Make CSRF token available
app.use((req, res, next) => {
  // Add CSRF token to response headers for frontend access
  res.header('CSRF-Token', req.csrfToken());
  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
