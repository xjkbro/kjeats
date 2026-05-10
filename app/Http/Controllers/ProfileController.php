<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $restaurants = $user->restaurants()->with('dishes')->get();
        $recipes = $user->recipes()->get();

        $topCuisine = $restaurants->isEmpty() ? null
            : $restaurants->groupBy('cuisine')->sortByDesc(fn ($g) => $g->count())->keys()->first();

        $difficultyBreakdown = $recipes->groupBy('difficulty')
            ->map(fn ($g) => $g->count())
            ->toArray();

        return Inertia::render('portal/profile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
            ],
            'stats' => [
                'restaurant_count' => $restaurants->count(),
                'avg_rating' => $restaurants->avg('overall_rating'),
                'recipe_count' => $recipes->count(),
                'total_dishes' => $restaurants->sum(fn ($r) => $r->dishes->count()),
                'top_cuisine' => $topCuisine,
                'difficulty_breakdown' => $difficultyBreakdown,
            ],
            'recent_restaurants' => $restaurants->sortByDesc('date_visited')->take(3)->values(),
            'recent_recipes' => $recipes->sortByDesc('created_at')->take(3)->values(),
        ]);
    }
}
