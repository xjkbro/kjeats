<?php

namespace App\Policies;

use App\Models\Recipe;
use App\Models\User;

class RecipePolicy
{
    public function view(User $user, Recipe $recipe): bool
    {
        if ($user->id === $recipe->user_id) {
            return true;
        }

        return $recipe->group_id !== null && $recipe->group?->isMember($user);
    }

    public function update(User $user, Recipe $recipe): bool
    {
        if ($user->id === $recipe->user_id) {
            return true;
        }

        return $recipe->group_id !== null && $recipe->group?->isMember($user);
    }

    public function delete(User $user, Recipe $recipe): bool
    {
        return $user->id === $recipe->user_id;
    }
}
