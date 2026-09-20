import { z } from 'zod';
import { mediaItemSchema } from './media';

export const recipeIngredientSchema = z.object({
    id: z.number(),
    amount: z.string(),
    unit: z.string(),
    name: z.string(),
    sort_order: z.number(),
});

export const recipeStepSchema = z.object({
    id: z.number(),
    step_number: z.number(),
    instruction: z.string(),
});

export const recipeNutritionSchema = z.object({
    id: z.number(),
    serving_size: z.string().nullable(),
    servings_per_container: z.number().nullable(),
    calories: z.number().nullable(),
    calories_from_fat: z.number().nullable(),
    total_fat_g: z.string().nullable(),
    total_fat_pct: z.number().nullable(),
    saturated_fat_g: z.string().nullable(),
    saturated_fat_pct: z.number().nullable(),
    trans_fat_g: z.string().nullable(),
    polyunsaturated_fat_g: z.string().nullable(),
    monounsaturated_fat_g: z.string().nullable(),
    cholesterol_mg: z.string().nullable(),
    cholesterol_pct: z.number().nullable(),
    sodium_mg: z.string().nullable(),
    sodium_pct: z.number().nullable(),
    total_carbohydrate_g: z.string().nullable(),
    total_carbohydrate_pct: z.number().nullable(),
    dietary_fiber_g: z.string().nullable(),
    dietary_fiber_pct: z.number().nullable(),
    soluble_fiber_g: z.string().nullable(),
    insoluble_fiber_g: z.string().nullable(),
    total_sugars_g: z.string().nullable(),
    added_sugars_g: z.string().nullable(),
    added_sugars_pct: z.number().nullable(),
    protein_g: z.string().nullable(),
    vitamin_d_mcg: z.string().nullable(),
    vitamin_d_pct: z.number().nullable(),
    calcium_mg: z.string().nullable(),
    calcium_pct: z.number().nullable(),
    iron_mg: z.string().nullable(),
    iron_pct: z.number().nullable(),
    potassium_mg: z.string().nullable(),
    potassium_pct: z.number().nullable(),
});

export const recipeSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    emoji: z.string(),
    name: z.string(),
    category: z.string(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    description: z.string().nullable(),
    prep_time: z.number(),
    cook_time: z.number(),
    rest_time: z.number(),
    servings: z.number(),
    tags: z.array(z.string()),
    ingredients: z.array(recipeIngredientSchema),
    steps: z.array(recipeStepSchema),
    nutrition: recipeNutritionSchema.nullable(),
    group_id: z.number().nullable(),
    group: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
    images: z.array(mediaItemSchema),
});

export const recipeIngredientPayloadSchema = z.object({
    amount: z.string(),
    unit: z.string(),
    name: z.string().min(1).max(255),
    sort_order: z.number().int(),
});

export const recipeStepPayloadSchema = z.object({
    step_number: z.number().int(),
    instruction: z.string().min(1),
});

export const recipePayloadSchema = z.object({
    emoji: z.string(),
    name: z.string().min(1).max(255),
    category: z.string().max(255),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    description: z.string().nullable(),
    prep_time: z.number().int().min(0),
    cook_time: z.number().int().min(0),
    rest_time: z.number().int().min(0),
    servings: z.number().int().min(1),
    tags: z.array(z.string()),
    ingredients: z.array(recipeIngredientPayloadSchema),
    steps: z.array(recipeStepPayloadSchema),
    group_id: z.number().nullable(),
});

export type RecipeDTO = z.infer<typeof recipeSchema>;
export type RecipePayload = z.infer<typeof recipePayloadSchema>;
