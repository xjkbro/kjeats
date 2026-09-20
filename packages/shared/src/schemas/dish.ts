import { z } from 'zod';
import { mediaItemSchema } from './media';
import { userSummarySchema } from './user';

export const dishSchema = z.object({
    id: z.number(),
    name: z.string(),
    rating: z.string(),
    notes: z.string().nullable(),
    user: userSummarySchema.nullable(),
    images: z.array(mediaItemSchema),
});

export const dishPayloadSchema = z.object({
    name: z.string().min(1).max(255),
    rating: z.string().regex(/^\d(\.\d)?$/),
    notes: z.string().nullable(),
});

export type DishDTO = z.infer<typeof dishSchema>;
export type DishPayload = z.infer<typeof dishPayloadSchema>;
