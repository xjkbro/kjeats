<?php

namespace App\Http\Controllers;

use App\Models\Dish;
use App\Models\Group;
use App\Models\Recipe;
use App\Models\Restaurant;
use App\Models\WantToTry;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $groupId = (int) config('app.frontend_group_id', 0);
        $feed = null;
        $group = null;
        $stats = null;

        if ($groupId > 0) {
            $foundGroup = Group::find($groupId);

            if ($foundGroup) {
                $group = ['id' => $foundGroup->id, 'name' => $foundGroup->name];
                $memberIds = $foundGroup->members()->pluck('users.id');

                // ── Restaurant visits ─────────────────────────────
                $restaurants = Restaurant::whereIn('user_id', $memberIds)
                    ->with(['user', 'dishes.user', 'dishes.images', 'images'])
                    ->latest()
                    ->limit(50)
                    ->get();

                // ── Recipes ───────────────────────────────────────
                $recipes = Recipe::whereIn('user_id', $memberIds)
                    ->with(['user', 'images', 'ingredients'])
                    ->latest()
                    ->limit(50)
                    ->get();

                // ── Want to Try ──────────────────────────────────
                $wantToTries = WantToTry::whereIn('user_id', $memberIds)
                    ->with('user')
                    ->whereNull('restaurant_id')
                    ->latest()
                    ->limit(50)
                    ->get();

                // ── Dish ratings (cross-user) ─────────────────────
                $dishRatings = Dish::join('restaurants', 'restaurants.id', '=', 'dishes.restaurant_id')
                    ->whereIn('dishes.user_id', $memberIds)
                    ->whereIn('restaurants.user_id', $memberIds)
                    ->whereColumn('dishes.user_id', '!=', 'restaurants.user_id')
                    ->with(['user', 'restaurant.user', 'images'])
                    ->select('dishes.*')
                    ->latest('dishes.created_at')
                    ->limit(50)
                    ->get();

                // ── Merge into feed ──────────────────────────────
                $feed = collect()
                    ->merge($restaurants->map(fn ($r) => [
                        'type' => 'restaurant',
                        'id' => $r->id,
                        'emoji' => $r->emoji,
                        'name' => $r->name,
                        'cuisine' => $r->cuisine,
                        'location' => $r->location,
                        'date_visited' => $r->date_visited->format('Y-m-d'),
                        'overall_rating' => (string) $r->overall_rating,
                        'price_range' => $r->price_range,
                        'review' => $r->review ? Str::limit($r->review, 200) : null,
                        'image_url' => $r->images->first()?->url,
                        'dishes' => $r->dishes->map(fn ($d) => [
                            'name' => $d->name,
                            'rating' => (string) $d->rating,
                            'image_url' => $d->images->first()?->url,
                        ])->values(),
                        'user' => [
                            'name' => $r->user->name,
                            'avatar_url' => $r->user->avatar_url,
                        ],
                        'created_at' => $r->created_at->toISOString(),
                    ]))
                    ->merge($recipes->map(fn ($r) => [
                        'type' => 'recipe',
                        'id' => $r->id,
                        'emoji' => $r->emoji,
                        'name' => $r->name,
                        'category' => $r->category,
                        'difficulty' => $r->difficulty,
                        'description' => $r->description ? Str::limit($r->description, 180) : null,
                        'total_time' => $r->prep_time + $r->cook_time + $r->rest_time,
                        'image_url' => $r->images->first()?->url,
                        'ingredients' => $r->ingredients->take(5)->map(fn ($i) => $i->name)->values(),
                        'user' => [
                            'name' => $r->user->name,
                            'avatar_url' => $r->user->avatar_url,
                        ],
                        'created_at' => $r->created_at->toISOString(),
                    ]))
                    ->merge($wantToTries->map(fn ($w) => [
                        'type' => 'want_to_try',
                        'id' => $w->id,
                        'emoji' => $w->emoji,
                        'name' => $w->name,
                        'cuisine' => $w->cuisine,
                        'location' => $w->location,
                        'notes' => $w->notes ? Str::limit($w->notes, 150) : null,
                        'user' => [
                            'name' => $w->user->name,
                            'avatar_url' => $w->user->avatar_url,
                        ],
                        'created_at' => $w->created_at->toISOString(),
                    ]))
                    ->merge($dishRatings->map(fn ($d) => [
                        'type' => 'dish_rating',
                        'id' => $d->id,
                        'name' => $d->name,
                        'rating' => (string) $d->rating,
                        'notes' => $d->notes ? Str::limit($d->notes, 120) : null,
                        'image_url' => $d->images->first()?->url,
                        'restaurant_id' => $d->restaurant_id,
                        'restaurant_name' => $d->restaurant->name,
                        'restaurant_emoji' => $d->restaurant->emoji,
                        'restaurant_owner' => $d->restaurant->user->name,
                        'user' => [
                            'name' => $d->user->name,
                            'avatar_url' => $d->user->avatar_url,
                        ],
                        'created_at' => $d->created_at->toISOString(),
                    ]))
                    ->sortByDesc('created_at')
                    ->take(10)
                    ->values();

                // ── Stats ────────────────────────────────────────
                $restaurantCount = Restaurant::whereIn('user_id', $memberIds)->count();
                $recipeCount = Recipe::whereIn('user_id', $memberIds)->count();
                $avgRating = Restaurant::whereIn('user_id', $memberIds)->avg('overall_rating');
                $totalDishes = Dish::join('restaurants', 'restaurants.id', '=', 'dishes.restaurant_id')
                    ->whereIn('restaurants.user_id', $memberIds)
                    ->count();

                $stats = [
                    'restaurant_count' => $restaurantCount,
                    'recipe_count' => $recipeCount,
                    'avg_rating' => $avgRating ? round($avgRating, 1) : 0,
                    'total_dishes' => $totalDishes,
                ];
            }
        }

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'feed' => $feed,
            'group' => $group,
            'stats' => $stats,
        ]);
    }
}
