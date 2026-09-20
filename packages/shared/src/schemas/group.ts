import { z } from 'zod';

export const groupMemberSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    role: z.enum(['owner', 'member']),
    user: z.object({ id: z.number(), name: z.string(), email: z.string() }),
});

export const groupSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    invite_code: z.string(),
    group_members_count: z.number().optional(),
    restaurants_count: z.number().optional(),
    recipes_count: z.number().optional(),
});

export type GroupMemberDTO = z.infer<typeof groupMemberSchema>;
export type GroupDTO = z.infer<typeof groupSchema>;
