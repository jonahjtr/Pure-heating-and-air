import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

export const urlSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true; // Allow empty
      // Allow relative URLs
      if (val.startsWith('/')) return true;
      // Allow mailto: and tel:
      if (val.startsWith('mailto:') || val.startsWith('tel:')) return true;
      // Check for valid URL
      try {
        new URL(val);
        return true;
      } catch {
        // Check if adding https:// makes it valid
        try {
          new URL('https://' + val);
          return true;
        } catch {
          return false;
        }
      }
    },
    { message: 'Please enter a valid URL' }
  );

export const requiredUrlSchema = urlSchema.refine((val) => val.length > 0, {
  message: 'URL is required',
});

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be less than 100 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase letters, numbers, and hyphens only'
  );

export const titleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(200, 'Title must be less than 200 characters');

export const descriptionSchema = z
  .string()
  .trim()
  .max(1000, 'Description must be less than 1000 characters')
  .optional();

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be less than 72 characters');

export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^[\d\s\-+()]+$/,
    'Please enter a valid phone number'
  )
  .optional()
  .or(z.literal(''));

// Validation helper functions
export function validateEmail(email: string): { valid: boolean; message?: string } {
  const result = emailSchema.safeParse(email);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, message: result.error.errors[0]?.message };
}

export function validateUrl(url: string): { valid: boolean; message?: string } {
  const result = urlSchema.safeParse(url);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, message: result.error.errors[0]?.message };
}

export function validateSlug(slug: string): { valid: boolean; message?: string } {
  const result = slugSchema.safeParse(slug);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, message: result.error.errors[0]?.message };
}

export function validateRequired(value: string, fieldName: string): { valid: boolean; message?: string } {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}