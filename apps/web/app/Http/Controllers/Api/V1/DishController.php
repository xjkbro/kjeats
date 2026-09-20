<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\DishResource;
use App\Models\Dish;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DishController extends Controller
{
    public function store(Request $request, Restaurant $restaurant): JsonResponse
    {
        $this->authorize('view', $restaurant);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rating' => 'required|numeric|min:0|max:5',
            'notes' => 'nullable|string|max:1000',
        ]);

        $dish = $restaurant->dishes()->create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['data' => new DishResource($dish->load('images'))], 201);
    }

    public function destroy(Request $request, Restaurant $restaurant, Dish $dish): JsonResponse
    {
        abort_unless($dish->restaurant_id === $restaurant->id, 404);
        abort_unless($dish->user_id === $request->user()->id, 403);

        $dish->delete();

        return response()->json(['message' => 'Dish removed.']);
    }
}
