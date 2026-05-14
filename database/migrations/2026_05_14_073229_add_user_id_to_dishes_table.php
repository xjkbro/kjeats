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
        DB::statement('UPDATE dishes d JOIN restaurants r ON r.id = d.restaurant_id SET d.user_id = r.user_id WHERE d.user_id IS NULL');
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
