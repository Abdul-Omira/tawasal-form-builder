import { Express, Request, Response, NextFunction } from 'express';
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { User, InsertUser, LoginSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function setupAuth(app: Express) {
  // Set up sessions with PostgreSQL store
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'syria-min-communications-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));
  
  // Set up Passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await storage.validateUser({ username, password });
        if (!user) {
          return done(null, false, { message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Set up serialization/deserialization
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user || undefined);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post('/api/login', (req, res, next) => {
    try {
      // Validate request body
      const parseResult = LoginSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "بيانات الدخول غير صحيحة", 
          errors: validationError.details 
        });
      }
      
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return res.status(401).json({ message: info?.message || 'فشل تسجيل الدخول' });
        }
        
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          
          return res.status(200).json({
            id: user.id,
            username: user.username,
            name: user.name,
            isAdmin: user.isAdmin
          });
        });
      })(req, res, next);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  app.post('/api/register', async (req, res, next) => {
    try {
      // Only allow registration in development mode or by admins
      if (process.env.NODE_ENV === 'production' && (!req.user || !req.user.isAdmin)) {
        return res.status(403).json({ message: "غير مسموح بالتسجيل" });
      }
      
      // Check if username exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم مستخدم بالفعل" });
      }
      
      // Create user
      const user = await storage.createUser(req.body);
      
      // Auto login the user
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user without password
        return res.status(201).json({
          id: user.id,
          username: user.username,
          name: user.name,
          isAdmin: user.isAdmin
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "بيانات التسجيل غير صحيحة", 
          errors: validationError.details 
        });
      }
      
      console.error("Registration error:", error);
      return res.status(500).json({ message: "حدث خطأ أثناء التسجيل" });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
      }
      
      res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "غير مصرح" });
    }
    
    const user = req.user;
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      isAdmin: user.isAdmin
    });
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: "غير مصرح" });
};

// Middleware to check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.isAdmin) {
    return next();
  }
  
  res.status(403).json({ message: "غير مسموح" });
};