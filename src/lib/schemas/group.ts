import { z } from "zod";

export const createStudyGroupSchema = z.object({
  name: z.string().min(6, "Group name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 3 characters"),
  memberLimit: z.number().min(1).max(50),
  public: z.boolean(),
});

export type CreateStudyGroupFormData = z.infer<typeof createStudyGroupSchema>;

export const updateStudyGroupSchema = z.object({
  publicId: z.string().min(6, "Group name must be at least 3 characters"),
  name: z.string().min(6, "Group name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 3 characters"),
  memberLimit: z.number().min(1).max(50),
  public: z.boolean(),
});

export type UpdateStudyGroupFormData = z.infer<typeof updateStudyGroupSchema>;
