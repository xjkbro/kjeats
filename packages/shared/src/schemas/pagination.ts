import { z } from 'zod';

export function paginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
    return z.object({
        data: z.array(itemSchema),
        meta: z.object({
            current_page: z.number(),
            last_page: z.number(),
            per_page: z.number(),
            total: z.number(),
        }),
    });
}
