<?php

namespace App\Policies;

use App\Models\Restaurant;
use App\Models\User;

class RestaurantPolicy
{
    public function view(User $user, Restaurant $restaurant): bool
    {
        if ($user->id === $restaurant->user_id) {
            return true;
        }

        return $restaurant->group_id !== null && $restaurant->group?->isMember($user);
    }

    public function update(User $user, Restaurant $restaurant): bool
    {
        if ($user->id === $restaurant->user_id) {
            return true;
        }

        return $restaurant->group_id !== null && $restaurant->group?->isMember($user);
    }

    public function delete(User $user, Restaurant $restaurant): bool
    {
        return $user->id === $restaurant->user_id;
    }
}
