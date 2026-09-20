import { z } from 'zod';
import { dishSchema } from './dish';
import { mediaItemSchema } from './media';

export const restaurantSchema = z.object({
    id: z.number(),
    emoji: z.string(),
    name: z.string(),
    cuisine: z.string(),
    location: z.string(),
    date_visited: z.string(),
    visit_dates: z.array(z.string()),
    overall_rating: z.string(),
    price_range: z.string(),
    review: z.string().nullable(),
    tags: z.array(z.string()),
    atmosphere_rating: z.number(),
    service_rating: z.number(),
    value_rating: z.number(),
    dishes: z.array(dishSchema),
    group_id: z.number().nullable(),
    group: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
    images: z.array(mediaItemSchema),
});

export const restaurantPayloadSchema = z.object({
    emoji: z.string(),
    name: z.string().min(1).max(255),
    cuisine: z.string().max(255),
    location: z.string().max(255),
    date_visited: z.string(),
    visit_dates: z.array(z.string()),
    overall_rating: z.string().regex(/^\d(\.\d)?$/),
    price_range: z.string().max(4),
    review: z.string().nullable(),
    tags: z.array(z.string()),
    atmosphere_rating: z.number(),
    service_rating: z.number(),
    value_rating: z.number(),
    group_id: z.number().nullable(),
});

export type RestaurantDTO = z.infer<typeof restaurantSchema>;
export type RestaurantPayload = z.infer<typeof restaurantPayloadSchema>;
