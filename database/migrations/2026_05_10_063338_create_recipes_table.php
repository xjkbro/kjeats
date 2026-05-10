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
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('emoji')->default('📋');
            $table->string('name');
            $table->string('category');
            $table->enum('difficulty', ['Easy', 'Medium', 'Hard'])->default('Medium');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('prep_time')->default(0);
            $table->unsignedSmallInteger('cook_time')->default(0);
            $table->unsignedSmallInteger('rest_time')->default(0);
            $table->unsignedSmallInteger('servings')->default(4);
            $table->json('tags')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
