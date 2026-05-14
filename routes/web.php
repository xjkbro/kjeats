<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\RevisionController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::middleware(['auth', 'verified'])->prefix('app')->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('restaurants', RestaurantController::class)
        ->only(['index', 'show', 'create', 'store', 'edit', 'update']);

    Route::resource('recipes', RecipeController::class)
        ->only(['index', 'show', 'create', 'store', 'edit', 'update', 'destroy']);

    Route::resource('groups', GroupController::class)
        ->only(['index', 'show', 'create', 'store']);
    Route::post('groups/join', [GroupController::class, 'join'])->name('groups.join');
    Route::delete('groups/{group}/leave', [GroupController::class, 'leave'])->name('groups.leave');
    Route::delete('groups/{group}/members/{userId}', [GroupController::class, 'removeMember'])->name('groups.members.remove');

    Route::post('revisions/{revision}/revert', [RevisionController::class, 'revert'])->name('revisions.revert');

    Route::get('profile', ProfileController::class)->name('profile');
});

require __DIR__.'/settings.php';
