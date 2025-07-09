import { z } from 'zod'

// Password validation schema with strength requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

// Sign in form schema
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

// Register form schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s-()]+$/.test(val), {
      message: 'Please enter a valid phone number',
    }),
  location: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: 'Location must be at least 2 characters long',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

// Password strength calculation
export const getPasswordStrength = (password: string): {
  score: number
  feedback: string
  color: string
} => {
  let score = 0
  let feedback = ''
  let color = 'bg-red-500'

  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  switch (score) {
    case 0:
    case 1:
      feedback = 'Very weak'
      color = 'bg-red-500'
      break
    case 2:
      feedback = 'Weak'
      color = 'bg-red-400'
      break
    case 3:
      feedback = 'Fair'
      color = 'bg-yellow-500'
      break
    case 4:
      feedback = 'Good'
      color = 'bg-blue-500'
      break
    case 5:
      feedback = 'Strong'
      color = 'bg-green-500'
      break
  }

  return { score, feedback, color }
}

// Type exports
export type SignInFormData = z.infer<typeof signInSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>