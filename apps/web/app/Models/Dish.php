<?php

namespace App\Models;

use Database\Factories\DishFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Dish extends Model
{
    /** @use HasFactory<DishFactory> */
    use HasFactory;

    protected $fillable = ['restaurant_id', 'user_id', 'name', 'rating', 'notes'];

    protected function casts(): array
    {
        return [
            'rating' => 'decimal:1',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): MorphMany
    {
        return $this->morphMany(Media::class, 'model');
    }
}
