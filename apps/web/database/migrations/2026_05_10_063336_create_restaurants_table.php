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
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('emoji')->default('🍽️');
            $table->string('name');
            $table->string('cuisine');
            $table->string('location');
            $table->date('date_visited');
            $table->decimal('overall_rating', 2, 1)->default(0);
            $table->string('price_range', 4)->default('$$');
            $table->text('review')->nullable();
            $table->json('tags')->nullable();
            $table->unsignedTinyInteger('atmosphere_rating')->default(0);
            $table->unsignedTinyInteger('service_rating')->default(0);
            $table->unsignedTinyInteger('value_rating')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
