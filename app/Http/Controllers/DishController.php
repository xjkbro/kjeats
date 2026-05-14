<?php

namespace App\Http\Controllers;

use App\Models\Dish;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DishController extends Controller
{
    public function store(Request $request, Restaurant $restaurant): RedirectResponse
    {
        $this->authorize('view', $restaurant);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rating' => 'required|numeric|min:0|max:5',
            'notes' => 'nullable|string|max:1000',
        ]);

        $restaurant->dishes()->create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return back()
            ->with('flash.type', 'ok')
            ->with('flash.message', 'Dish added!');
    }

    public function destroy(Request $request, Restaurant $restaurant, Dish $dish): RedirectResponse
    {
        abort_unless($dish->restaurant_id === $restaurant->id, 404);
        abort_unless($dish->user_id === $request->user()->id, 403);

        $dish->delete();

        return back()
            ->with('flash.type', 'ok')
            ->with('flash.message', 'Dish removed.');
    }
}
