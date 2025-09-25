import { Roles } from "@/types/auth";
import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: "Invalid email address",
  }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z
      .string()
      .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: "Invalid email address",
      }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Role selection schema
export const roleSelectionSchema = z.object({
  roleId: z
    .nativeEnum(Roles)
    .refine((val) => val === Roles.STUDENT || val === Roles.TEACHER, {
      message: "Please select a valid role",
    }),
});

export type RoleFormData = z.infer<typeof roleSelectionSchema>;

// Role schema
export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// API Response schemas
export const userSchema = z.object({
  userId: z.number(),
  username: z.string(),
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: "Invalid email address",
  }),
  roles: z.array(roleSchema),
  isActive: z.boolean(),
  bannerUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

export const authResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    user: userSchema,
    refreshToken: z.string(),
  }),
  message: z.string(),
  status: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
export type User = z.infer<typeof userSchema>;

export const ROLE_OPTIONS = [
  { id: Roles.STUDENT, name: Roles.STUDENT, label: "Student" },
  { id: Roles.TEACHER, name: Roles.TEACHER, label: "Teacher" },
  { id: Roles.GUEST, name: Roles.GUEST, label: "Guest" },
] as const;
