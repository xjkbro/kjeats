<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $q = trim($request->get('q', ''));

        if (strlen($q) < 1) {
            return response()->json(['results' => []]);
        }

        $userId = $request->user()->id;

        $restaurants = Restaurant::query()
            ->where('user_id', $userId)
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('cuisine', 'like', "%{$q}%")
                    ->orWhere('location', 'like', "%{$q}%")
                    ->orWhere('review', 'like', "%{$q}%")
                    ->orWhereJsonContains('tags', $q);
            })
            ->limit(5)
            ->get(['id', 'emoji', 'name', 'cuisine'])
            ->map(fn ($r) => [
                'type' => 'restaurant',
                'id' => $r->id,
                'emoji' => $r->emoji,
                'title' => $r->name,
                'subtitle' => $r->cuisine,
                'url' => route('restaurants.show', $r),
            ]);

        $recipes = Recipe::query()
            ->where('user_id', $userId)
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('category', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhereJsonContains('tags', $q);
            })
            ->limit(5)
            ->get(['id', 'emoji', 'name', 'category'])
            ->map(fn ($r) => [
                'type' => 'recipe',
                'id' => $r->id,
                'emoji' => $r->emoji,
                'title' => $r->name,
                'subtitle' => $r->category,
                'url' => route('recipes.show', $r),
            ]);

        $dishes = $request->user()->dishes()
            ->where('name', 'like', "%{$q}%")
            ->with('restaurant:id,name,emoji')
            ->limit(5)
            ->get()
            ->map(fn ($d) => [
                'type' => 'dish',
                'id' => $d->id,
                'emoji' => '🍽️',
                'title' => $d->name,
                'subtitle' => $d->restaurant?->name ?? 'Unknown',
                'url' => route('restaurants.show', $d->restaurant_id),
            ]);

        $results = collect()
            ->merge($restaurants)
            ->merge($recipes)
            ->merge($dishes)
            ->sortBy('title')
            ->values();

        return response()->json(['results' => $results]);
    }
}
