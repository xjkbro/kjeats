<?php

namespace App\Http\Controllers;

use App\Models\Dish;
use App\Models\Group;
use App\Models\Recipe;
use App\Models\Restaurant;
use App\Models\WantToTry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $groupId = (int) config('app.frontend_group_id', 0);
        $group = null;
        $feed = null;

        $restaurants = $user->restaurants()
            ->with('dishes')
            ->orderByDesc('date_visited')
            ->get();

        $recipes = $user->recipes()
            ->with(['ingredients', 'steps', 'nutrition'])
            ->orderByDesc('created_at')
            ->get();

        $topCuisine = $restaurants->groupBy('cuisine')
            ->sortByDesc(fn ($items) => $items->count())
            ->keys()
            ->first();

        $recentVisits = $restaurants->take(4)->map(fn ($r) => [
            'id' => $r->id,
            'emoji' => $r->emoji,
            'name' => $r->name,
            'cuisine' => $r->cuisine,
            'date_visited' => $r->date_visited->format('Y-m-d'),
            'overall_rating' => (string) $r->overall_rating,
        ]);

        $recentRecipeList = $recipes->take(5)->map(fn ($r) => [
            'id' => $r->id,
            'emoji' => $r->emoji,
            'name' => $r->name,
            'category' => $r->category,
            'difficulty' => $r->difficulty,
            'total_time' => $r->prep_time + $r->cook_time + $r->rest_time,
        ]);

        $wantToTries = $user->wantToTries()
            ->whereNull('restaurant_id')
            ->with('user')
            ->latest()
            ->limit(20)
            ->get();

        if ($groupId > 0) {
            $foundGroup = Group::find($groupId);

            if ($foundGroup && $foundGroup->isMember($user)) {
                $group = ['id' => $foundGroup->id, 'name' => $foundGroup->name];
                $memberIds = $foundGroup->members()->pluck('users.id');

                $groupRestaurants = Restaurant::whereIn('user_id', $memberIds)
                    ->with('user')
                    ->latest()
                    ->limit(200)
                    ->get();

                $groupRecipes = Recipe::whereIn('user_id', $memberIds)
                    ->with('user')
                    ->latest()
                    ->limit(200)
                    ->get();

                $dishRatings = Dish::join('restaurants', 'restaurants.id', '=', 'dishes.restaurant_id')
                    ->whereIn('dishes.user_id', $memberIds)
                    ->whereIn('restaurants.user_id', $memberIds)
                    ->whereColumn('dishes.user_id', '!=', 'restaurants.user_id')
                    ->with(['user', 'restaurant.user'])
                    ->select('dishes.*')
                    ->latest('dishes.created_at')
                    ->limit(200)
                    ->get();

                $groupWantToTries = WantToTry::whereIn('user_id', $memberIds)
                    ->with('user')
                    ->whereNull('restaurant_id')
                    ->latest()
                    ->limit(200)
                    ->get();

                $feed = collect()
                    ->merge($groupRestaurants->map(fn ($r) => [
                        'type' => 'restaurant',
                        'id' => $r->id,
                        'emoji' => $r->emoji,
                        'name' => $r->name,
                        'cuisine' => $r->cuisine,
                        'location' => $r->location,
                        'date_visited' => $r->date_visited->format('Y-m-d'),
                        'overall_rating' => (string) $r->overall_rating,
                        'price_range' => $r->price_range,
                        'user' => ['name' => $r->user->name],
                        'created_at' => $r->created_at->toISOString(),
                    ]))
                    ->merge($groupRecipes->map(fn ($r) => [
                        'type' => 'recipe',
                        'id' => $r->id,
                        'emoji' => $r->emoji,
                        'name' => $r->name,
                        'category' => $r->category,
                        'difficulty' => $r->difficulty,
                        'total_time' => $r->prep_time + $r->cook_time + $r->rest_time,
                        'user' => ['name' => $r->user->name],
                        'created_at' => $r->created_at->toISOString(),
                    ]))
                    ->merge($dishRatings->map(fn ($d) => [
                        'type' => 'dish_rating',
                        'id' => $d->id,
                        'name' => $d->name,
                        'rating' => (string) $d->rating,
                        'restaurant_id' => $d->restaurant_id,
                        'restaurant_name' => $d->restaurant->name,
                        'restaurant_emoji' => $d->restaurant->emoji,
                        'restaurant_owner' => $d->restaurant->user->name,
                        'user' => ['name' => $d->user->name],
                        'created_at' => $d->created_at->toISOString(),
                    ]))
                    ->merge($groupWantToTries->map(fn ($w) => [
                        'type' => 'want_to_try',
                        'id' => $w->id,
                        'emoji' => $w->emoji,
                        'name' => $w->name,
                        'cuisine' => $w->cuisine,
                        'location' => $w->location,
                        'user' => ['name' => $w->user->name],
                        'created_at' => $w->created_at->toISOString(),
                    ]))
                    ->sortByDesc('created_at')
                    ->values();

                $recentVisits = $groupRestaurants->take(4)->map(fn ($r) => [
                    'id' => $r->id,
                    'emoji' => $r->emoji,
                    'name' => $r->name,
                    'cuisine' => $r->cuisine,
                    'date_visited' => $r->date_visited->format('Y-m-d'),
                    'overall_rating' => (string) $r->overall_rating,
                ]);

                $recentRecipeList = $groupRecipes->take(5)->map(fn ($r) => [
                    'id' => $r->id,
                    'emoji' => $r->emoji,
                    'name' => $r->name,
                    'category' => $r->category,
                    'difficulty' => $r->difficulty,
                    'total_time' => $r->prep_time + $r->cook_time + $r->rest_time,
                ]);
            }
        }

        return Inertia::render('dashboard', [
            'group' => $group,
            'feed' => $feed,
            'stats' => [
                'restaurant_count' => $restaurants->count(),
                'avg_rating' => $restaurants->avg('overall_rating'),
                'recipe_count' => $recipes->count(),
                'total_dishes' => $restaurants->sum(fn ($r) => $r->dishes->count()),
                'top_cuisine' => $topCuisine,
            ],
            'recent_restaurants' => $recentVisits,
            'recent_recipes' => $recentRecipeList,
            'want_to_tries' => $wantToTries->map(fn ($w) => [
                'id' => $w->id,
                'emoji' => $w->emoji,
                'name' => $w->name,
                'cuisine' => $w->cuisine,
                'location' => $w->location,
            ])->values(),
        ]);
    }
}
