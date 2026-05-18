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

        $user = $request->user();
        $groupId = (int) config('app.frontend_group_id', 0);
        $canAddDish = $user->id === $restaurant->user_id;
        if (! $canAddDish && $groupId > 0) {
            $group = Group::find($groupId);
            $canAddDish = $group && $group->isMember($user);
        }

        return Inertia::render('portal/restaurants/show', [
            'restaurant' => $restaurant->load(['dishes.user', 'dishes.images', 'revisions.user', 'images']),
            'can_add_dish' => $canAddDish,
            'current_user_id' => $request->user()->id,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('portal/restaurants/create', [
            'all_tags' => auth()->user()->restaurants()->pluck('tags')->flatten()->unique()->sort()->values()->toArray(),
        ]);
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
            'restaurant_photo' => 'nullable|image|max:20480',
            'dishes.*.photo' => 'nullable|image|max:20480',
        ]);

        $restaurantPhoto = $request->file('restaurant_photo');
        unset($validated['restaurant_photo']);
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

        if ($restaurantPhoto) {
            $path = $restaurantPhoto->store('media', 'public');
            $restaurant->images()->create([
                'user_id' => $request->user()->id,
                'filename' => $path,
                'original_name' => $restaurantPhoto->getClientOriginalName(),
                'mime_type' => $restaurantPhoto->getMimeType(),
                'size' => $restaurantPhoto->getSize(),
            ]);
        }

        foreach ($dishes as $i => $dish) {
            $dishPhoto = $request->file("dishes.{$i}.photo");
            unset($dish['photo']);
            $created = $restaurant->dishes()->create([
                ...$dish,
                'user_id' => $request->user()->id,
            ]);

            if ($dishPhoto) {
                $path = $dishPhoto->store('media', 'public');
                $created->images()->create([
                    'user_id' => $request->user()->id,
                    'filename' => $path,
                    'original_name' => $dishPhoto->getClientOriginalName(),
                    'mime_type' => $dishPhoto->getMimeType(),
                    'size' => $dishPhoto->getSize(),
                ]);
            }
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
            'all_tags' => auth()->user()->restaurants()->pluck('tags')->flatten()->unique()->sort()->values()->toArray(),
        ]);
    }

    public function showRevisit(Restaurant $restaurant): Response
    {
        $this->authorize('update', $restaurant);

        return Inertia::render('portal/restaurants/revisit', [
            'restaurant' => $restaurant->load('dishes'),
        ]);
    }

    public function logRevisit(Request $request, Restaurant $restaurant): RedirectResponse
    {
        $this->authorize('update', $restaurant);

        $validated = $request->validate([
            'visit_date' => 'required|date',
            'overall_rating' => 'nullable|numeric|min:1|max:5',
            'atmosphere_rating' => 'nullable|integer|min:1|max:5',
            'service_rating' => 'nullable|integer|min:1|max:5',
            'value_rating' => 'nullable|integer|min:1|max:5',
            'review' => 'nullable|string|max:5000',
            'dishes' => 'nullable|array',
            'dishes.*.name' => 'required|string|max:255',
            'dishes.*.rating' => 'required|numeric|min:1|max:5',
            'dishes.*.notes' => 'nullable|string|max:1000',
            'dishes.*.photo' => 'nullable|image|max:20480',
        ]);

        // Capture snapshot before any changes
        $summaryParts = [];
        $newDishes = $validated['dishes'] ?? [];
        unset($validated['dishes']);

        if (! empty($newDishes)) {
            $summaryParts[] = 'added '.count($newDishes).' dish'.(count($newDishes) > 1 ? 'es' : '');
        }

        $ratingChanged = isset($validated['overall_rating']) && (string) $validated['overall_rating'] !== (string) $restaurant->overall_rating;
        if ($ratingChanged) {
            $summaryParts[] = 'updated rating';
        }

        if (! empty($validated['review']) && $validated['review'] !== $restaurant->review) {
            $summaryParts[] = 'updated review';
        }

        $visitDate = $validated['visit_date'];
        $summary = 'Revisited on '.date('M j, Y', strtotime($visitDate));
        if (! empty($summaryParts)) {
            $summary .= ' — '.implode(', ', $summaryParts);
        }

        $restaurant->captureRevision(
            $request->user(),
            ['dishes' => $restaurant->dishes->toArray()],
            $summary,
        );

        // Append visit date and update date_visited if newer
        $visitDates = array_unique(array_merge($restaurant->visit_dates ?? [], [$visitDate]));
        sort($visitDates);

        $updates = [
            'visit_dates' => $visitDates,
            'date_visited' => end($visitDates),
        ];

        if (isset($validated['overall_rating'])) {
            $updates['overall_rating'] = $validated['overall_rating'];
        }

        foreach (['atmosphere_rating', 'service_rating', 'value_rating'] as $field) {
            if (isset($validated[$field])) {
                $updates[$field] = $validated[$field];
            }
        }

        if (! empty($validated['review'])) {
            $updates['review'] = $validated['review'];
        }

        $restaurant->update($updates);

        foreach ($newDishes as $i => $dish) {
            $dishPhoto = $request->file("dishes.{$i}.photo");
            unset($dish['photo']);
            $created = $restaurant->dishes()->create([
                ...$dish,
                'user_id' => $request->user()->id,
            ]);

            if ($dishPhoto) {
                $path = $dishPhoto->store('media', 'public');
                $created->images()->create([
                    'user_id' => $request->user()->id,
                    'filename' => $path,
                    'original_name' => $dishPhoto->getClientOriginalName(),
                    'mime_type' => $dishPhoto->getMimeType(),
                    'size' => $dishPhoto->getSize(),
                ]);
            }
        }

        return redirect()->route('restaurants.show', $restaurant)
            ->with('flash.type', 'ok')
            ->with('flash.message', 'Revisit logged!');
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
