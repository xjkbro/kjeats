<?php

namespace App\Http\Controllers;

use App\Models\Cuisine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CuisineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('q');

        $query = Cuisine::query()->orderBy('name');

        if ($search) {
            $query->where('name', 'like', '%'.$search.'%');
        }

        $cuisines = $query->limit(20)->pluck('name')->values();

        return response()->json($cuisines);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $name = trim(ucwords(strtolower($validated['name'])));
        $cuisine = Cuisine::firstOrCreate(
            ['name' => $name],
            ['slug' => Str::slug($name)]
        );

        return response()->json([
            'name' => $cuisine->name,
            'created' => $cuisine->wasRecentlyCreated,
        ]);
    }

    public function settings(Request $request)
    {
        $user = $request->user();
        $cuisines = Cuisine::orderBy('name')->get();

        $yourCuisines = $user->restaurants()
            ->whereNotNull('cuisine')
            ->pluck('cuisine')
            ->unique()
            ->sort()
            ->values();

        return inertia('settings/cuisines', [
            'cuisines' => $cuisines,
            'your_cuisines' => $yourCuisines,
        ]);
    }
}
