import { z } from 'zod';

export const userSummarySchema = z.object({
    id: z.number(),
    name: z.string(),
});

export const userSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string().nullable(),
    email: z.string(),
    avatar_url: z.string().nullable(),
    created_at: z.string(),
});

export type UserSummaryDTO = z.infer<typeof userSummarySchema>;
export type UserDTO = z.infer<typeof userSchema>;
