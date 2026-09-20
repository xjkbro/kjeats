import type { Dish } from './dish';
import type { MediaItem } from './media';
import type { Revision } from './revision';

export interface Restaurant {
    id: number;
    emoji: string;
    name: string;
    cuisine: string;
    location: string;
    date_visited: string;
    visit_dates: string[];
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
    images: MediaItem[];
}
