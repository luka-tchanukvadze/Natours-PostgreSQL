const { z } = require('zod');

exports.tourSchema = z
  .object({
    name: z
      .string({ message: 'Name must be a string' })
      .min(2, { message: 'Name is too short' })
      .max(15, { message: 'Name is too long' }),

    duration: z
      .number({ message: 'Duration must be a number' })
      .int()
      .positive({ message: 'Duration must be positive' }),

    max_group_size: z
      .number()
      .int()
      .positive({ message: 'Group size must be positive' }),

    price: z
      .number({ message: 'Price is required' })
      .positive({ message: 'Price must be positive' }),

    price_discount: z
      .number({ message: 'Discount must be a number' })
      .optional(),

    summary: z.string().min(1, { message: 'Summary is too short' }),

    description: z.string().min(1),

    image_cover: z.string().min(1),

    images: z.array(z.string()).optional(),

    start_dates: z.array(z.string()).optional(),

    // --- Added missing fields from PSQL Schema ---

    rating: z
      .number({ message: 'Rating must be a number' })
      .min(1, { message: 'Rating must be at least 1' })
      .max(5, { message: 'Rating must be at most 5' })
      .optional(),

    ratings_quantity: z
      .number({ message: 'Ratings quantity must be a number' })
      .int()
      .nonnegative({ message: 'Ratings quantity cannot be negative' })
      .optional(),

    slug: z.string().optional(),

    difficulty: z.enum(['easy', 'medium', 'difficult'], {
      errorMap: () => ({
        message: 'Difficulty must be easy, medium, or difficult',
      }),
    }),

    secret_tour: z.boolean().optional(),

    start_location_type: z.literal('Point').optional(),

    start_location_coordinates: z
      .array(z.number({ message: 'Coordinates must be numbers' }))
      .optional(),

    start_location_address: z.string().optional(),

    start_location_description: z.string().optional(),

    locations: z
      .array(
        z.object({
          type: z.literal('Point').optional(),
          coordinates: z.array(z.number()),
          address: z.string().optional(),
          description: z.string().optional(),
          day: z.number().int().optional(),
        }),
      )
      .optional(),

    guides: z.array(z.number()).optional(),

    created_at: z.string().optional(),
  })
  .refine(
    (data) =>
      data.price_discount === undefined || data.price_discount < data.price,
    {
      message: 'Discount price must be lower than the price',
      path: ['price_discount'],
    },
  );
