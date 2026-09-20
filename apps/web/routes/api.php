<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CuisineController;
use App\Http\Controllers\Api\V1\DishController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\RecipeController;
use App\Http\Controllers\Api\V1\RestaurantController;
use App\Http\Controllers\Api\V1\WantToTryController;
use App\Http\Controllers\NutritionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::post('auth/login', [AuthController::class, 'login'])->name('auth.login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('user', [AuthController::class, 'user'])->name('user');

        Route::apiResource('restaurants', RestaurantController::class)
            ->only(['index', 'show', 'store', 'update']);
        Route::post('restaurants/{restaurant}/revisit', [RestaurantController::class, 'logRevisit'])
            ->name('restaurants.revisit.store');

        Route::post('restaurants/{restaurant}/dishes', [DishController::class, 'store'])
            ->name('restaurants.dishes.store');
        Route::delete('restaurants/{restaurant}/dishes/{dish}', [DishController::class, 'destroy'])
            ->name('restaurants.dishes.destroy');

        Route::post('restaurants/{restaurant}/images', [MediaController::class, 'storeRestaurant'])
            ->name('restaurants.images.store');
        Route::post('recipes/{recipe}/images', [MediaController::class, 'storeRecipe'])
            ->name('recipes.images.store');
        Route::delete('media/{media}', [MediaController::class, 'destroy'])->name('media.destroy');

        Route::apiResource('recipes', RecipeController::class);
        Route::post('recipes/nutrition/calculate', [NutritionController::class, 'calculate'])
            ->name('recipes.nutrition.calculate');

        Route::get('want-to-try', [WantToTryController::class, 'index'])->name('want-to-try.index');
        Route::post('want-to-try', [WantToTryController::class, 'store'])->name('want-to-try.store');
        Route::get('want-to-try/{wantToTry}', [WantToTryController::class, 'show'])->name('want-to-try.show');
        Route::delete('want-to-try/{wantToTry}', [WantToTryController::class, 'destroy'])->name('want-to-try.destroy');
        Route::post('want-to-try/{wantToTry}/convert', [WantToTryController::class, 'convertToReview'])
            ->name('want-to-try.convert');

        Route::get('cuisines', [CuisineController::class, 'index'])->name('cuisines.index');
        Route::get('locations', [LocationController::class, 'index'])->name('locations.index');
    });
});
