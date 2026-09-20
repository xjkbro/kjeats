<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recipe_nutrition', function (Blueprint $table) {
            $table->unsignedSmallInteger('servings_per_container')->nullable()->after('serving_size');

            $table->renameColumn('total_fat', 'total_fat_g');
            $table->renameColumn('total_fat_dv', 'total_fat_pct');
            $table->renameColumn('saturated_fat', 'saturated_fat_g');
            $table->renameColumn('saturated_fat_dv', 'saturated_fat_pct');
            $table->renameColumn('trans_fat', 'trans_fat_g');
            $table->renameColumn('cholesterol', 'cholesterol_mg');
            $table->renameColumn('cholesterol_dv', 'cholesterol_pct');
            $table->renameColumn('sodium', 'sodium_mg');
            $table->renameColumn('sodium_dv', 'sodium_pct');
            $table->renameColumn('total_carbs', 'total_carbohydrate_g');
            $table->renameColumn('total_carbs_dv', 'total_carbohydrate_pct');
            $table->renameColumn('fiber', 'dietary_fiber_g');
            $table->renameColumn('fiber_dv', 'dietary_fiber_pct');
            $table->renameColumn('total_sugars', 'total_sugars_g');
            $table->renameColumn('added_sugars', 'added_sugars_g');
            $table->renameColumn('added_sugars_dv', 'added_sugars_pct');
            $table->renameColumn('protein', 'protein_g');
            $table->renameColumn('vitamin_d', 'vitamin_d_mcg');
            $table->renameColumn('vitamin_d_dv', 'vitamin_d_pct');
            $table->renameColumn('calcium', 'calcium_mg');
            $table->renameColumn('calcium_dv', 'calcium_pct');
            $table->renameColumn('iron', 'iron_mg');
            $table->renameColumn('iron_dv', 'iron_pct');
            $table->renameColumn('potassium', 'potassium_mg');
            $table->renameColumn('potassium_dv', 'potassium_pct');
        });
    }

    public function down(): void
    {
        Schema::table('recipe_nutrition', function (Blueprint $table) {
            $table->dropColumn('servings_per_container');

            $table->renameColumn('total_fat_g', 'total_fat');
            $table->renameColumn('total_fat_pct', 'total_fat_dv');
            $table->renameColumn('saturated_fat_g', 'saturated_fat');
            $table->renameColumn('saturated_fat_pct', 'saturated_fat_dv');
            $table->renameColumn('trans_fat_g', 'trans_fat');
            $table->renameColumn('cholesterol_mg', 'cholesterol');
            $table->renameColumn('cholesterol_pct', 'cholesterol_dv');
            $table->renameColumn('sodium_mg', 'sodium');
            $table->renameColumn('sodium_pct', 'sodium_dv');
            $table->renameColumn('total_carbohydrate_g', 'total_carbs');
            $table->renameColumn('total_carbohydrate_pct', 'total_carbs_dv');
            $table->renameColumn('dietary_fiber_g', 'fiber');
            $table->renameColumn('dietary_fiber_pct', 'fiber_dv');
            $table->renameColumn('total_sugars_g', 'total_sugars');
            $table->renameColumn('added_sugars_g', 'added_sugars');
            $table->renameColumn('added_sugars_pct', 'added_sugars_dv');
            $table->renameColumn('protein_g', 'protein');
            $table->renameColumn('vitamin_d_mcg', 'vitamin_d');
            $table->renameColumn('vitamin_d_pct', 'vitamin_d_dv');
            $table->renameColumn('calcium_mg', 'calcium');
            $table->renameColumn('calcium_pct', 'calcium_dv');
            $table->renameColumn('iron_mg', 'iron');
            $table->renameColumn('iron_pct', 'iron_dv');
            $table->renameColumn('potassium_mg', 'potassium');
            $table->renameColumn('potassium_pct', 'potassium_dv');
        });
    }
};
