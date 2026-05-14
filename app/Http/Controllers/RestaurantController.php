<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantController extends Controller
{
    public function index(Request $request): Response
    {
        $restaurants = $request->user()
            ->restaurants()
            ->with('dishes')
            ->orderByDesc('date_visited')
            ->get();

        return Inertia::render('portal/restaurants/index', [
            'restaurants' => $restaurants,
        ]);
    }

    public function show(Request $request, Restaurant $restaurant): Response
    {
        $this->authorize('view', $restaurant);

        $groupId = (int) config('app.frontend_group_id', 0);
        $canAddDish = false;
        if ($groupId > 0) {
            $group = Group::find($groupId);
            $canAddDish = $group && $group->isMember($request->user());
        }

        return Inertia::render('portal/restaurants/show', [
            'restaurant' => $restaurant->load(['dishes.user', 'dishes.images', 'revisions.user', 'images']),
            'can_add_dish' => $canAddDish,
            'current_user_id' => $request->user()->id,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('portal/restaurants/create');
    }

    public function store(Request $request): RedirectResponse
    {
        // Transform comma-separated tags string into an array before validation
        if (is_string($request->tags)) {
            $request->merge([
                'tags' => array_filter(array_map('trim', explode(',', $request->tags))),
            ]);
        }

        $validated = $request->validate([
            'emoji' => 'nullable|string|max:10',
            'name' => 'required|string|max:255',
            'cuisine' => 'required|string|max:100',
            'location' => 'nullable|string|max:255',
            'date_visited' => 'required|date',
            'visit_dates' => 'nullable|array',
            'visit_dates.*' => 'date',
            'overall_rating' => 'required|numeric|min:0|max:5',
            'price_range' => 'required|in:$,$$,$$$,$$$$',
            'review' => 'nullable|string|max:5000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'atmosphere_rating' => 'nullable|integer|min:1|max:5',
            'service_rating' => 'nullable|integer|min:1|max:5',
            'value_rating' => 'nullable|integer|min:1|max:5',
            'dishes' => 'nullable|array',
            'dishes.*.name' => 'required|string|max:255',
            'dishes.*.rating' => 'required|numeric|min:0|max:5',
            'dishes.*.notes' => 'nullable|string|max:1000',
            'group_id' => 'nullable|exists:groups,id',
        ]);

        $dishes = $validated['dishes'] ?? [];
        unset($validated['dishes']);

        // Sync visit_dates: if provided, update date_visited to the latest date
        if (! empty($validated['visit_dates'])) {
            $sorted = $validated['visit_dates'];
            sort($sorted);
            $validated['visit_dates'] = $sorted;
            $validated['date_visited'] = end($sorted);
        } else {
            $validated['visit_dates'] = [$validated['date_visited']];
        }

        $restaurant = $request->user()->restaurants()->create([
            ...$validated,
            'emoji' => $validated['emoji'] ?? '🍽️',
            'group_id' => $validated['group_id'] ?? null,
        ]);

        foreach ($dishes as $dish) {
            $restaurant->dishes()->create([
                ...$dish,
                'user_id' => $request->user()->id,
            ]);
        }

        return redirect()->route('restaurants.show', $restaurant)
            ->with('flash.type', 'ok')
            ->with('flash.message', 'Restaurant review saved!');
    }

    public function edit(Restaurant $restaurant): Response
    {
        $this->authorize('update', $restaurant);

        return Inertia::render('portal/restaurants/edit', [
            'restaurant' => $restaurant->load('dishes'),
        ]);
    }

    public function update(Request $request, Restaurant $restaurant): RedirectResponse
    {
        $this->authorize('update', $restaurant);

        // Transform comma-separated tags string into an array before validation
        if (is_string($request->tags)) {
            $request->merge([
                'tags' => array_filter(array_map('trim', explode(',', $request->tags))),
            ]);
        }

        $validated = $request->validate([
            'emoji' => 'nullable|string|max:10',
            'name' => 'required|string|max:255',
            'cuisine' => 'required|string|max:100',
            'location' => 'nullable|string|max:255',
            'date_visited' => 'required|date',
            'visit_dates' => 'nullable|array',
            'visit_dates.*' => 'date',
            'overall_rating' => 'required|numeric|min:0|max:5',
            'price_range' => 'required|in:$,$$,$$$,$$$$',
            'review' => 'nullable|string|max:5000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'atmosphere_rating' => 'nullable|integer|min:1|max:5',
            'service_rating' => 'nullable|integer|min:1|max:5',
            'value_rating' => 'nullable|integer|min:1|max:5',
        ]);

        $restaurant->captureRevision(
            $request->user(),
            ['dishes' => $restaurant->dishes->toArray()],
        );

        // Sync visit_dates
        if (! empty($validated['visit_dates'])) {
            $sorted = $validated['visit_dates'];
            sort($sorted);
            $validated['visit_dates'] = $sorted;
            $validated['date_visited'] = end($sorted);
        } else {
            $validated['visit_dates'] = [$validated['date_visited']];
        }

        $restaurant->update($validated);

        return redirect()->route('restaurants.show', $restaurant)
            ->with('flash.type', 'ok')
            ->with('flash.message', 'Review updated!');
    }
}
