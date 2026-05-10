<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Group extends Model
{
    protected $fillable = ['name', 'description', 'invite_code'];

    protected static function booted(): void
    {
        static::creating(function (Group $group) {
            if (empty($group->invite_code)) {
                $group->invite_code = strtoupper(Str::random(8));
            }
        });
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function groupMembers(): HasMany
    {
        return $this->hasMany(GroupMember::class);
    }

    public function restaurants(): HasMany
    {
        return $this->hasMany(Restaurant::class);
    }

    public function recipes(): HasMany
    {
        return $this->hasMany(Recipe::class);
    }

    public function isMember(User $user): bool
    {
        return $this->groupMembers()->where('user_id', $user->id)->exists();
    }

    public function isOwner(User $user): bool
    {
        return $this->groupMembers()->where('user_id', $user->id)->where('role', 'owner')->exists();
    }

    public function memberCount(): int
    {
        return $this->groupMembers()->count();
    }
}
