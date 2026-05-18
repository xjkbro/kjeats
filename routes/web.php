<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DishController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\NutritionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\RecipeImportController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\RevisionController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::middleware(['auth', 'verified'])->prefix('app')->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('restaurants', RestaurantController::class)
        ->only(['index', 'show', 'create', 'store', 'edit', 'update']);

    Route::get('restaurants/{restaurant}/revisit', [RestaurantController::class, 'showRevisit'])->name('restaurants.revisit');
    Route::post('restaurants/{restaurant}/revisit', [RestaurantController::class, 'logRevisit'])->name('restaurants.revisit.store');

    Route::post('restaurants/{restaurant}/dishes', [DishController::class, 'store'])->name('dishes.store');
    Route::delete('restaurants/{restaurant}/dishes/{dish}', [DishController::class, 'destroy'])->name('dishes.destroy');

    Route::post('restaurants/{restaurant}/images', [MediaController::class, 'storeRestaurant'])->name('restaurants.images.store');
    Route::post('dishes/{dish}/images', [MediaController::class, 'storeDish'])->name('dishes.images.store');
    Route::post('recipes/{recipe}/images', [MediaController::class, 'storeRecipe'])->name('recipes.images.store');
    Route::delete('media/{media}', [MediaController::class, 'destroy'])->name('media.destroy');

    Route::resource('recipes', RecipeController::class)
        ->only(['index', 'show', 'create', 'store', 'edit', 'update', 'destroy']);

    Route::post('recipes/nutrition/calculate', [NutritionController::class, 'calculate'])->name('recipes.nutrition.calculate');

    Route::post('recipes/import', RecipeImportController::class)->name('recipes.import');

    Route::get('search', SearchController::class)->name('search');

    Route::resource('groups', GroupController::class)
        ->only(['index', 'show', 'create', 'store']);
    Route::post('groups/join', [GroupController::class, 'join'])->name('groups.join');
    Route::delete('groups/{group}/leave', [GroupController::class, 'leave'])->name('groups.leave');
    Route::delete('groups/{group}/members/{userId}', [GroupController::class, 'removeMember'])->name('groups.members.remove');

    Route::post('revisions/{revision}/revert', [RevisionController::class, 'revert'])->name('revisions.revert');

    Route::get('profile', ProfileController::class)->name('profile');
});

require __DIR__.'/settings.php';
