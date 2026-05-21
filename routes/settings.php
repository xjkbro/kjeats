<?php

use App\Http\Controllers\CuisineController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('app/user/profile', function (Request $request) {
        return Inertia::render('portal/profile/edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    })->name('portal.profile.edit');

    Route::get('app/user/password', function () {
        return Inertia::render('portal/profile/password');
    })->name('portal.profile.password');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    Route::get('settings/cuisines', [CuisineController::class, 'settings'])->name('cuisines.settings');

    Route::get('settings/locations', [LocationController::class, 'settings'])->name('locations.settings');
});
