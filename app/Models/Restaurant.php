<?php

namespace App\Models;

use App\Concerns\Revisable;
use Database\Factories\RestaurantFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** @property-read Collection<int, Dish> $dishes */
class Restaurant extends Model
{
    /** @use HasFactory<RestaurantFactory> */
    use HasFactory, Revisable;

    protected $fillable = [
        'user_id',
        'group_id',
        'emoji',
        'name',
        'cuisine',
        'location',
        'date_visited',
        'overall_rating',
        'price_range',
        'review',
        'tags',
        'atmosphere_rating',
        'service_rating',
        'value_rating',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'date_visited' => 'date',
            'overall_rating' => 'decimal:1',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function dishes(): HasMany
    {
        return $this->hasMany(Dish::class);
    }
}
