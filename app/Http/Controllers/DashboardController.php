<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $restaurants = $user->restaurants()
            ->with('dishes')
            ->orderByDesc('date_visited')
            ->get();

        $recipes = $user->recipes()
            ->with(['ingredients', 'steps', 'nutrition'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('portal/home', [
            'restaurants' => $restaurants,
            'recipes' => $recipes,
            'stats' => [
                'restaurant_count' => $restaurants->count(),
                'avg_rating' => $restaurants->avg('overall_rating'),
                'recipe_count' => $recipes->count(),
                'total_dishes' => $restaurants->sum(fn ($r) => $r->dishes->count()),
            ],
        ]);
    }
}
