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
        Schema::table('restaurants', function (Blueprint $table) {
            $table->json('visit_dates')->nullable()->after('date_visited');
        });

        // Backfill: seed visit_dates from existing date_visited
        DB::table('restaurants')->whereNull('visit_dates')->chunkById(200, function ($rows) {
            foreach ($rows as $row) {
                DB::table('restaurants')
                    ->where('id', $row->id)
                    ->update(['visit_dates' => json_encode([$row->date_visited])]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn('visit_dates');
        });
    }
};
