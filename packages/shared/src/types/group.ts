import type { Recipe } from './recipe';
import type { Restaurant } from './restaurant';

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
