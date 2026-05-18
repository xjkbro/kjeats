<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\User;
use App\Models\WantToTry;

class WantToTryPolicy
{
    private function sharesConfiguredGroup(User $user, WantToTry $wantToTry): bool
    {
        $groupId = (int) config('app.frontend_group_id', 0);

        if ($groupId === 0) {
            return false;
        }

        $group = Group::find($groupId);

        return $group && $group->isMember($user) && $group->isMember($wantToTry->user);
    }

    public function view(User $user, WantToTry $wantToTry): bool
    {
        if ($user->id === $wantToTry->user_id) {
            return true;
        }

        if ($wantToTry->group_id !== null && $wantToTry->group?->isMember($user)) {
            return true;
        }

        return $this->sharesConfiguredGroup($user, $wantToTry);
    }

    public function delete(User $user, WantToTry $wantToTry): bool
    {
        return $user->id === $wantToTry->user_id;
    }
}
