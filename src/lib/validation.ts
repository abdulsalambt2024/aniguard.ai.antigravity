import { z } from 'zod';

// Donation validation
export const donationSchema = z.object({
  amount: z.number()
    .min(1, 'Amount must be at least ₹1')
    .max(1000000, 'Amount must be less than ₹10,00,000'),
  donorName: z.string()
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  message: z.string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
  isAnonymous: z.boolean().optional(),
});

// Chat message validation
export const chatMessageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be less than 5000 characters'),
});

// Chatbot message validation
export const chatbotMessageSchema = z.object({
  message: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters'),
});

// User creation validation
export const createUserSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .regex(/@miet\.ac\.in$/, 'Email must be from @miet.ac.in domain')
    .max(255, 'Email must be less than 255 characters'),
  fullName: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  role: z.enum(['viewer', 'member', 'admin'], {
    errorMap: () => ({ message: 'Invalid role selected' })
  }),
});

// AI Studio validation
export const aiPromptSchema = z.object({
  prompt: z.string()
    .trim()
    .min(3, 'Prompt must be at least 3 characters')
    .max(1000, 'Prompt must be less than 1000 characters'),
});

export const aiEnhanceSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  instruction: z.string()
    .trim()
    .min(3, 'Instruction must be at least 3 characters')
    .max(500, 'Instruction must be less than 500 characters'),
});

// Post validation
export const postSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string()
    .trim()
    .min(1, 'Content cannot be empty')
    .max(10000, 'Content must be less than 10000 characters'),
});

// Event validation
export const eventSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .trim()
    .min(1, 'Description cannot be empty')
    .max(5000, 'Description must be less than 5000 characters'),
  location: z.string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  registrationUrl: z.string()
    .url('Invalid URL')
    .max(500, 'URL must be less than 500 characters')
    .optional(),
});
