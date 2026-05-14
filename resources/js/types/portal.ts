export interface Dish {
    id: number;
    name: string;
    rating: string;
    notes: string | null;
}

export interface Restaurant {
    id: number;
    emoji: string;
    name: string;
    cuisine: string;
    location: string;
    date_visited: string;
    overall_rating: string;
    price_range: string;
    review: string | null;
    tags: string[];
    atmosphere_rating: number;
    service_rating: number;
    value_rating: number;
    dishes: Dish[];
    group_id: number | null;
    group?: { id: number; name: string } | null;
    revisions?: Revision[];
}

export interface RecipeIngredient {
    id: number;
    amount: string;
    unit: string;
    name: string;
    sort_order: number;
}

export interface RecipeStep {
    id: number;
    step_number: number;
    instruction: string;
}

export interface RecipeNutrition {
    id: number;
    serving_size: string | null;
    servings_per_container: number | null;
    calories: number | null;
    calories_from_fat: number | null;
    total_fat_g: string | null;
    total_fat_pct: number | null;
    saturated_fat_g: string | null;
    saturated_fat_pct: number | null;
    trans_fat_g: string | null;
    polyunsaturated_fat_g: string | null;
    monounsaturated_fat_g: string | null;
    cholesterol_mg: string | null;
    cholesterol_pct: number | null;
    sodium_mg: string | null;
    sodium_pct: number | null;
    total_carbohydrate_g: string | null;
    total_carbohydrate_pct: number | null;
    dietary_fiber_g: string | null;
    dietary_fiber_pct: number | null;
    soluble_fiber_g: string | null;
    insoluble_fiber_g: string | null;
    total_sugars_g: string | null;
    added_sugars_g: string | null;
    added_sugars_pct: number | null;
    protein_g: string | null;
    vitamin_d_mcg: string | null;
    vitamin_d_pct: number | null;
    calcium_mg: string | null;
    calcium_pct: number | null;
    iron_mg: string | null;
    iron_pct: number | null;
    potassium_mg: string | null;
    potassium_pct: number | null;
}

export interface Recipe {
    id: number;
    emoji: string;
    name: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string | null;
    prep_time: number;
    cook_time: number;
    rest_time: number;
    servings: number;
    tags: string[];
    ingredients: RecipeIngredient[];
    steps: RecipeStep[];
    nutrition: RecipeNutrition | null;
    group_id: number | null;
    group?: { id: number; name: string } | null;
    revisions?: Revision[];
}

export interface Revision {
    id: number;
    user: { name: string };
    summary: string;
    created_at: string;
    snapshot: Record<string, unknown>;
}

export interface GroupMember {
    id: number;
    user_id: number;
    role: 'owner' | 'member';
    user: { id: number; name: string; email: string };
}

export interface Group {
    id: number;
    name: string;
    description: string | null;
    invite_code: string;
    group_members?: GroupMember[];
    restaurants?: Restaurant[];
    recipes?: Recipe[];
    group_members_count?: number;
    restaurants_count?: number;
    recipes_count?: number;
}

export interface FeedItemRestaurant {
    type: 'restaurant';
    id: number;
    emoji: string;
    name: string;
    cuisine: string;
    location: string;
    date_visited: string;
    overall_rating: string;
    price_range: string;
    user: { name: string };
    created_at: string;
}

export interface FeedItemRecipe {
    type: 'recipe';
    id: number;
    emoji: string;
    name: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    total_time: number;
    user: { name: string };
    created_at: string;
}

export type FeedItem = FeedItemRestaurant | FeedItemRecipe;
