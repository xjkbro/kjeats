export interface FeedUser {
    name: string;
    avatar_url: string | null;
}

export interface FeedDish {
    name: string;
    rating: string;
    image_url: string | null;
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
    review: string | null;
    image_url: string | null;
    dishes: FeedDish[];
    user: FeedUser;
    created_at: string;
}

export interface FeedItemRecipe {
    type: 'recipe';
    id: number;
    emoji: string;
    name: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string | null;
    total_time: number;
    image_url: string | null;
    ingredients: string[];
    user: FeedUser;
    created_at: string;
}

export interface FeedItemWantToTry {
    type: 'want_to_try';
    id: number;
    emoji: string;
    name: string;
    cuisine: string | null;
    location: string | null;
    notes: string | null;
    user: FeedUser;
    created_at: string;
}

export interface FeedItemDishRating {
    type: 'dish_rating';
    id: number;
    name: string;
    rating: string;
    notes: string | null;
    image_url: string | null;
    restaurant_id: number;
    restaurant_name: string;
    restaurant_emoji: string;
    restaurant_owner: string;
    user: FeedUser;
    created_at: string;
}

export type FeedItem = FeedItemRestaurant | FeedItemRecipe | FeedItemWantToTry | FeedItemDishRating;

export interface FeedStats {
    restaurant_count: number;
    recipe_count: number;
    avg_rating: number;
    total_dishes: number;
}
