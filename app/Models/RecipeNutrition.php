<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeNutrition extends Model
{
    protected $fillable = [
        'recipe_id',
        'serving_size',
        'servings_per_container',
        'calories',
        'total_fat_g', 'total_fat_pct',
        'saturated_fat_g', 'saturated_fat_pct',
        'trans_fat_g',
        'cholesterol_mg', 'cholesterol_pct',
        'sodium_mg', 'sodium_pct',
        'total_carbohydrate_g', 'total_carbohydrate_pct',
        'dietary_fiber_g', 'dietary_fiber_pct',
        'total_sugars_g',
        'added_sugars_g', 'added_sugars_pct',
        'protein_g',
        'vitamin_d_mcg', 'vitamin_d_pct',
        'calcium_mg', 'calcium_pct',
        'iron_mg', 'iron_pct',
        'potassium_mg', 'potassium_pct',
    ];

    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class);
    }
}
