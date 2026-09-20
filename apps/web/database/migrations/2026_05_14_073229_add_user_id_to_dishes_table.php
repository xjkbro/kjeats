<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('dishes', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('restaurant_id')->constrained()->nullOnDelete();
        });

        // Back-fill: attribute existing dishes to the restaurant owner
        DB::statement('UPDATE dishes SET user_id = (SELECT user_id FROM restaurants WHERE restaurants.id = dishes.restaurant_id) WHERE user_id IS NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dishes', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
