<?php

namespace App\Models;

use Database\Factories\WantToTryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read bool $is_converted
 */
class WantToTry extends Model
{
    /** @use HasFactory<WantToTryFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'group_id',
        'emoji',
        'name',
        'cuisine',
        'location',
        'notes',
        'restaurant_id',
    ];

    protected function casts(): array
    {
        return [];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function getIsConvertedAttribute(): bool
    {
        return $this->restaurant_id !== null;
    }
}
