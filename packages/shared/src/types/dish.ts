import type { MediaItem } from './media';

export interface Dish {
    id: number;
    name: string;
    rating: string;
    notes: string | null;
    user: { id: number; name: string } | null;
    images: MediaItem[];
}
