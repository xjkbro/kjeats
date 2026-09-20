export interface WantToTry {
    id: number;
    user_id: number;
    group_id: number | null;
    emoji: string;
    name: string;
    cuisine: string | null;
    location: string | null;
    notes: string | null;
    restaurant_id: number | null;
    is_converted: boolean;
}
