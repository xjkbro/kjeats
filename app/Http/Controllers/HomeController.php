<?php

namespace App\Http\Controllers;

use App\Models\Dish;
use App\Models\Group;
use App\Models\Recipe;
use App\Models\Restaurant;
use Illuminate\Http\Request;
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

        if ($groupId > 0) {
            $foundGroup = Group::find($groupId);

            if ($foundGroup) {
                $group = ['id' => $foundGroup->id, 'name' => $foundGroup->name];

                $memberIds = $foundGroup->members()->pluck('users.id');

                $restaurants = Restaurant::whereIn('user_id', $memberIds)
                    ->with('user')
                    ->latest()
                    ->limit(100)
                    ->get();

                $recipes = Recipe::whereIn('user_id', $memberIds)
                    ->with('user')
                    ->latest()
                    ->limit(100)
                    ->get();

                $dishRatings = Dish::join('restaurants', 'restaurants.id', '=', 'dishes.restaurant_id')
                    ->whereIn('dishes.user_id', $memberIds)
                    ->whereIn('restaurants.user_id', $memberIds)
                    ->whereColumn('dishes.user_id', '!=', 'restaurants.user_id')
                    ->with(['user', 'restaurant.user'])
                    ->select('dishes.*')
                    ->latest('dishes.created_at')
                    ->limit(100)
                    ->get();

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
                        'user' => ['name' => $r->user->name],
                        'created_at' => $r->created_at->toISOString(),
                    ]))
                    ->merge($recipes->map(fn ($r) => [
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
                    ->sortByDesc('created_at')
                    ->values();
            }
        }

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'feed' => $feed,
            'group' => $group,
        ]);
    }
}
