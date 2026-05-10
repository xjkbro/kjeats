<?php

use App\Models\Group;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });

        Schema::table('recipes', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropForeignIdFor(Group::class);
            $table->dropColumn('group_id');
        });

        Schema::table('recipes', function (Blueprint $table) {
            $table->dropForeignIdFor(Group::class);
            $table->dropColumn('group_id');
        });
    }
};
