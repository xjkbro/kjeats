<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\Recipe;
use App\Models\User;

class RecipePolicy
{
    private function sharesConfiguredGroup(User $user, Recipe $recipe): bool
    {
        $groupId = (int) config('app.frontend_group_id', 0);

        if ($groupId === 0) {
            return false;
        }

        $group = Group::find($groupId);

        return $group && $group->isMember($user) && $group->isMember($recipe->user);
    }

    public function view(User $user, Recipe $recipe): bool
    {
        if ($user->id === $recipe->user_id) {
            return true;
        }

        if ($recipe->group_id !== null && $recipe->group?->isMember($user)) {
            return true;
        }

        return $this->sharesConfiguredGroup($user, $recipe);
    }

    public function update(User $user, Recipe $recipe): bool
    {
        if ($user->id === $recipe->user_id) {
            return true;
        }

        if ($recipe->group_id !== null && $recipe->group?->isMember($user)) {
            return true;
        }

        return $this->sharesConfiguredGroup($user, $recipe);
    }

    public function delete(User $user, Recipe $recipe): bool
    {
        return $user->id === $recipe->user_id;
    }
}
