import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Business submissions schema
export const businessSubmissions = pgTable("business_submissions", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  establishmentDate: text("establishment_date"),
  employeesCount: text("employees_count").notNull(),
  address: text("address").notNull(),
  governorate: text("governorate").notNull(),
  registrationNumber: text("registration_number"),
  contactName: text("contact_name").notNull(),
  position: text("position").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  alternativeContact: text("alternative_contact"),
  website: text("website"),
  challenges: text("challenges").array().notNull(),
  challengeDetails: text("challenge_details").notNull(),
  techNeeds: text("tech_needs").array().notNull(),
  techDetails: text("tech_details"),
  consentToDataUse: boolean("consent_to_data_use").notNull(),
  wantsUpdates: boolean("wants_updates").notNull().default(false),
  additionalComments: text("additional_comments"),
  sanctionedCompanyName: text("sanctioned_company_name"),
  sanctionedCompanyLink: text("sanctioned_company_link"),
  captchaAnswer: text("captcha_answer"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for local authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").notNull().unique(),
  password: varchar("password").notNull(),
  name: varchar("name"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Business submission validation schema
export const BusinessSubmissionSchema = z.object({
  businessName: z.string().min(1, { message: "اسم الشركة مطلوب" }),
  businessType: z.string().min(1, { message: "نوع النشاط مطلوب" }),
  establishmentDate: z.string().optional(),
  employeesCount: z.string().min(1, { message: "عدد الموظفين مطلوب" }),
  address: z.string().min(1, { message: "العنوان مطلوب" }),
  governorate: z.string().min(1, { message: "المحافظة مطلوبة" }),
  registrationNumber: z.string().optional(),
  contactName: z.string().min(1, { message: "اسم المسؤول مطلوب" }),
  position: z.string().min(1, { message: "المنصب مطلوب" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z.string().min(1, { message: "رقم الهاتف مطلوب" }),
  alternativeContact: z.string().optional(),
  website: z.string().optional(),
  challenges: z.array(z.string()).min(1, { message: "يرجى اختيار تحدي واحد على الأقل" }),
  challengeDetails: z.string().min(1, { message: "تفاصيل التحديات مطلوبة" }),
  techNeeds: z.array(z.string()).min(1, { message: "يرجى اختيار احتياج تقني واحد على الأقل" }),
  techDetails: z.string().optional(),
  consentToDataUse: z.boolean().refine(val => val === true, { message: "يجب الموافقة على استخدام البيانات" }),
  wantsUpdates: z.boolean().default(false),
  additionalComments: z.string().optional(),
  sanctionedCompanyName: z.string().optional(),
  sanctionedCompanyLink: z.string().optional(),
  captchaAnswer: z.string().min(1, { message: "الإجابة على سؤال التحقق مطلوبة" }),
});

// Insert schemas
export const insertBusinessSubmissionSchema = createInsertSchema(businessSubmissions).omit({
  id: true,
  createdAt: true,
  status: true
});

// User validation schema
export const UserSchema = z.object({
  username: z.string()
    .min(3, { message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" })
    .max(50, { message: "اسم المستخدم يجب أن لا يتجاوز 50 حرف" }),
  password: z.string()
    .min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
      { message: "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص على الأقل" }
    ),
  name: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

export const LoginSchema = z.object({
  username: z.string().min(1, { message: "اسم المستخدم مطلوب" }),
  password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Types
export type BusinessSubmission = typeof businessSubmissions.$inferSelect;
export type InsertBusinessSubmission = z.infer<typeof insertBusinessSubmissionSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof LoginSchema>;
