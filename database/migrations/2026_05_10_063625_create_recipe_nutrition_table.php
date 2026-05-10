<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recipe_nutrition', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipe_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('serving_size')->nullable();
            $table->unsignedSmallInteger('calories')->default(0);
            $table->decimal('total_fat', 5, 1)->default(0);
            $table->unsignedTinyInteger('total_fat_dv')->default(0);
            $table->decimal('saturated_fat', 5, 1)->default(0);
            $table->unsignedTinyInteger('saturated_fat_dv')->default(0);
            $table->decimal('trans_fat', 5, 1)->default(0);
            $table->unsignedSmallInteger('cholesterol')->default(0);
            $table->unsignedTinyInteger('cholesterol_dv')->default(0);
            $table->unsignedSmallInteger('sodium')->default(0);
            $table->unsignedTinyInteger('sodium_dv')->default(0);
            $table->unsignedSmallInteger('total_carbs')->default(0);
            $table->unsignedTinyInteger('total_carbs_dv')->default(0);
            $table->decimal('fiber', 5, 1)->default(0);
            $table->unsignedTinyInteger('fiber_dv')->default(0);
            $table->decimal('total_sugars', 5, 1)->default(0);
            $table->decimal('added_sugars', 5, 1)->default(0);
            $table->unsignedTinyInteger('added_sugars_dv')->default(0);
            $table->unsignedSmallInteger('protein')->default(0);
            $table->decimal('vitamin_d', 5, 1)->default(0);
            $table->unsignedTinyInteger('vitamin_d_dv')->default(0);
            $table->unsignedSmallInteger('calcium')->default(0);
            $table->unsignedTinyInteger('calcium_dv')->default(0);
            $table->decimal('iron', 5, 1)->default(0);
            $table->unsignedTinyInteger('iron_dv')->default(0);
            $table->unsignedSmallInteger('potassium')->default(0);
            $table->unsignedTinyInteger('potassium_dv')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipe_nutrition');
    }
};
