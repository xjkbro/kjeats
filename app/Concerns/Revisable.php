<?php

namespace App\Concerns;

use App\Models\Revision;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait Revisable
{
    public function revisions(): MorphMany
    {
        return $this->morphMany(Revision::class, 'revisionable')->latest('created_at');
    }

    /**
     * Capture a snapshot of the current model state before a change.
     * Related data (dishes, ingredients, steps) can be passed in $extra.
     *
     * @param  array<string, mixed>  $extra
     */
    public function captureRevision(User $user, array $extra = [], string $summary = ''): void
    {
        $this->revisions()->create([
            'user_id' => $user->id,
            'snapshot' => array_merge($this->getAttributes(), $extra),
            'summary' => $summary ?: ('Updated '.class_basename(static::class)),
        ]);
    }
}
