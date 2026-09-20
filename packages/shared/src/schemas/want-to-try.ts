import { z } from 'zod';

export const wantToTrySchema = z.object({
    id: z.number(),
    user_id: z.number(),
    group_id: z.number().nullable(),
    emoji: z.string(),
    name: z.string(),
    cuisine: z.string().nullable(),
    location: z.string().nullable(),
    notes: z.string().nullable(),
    restaurant_id: z.number().nullable(),
    is_converted: z.boolean(),
});

export const wantToTryPayloadSchema = z.object({
    emoji: z.string(),
    name: z.string().min(1).max(255),
    cuisine: z.string().max(255).nullable(),
    location: z.string().max(255).nullable(),
    notes: z.string().nullable(),
    group_id: z.number().nullable(),
});

export type WantToTryDTO = z.infer<typeof wantToTrySchema>;
export type WantToTryPayload = z.infer<typeof wantToTryPayloadSchema>;
