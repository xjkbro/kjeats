<?php

namespace App\Models;

use App\Concerns\Revisable;
use Database\Factories\RecipeFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/** @property-read Collection<int, RecipeIngredient> $ingredients
 *  @property-read Collection<int, RecipeStep> $steps
 *  @property-read RecipeNutrition|null $nutrition
 */
class Recipe extends Model
{
    /** @use HasFactory<RecipeFactory> */
    use HasFactory, Revisable;

    protected $fillable = [
        'user_id',
        'group_id',
        'emoji',
        'name',
        'category',
        'difficulty',
        'description',
        'prep_time',
        'cook_time',
        'rest_time',
        'servings',
        'tags',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
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

    public function ingredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class)->orderBy('sort_order');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(RecipeStep::class)->orderBy('step_number');
    }

    public function nutrition(): HasOne
    {
        return $this->hasOne(RecipeNutrition::class);
    }

    public function images(): MorphMany
    {
        return $this->morphMany(Media::class, 'model');
    }
}
