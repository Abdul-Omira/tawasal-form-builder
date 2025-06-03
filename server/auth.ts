import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, loginAttempts } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";

// Make TypeScript understand User in the Express session
declare global {
  namespace Express {
    interface User extends Omit<User, 'password'> {}
  }
}

const scryptAsync = promisify(scrypt);

// Function to hash passwords
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Function to compare passwords
export async function comparePasswords(supplied: string, stored: string) {
  try {
    // Log for debugging with partial masking of passwords for security
    console.log(`Comparing passwords: ${supplied.substring(0, 3)}*** with stored: ${stored.substring(0, 10)}***`);
    
    // Handle different password formats
    if (!stored.includes('.')) {
      console.error('Password format is invalid, no salt separator found');
      return false;
    }

    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    // Use timing-safe comparison to prevent timing attacks
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Initialize PostgreSQL session store
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    pool,
    tableName: 'sessions',
    createTableIfMissing: true
  });

  // In production, SESSION_SECRET must be set in environment variables
  // For development, we provide a fallback value
  const SESSION_SECRET = process.env.SESSION_SECRET || (process.env.NODE_ENV === 'development'
    ? 'syrian-ministry-tech-platform-session-secret-dev-only'
    : (()=>{
        console.error('SESSION_SECRET environment variable is required in production');
        process.exit(1);
      })());

  const sessionSettings: session.SessionOptions = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      sameSite: 'strict' // Provides additional CSRF protection
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Add JWT verification middleware
  import('./jwtMiddleware').then(({ verifyJwtToken }) => {
    app.use(verifyJwtToken);
  }).catch(error => {
    console.error('Error importing JWT middleware:', error);
  });

  // Configure local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Login attempt for username: ${username}`);
        
        // Look up user by username
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false, { message: "اسم المستخدم غير موجود" });
        }
        
        console.log(`User found: ${username}, validating password...`);
        
        // Use secure password comparison for all users
        const passwordValid = await comparePasswords(password, user.password);
        if (!passwordValid) {
          console.log(`Invalid password for user: ${username}`);
          return done(null, false, { message: "كلمة المرور غير صحيحة" });
        }
        
        console.log(`Login successful for user: ${username}`);
        
        // Don't return the password
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        console.error('Login error:', error);
        return done(error);
      }
    })
  );

  // Serialize user to the session
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      if (!user) {
        return done(null, false);
      }
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error, null);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res) => {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Create the user
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      // Log the user in
      req.login(userResponse, (err) => {
        if (err) {
          return res.status(500).json({ message: "خطأ في تسجيل الدخول" });
        }
        return res.status(201).json(userResponse);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "خطأ في إنشاء الحساب" });
    }
  });

  // Login endpoint with JWT
  app.post("/api/login", async (req, res, next) => {
    // Track login attempt
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceFingerprint = req.headers['x-device-fingerprint'] as string || 'unknown';
    
    // Log the attempt to database
    try {
      await db.insert(loginAttempts).values({
        username: req.body.username,
        ipAddress,
        userAgent,
        deviceFingerprint,
        success: false,
        attemptTime: new Date()
      });
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
    
    passport.authenticate("local", async (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "فشل تسجيل الدخول" });
      }
      
      // Update successful login
      try {
        await db.insert(loginAttempts).values({
          username: req.body.username,
          ipAddress,
          userAgent,
          deviceFingerprint,
          success: true,
          attemptTime: new Date()
        });
      } catch (error) {
        console.error('Error logging successful login:', error);
      }
      
      import('./jwt').then(({ generateToken }) => {
        // Generate a JWT token
        const token = generateToken(user);
        
        // Login with passport for session-based auth (as a backup)
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          
          // Return user data with token
          return res.status(200).json({
            ...user,
            token
          });
        });
      }).catch(error => {
        console.error('Error importing JWT module:', error);
        
        // Fallback to regular session-based auth
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.status(200).json(user);
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    // Already authenticated by session or JWT middleware
    if (!req.isAuthenticated() && !req.user) {
      return res.status(401).json({ message: "غير مصرح" });
    }
    
    // If the user has a JWT token in the Authorization header, refresh it if needed
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      import('./jwt').then(({ refreshTokenIfNeeded, extractTokenFromHeader }) => {
        const token = extractTokenFromHeader(authHeader);
        if (token) {
          const refreshedToken = refreshTokenIfNeeded(token);
          if (refreshedToken && refreshedToken !== token) {
            res.setHeader('X-Refresh-Token', refreshedToken);
          }
        }
      }).catch(error => {
        console.error('Error refreshing token:', error);
      });
    }
    
    res.json(req.user);
  });

  // For admin-only routes, create a custom middleware
  app.get("/api/admin/user", isAdmin, (req, res) => {
    // This will only execute if the user is an admin
    res.json({
      id: req.user.id,
      username: req.user.username,
      name: req.user.name,
      isAdmin: req.user.isAdmin,
    });
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  next();
};

// Middleware to check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "ليس لديك صلاحيات كافية" });
  }
  next();
};