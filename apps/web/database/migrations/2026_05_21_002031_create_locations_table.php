<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->timestamps();
        });

        Schema::table('restaurants', function (Blueprint $table) {
            $table->foreignId('location_id')->nullable()->after('location')->constrained()->restrictOnDelete();
        });

        Schema::table('want_to_tries', function (Blueprint $table) {
            $table->foreignId('location_id')->nullable()->after('location')->constrained()->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('want_to_tries', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });

        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });

        Schema::dropIfExists('locations');
    }
};
