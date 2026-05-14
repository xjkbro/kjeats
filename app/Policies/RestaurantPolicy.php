<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\Restaurant;
use App\Models\User;

class RestaurantPolicy
{
    private function sharesConfiguredGroup(User $user, Restaurant $restaurant): bool
    {
        $groupId = (int) config('app.frontend_group_id', 0);

        if ($groupId === 0) {
            return false;
        }

        $group = Group::find($groupId);

        return $group && $group->isMember($user) && $group->isMember($restaurant->user);
    }

    public function view(User $user, Restaurant $restaurant): bool
    {
        if ($user->id === $restaurant->user_id) {
            return true;
        }

        if ($restaurant->group_id !== null && $restaurant->group?->isMember($user)) {
            return true;
        }

        return $this->sharesConfiguredGroup($user, $restaurant);
    }

    public function update(User $user, Restaurant $restaurant): bool
    {
        if ($user->id === $restaurant->user_id) {
            return true;
        }

        if ($restaurant->group_id !== null && $restaurant->group?->isMember($user)) {
            return true;
        }

        return $this->sharesConfiguredGroup($user, $restaurant);
    }

    public function delete(User $user, Restaurant $restaurant): bool
    {
        return $user->id === $restaurant->user_id;
    }
}
