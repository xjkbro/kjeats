<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\RestaurantResource;
use App\Models\Cuisine;
use App\Models\Group;
use App\Models\Location;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RestaurantController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $scope = $request->query('scope', 'mine');
        $scopeGroupId = ($scope !== 'mine') ? (int) $scope : null;

        $query = $user->restaurants()->with('dishes');

        if ($scopeGroupId) {
            $scopeGroup = $user->groups->firstWhere('id', $scopeGroupId);

            if ($scopeGroup) {
                $memberIds = Group::find($scopeGroupId)->members()->pluck('users.id');
                $query = Restaurant::whereIn('user_id', $memberIds)->with(['dishes', 'user']);
            }
        }

        $restaurants = $query->orderByDesc('date_visited')->paginate(15);

        return response()->json([
            'data' => RestaurantResource::collection($restaurants),
            'meta' => [
                'current_page' => $restaurants->currentPage(),
                'last_page' => $restaurants->lastPage(),
                'per_page' => $restaurants->perPage(),
                'total' => $restaurants->total(),
            ],
        ]);
    }

    public function show(Request $request, Restaurant $restaurant): JsonResponse
    {
        $this->authorize('view', $restaurant);

        $restaurant->load(['dishes.user', 'dishes.images', 'images', 'group']);

        return response()->json(['data' => new RestaurantResource($restaurant)]);
    }

    public function store(Request $request): JsonResponse
    {
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

        if (! empty($validated['visit_dates'])) {
            $sorted = $validated['visit_dates'];
            sort($sorted);
            $validated['visit_dates'] = $sorted;
            $validated['date_visited'] = end($sorted);
        } else {
            $validated['visit_dates'] = [$validated['date_visited']];
        }

        if (! empty($validated['cuisine'])) {
            $cuisine = Cuisine::firstOrCreate(
                ['name' => $validated['cuisine']],
                ['slug' => Str::slug($validated['cuisine'])]
            );
            $validated['cuisine'] = $cuisine->name;
        }

        if (! empty($validated['location'])) {
            $location = Location::findOrCreate($validated['location']);
            $validated['location'] = $location->name;
            $validated['location_id'] = $location->id;
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

        return response()->json(['data' => new RestaurantResource($restaurant->load('dishes'))], 201);
    }

    public function update(Request $request, Restaurant $restaurant): JsonResponse
    {
        $this->authorize('update', $restaurant);

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

        if (! empty($validated['visit_dates'])) {
            $sorted = $validated['visit_dates'];
            sort($sorted);
            $validated['visit_dates'] = $sorted;
            $validated['date_visited'] = end($sorted);
        } else {
            $validated['visit_dates'] = [$validated['date_visited']];
        }

        if (! empty($validated['cuisine'])) {
            $cuisine = Cuisine::firstOrCreate(
                ['name' => $validated['cuisine']],
                ['slug' => Str::slug($validated['cuisine'])]
            );
            $validated['cuisine'] = $cuisine->name;
        }

        if (! empty($validated['location'])) {
            $location = Location::findOrCreate($validated['location']);
            $validated['location'] = $location->name;
            $validated['location_id'] = $location->id;
        }

        $restaurant->update($validated);

        return response()->json(['data' => new RestaurantResource($restaurant->load('dishes'))]);
    }

    public function logRevisit(Request $request, Restaurant $restaurant): JsonResponse
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
        ]);

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

        foreach ($newDishes as $dish) {
            $restaurant->dishes()->create([
                ...$dish,
                'user_id' => $request->user()->id,
            ]);
        }

        return response()->json(['data' => new RestaurantResource($restaurant->load('dishes'))]);
    }
}
