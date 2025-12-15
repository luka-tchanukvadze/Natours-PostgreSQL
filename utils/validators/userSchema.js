const { z } = require('zod');

exports.userSchema = z
  .object({
    name: z
      .string({ message: 'Name must be a string' })
      .min(1, { message: 'Name is required' }),

    email: z
      .string({ message: 'Email must be a string' })
      .email({ message: 'Please provide a valid email' }),

    photo: z.string().optional().default('default.jpg'),

    role: z
      .enum(['user', 'guide', 'lead-guide', 'admin'])
      .optional()
      .default('user'),

    password: z
      .string({ message: 'Password must be a string' })
      .min(8, { message: 'Password must be at least 8 characters' }),

    password_confirm: z
      .string({ message: 'Password confirmation is required' })
      .min(8),

    password_changed_at: z.date().optional(),

    password_reset_token: z.string().optional(),

    password_reset_expires: z.date().optional(),

    active: z.boolean().optional().default(true),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords are not the same',
    path: ['passwordConfirm'],
  });
