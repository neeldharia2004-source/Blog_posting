import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required").max(100, "Name is too long"),
  description: z.string().optional().nullable(),
});

export const sectionSchema = z.object({
  companyId: z.string().uuid("Invalid company ID").optional(),
  name: z.string().min(1, "Section name is required").max(100, "Name is too long"),
  description: z.string().optional().nullable(),
});

export const productSchema = z.object({
  sectionId: z.string().uuid("Invalid section ID").optional(),
  name: z.string().min(1, "Product name is required").max(100, "Name is too long"),
  description: z.string().optional().nullable(),
});

export const projectSchema = z.object({
  companyId: z.string().uuid("Invalid company ID").optional(),
  name: z.string().min(1, "Project name is required").max(120, "Name is too long"),
  description: z.string().optional().nullable(),
});

export type CompanyInput = z.infer<typeof companySchema>;
export type SectionInput = z.infer<typeof sectionSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
