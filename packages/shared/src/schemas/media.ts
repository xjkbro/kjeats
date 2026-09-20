import { z } from 'zod';

export const mediaItemSchema = z.object({
    id: z.number(),
    url: z.string(),
    original_name: z.string(),
    user_id: z.number(),
    created_at: z.string(),
});

export type MediaItemDTO = z.infer<typeof mediaItemSchema>;
