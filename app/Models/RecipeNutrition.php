<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeNutrition extends Model
{
    protected $fillable = [
        'recipe_id',
        'serving_size',
        'calories',
        'total_fat', 'total_fat_dv',
        'saturated_fat', 'saturated_fat_dv',
        'trans_fat',
        'cholesterol', 'cholesterol_dv',
        'sodium', 'sodium_dv',
        'total_carbs', 'total_carbs_dv',
        'fiber', 'fiber_dv',
        'total_sugars',
        'added_sugars', 'added_sugars_dv',
        'protein',
        'vitamin_d', 'vitamin_d_dv',
        'calcium', 'calcium_dv',
        'iron', 'iron_dv',
        'potassium', 'potassium_dv',
    ];

    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class);
    }
}
