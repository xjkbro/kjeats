import { z } from 'zod';
import { userSchema } from './user';

export const loginPayloadSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    remember: z.boolean().optional(),
});

export const loginResponseSchema = z.object({
    token: z.string(),
    user: userSchema,
});

export type LoginPayload = z.infer<typeof loginPayloadSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
