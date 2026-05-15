<?php

namespace App\Models;

use App\Concerns\Revisable;
use Database\Factories\RestaurantFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

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
        'visit_dates',
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
            'visit_dates' => 'array',
            'date_visited' => 'date:Y-m-d',
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

    public function images(): MorphMany
    {
        return $this->morphMany(Media::class, 'model');
    }
}
