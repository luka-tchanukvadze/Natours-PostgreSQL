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

    passwordConfirm: z
      .string({ message: 'Password confirmation is required' })
      .min(8),

    passwordChangedAt: z.date().optional(),

    passwordResetToken: z.string().optional(),

    passwordResetExpires: z.date().optional(),

    active: z.boolean().optional().default(true),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords are not the same',
    path: ['passwordConfirm'],
  });
