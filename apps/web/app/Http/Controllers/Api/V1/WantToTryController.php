<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\RestaurantResource;
use App\Http\Resources\Api\V1\WantToTryResource;
use App\Models\Cuisine;
use App\Models\Group;
use App\Models\Location;
use App\Models\WantToTry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WantToTryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $scope = $request->query('scope', 'mine');
        $scopeGroupId = ($scope !== 'mine') ? (int) $scope : null;

        $query = $user->wantToTries()->with('user')->whereNull('restaurant_id');

        if ($scopeGroupId) {
            $scopeGroup = $user->groups->firstWhere('id', $scopeGroupId);

            if ($scopeGroup) {
                $memberIds = Group::find($scopeGroupId)->members()->pluck('users.id');
                $query = WantToTry::whereIn('user_id', $memberIds)->with('user')->whereNull('restaurant_id');
            }
        }

        $items = $query->with('locationRelation')->latest()->paginate(15);

        return response()->json([
            'data' => WantToTryResource::collection($items),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function show(Request $request, WantToTry $wantToTry): JsonResponse
    {
        $this->authorize('view', $wantToTry);

        return response()->json(['data' => new WantToTryResource($wantToTry->load('user'))]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cuisine' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
        ]);

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

        $item = $request->user()->wantToTries()->create([
            ...$validated,
            'emoji' => '🍽️',
        ]);

        return response()->json(['data' => new WantToTryResource($item)], 201);
    }

    public function destroy(Request $request, WantToTry $wantToTry): JsonResponse
    {
        $this->authorize('delete', $wantToTry);

        $wantToTry->delete();

        return response()->json(['message' => 'Want to Try removed.']);
    }

    public function convertToReview(Request $request, WantToTry $wantToTry): JsonResponse
    {
        $this->authorize('view', $wantToTry);

        $restaurant = $wantToTry->restaurant()->updateOrCreate(
            [
                'user_id' => $wantToTry->user_id,
                'name' => $wantToTry->name,
            ],
            [
                'emoji' => $wantToTry->emoji,
                'cuisine' => $wantToTry->cuisine ?? '',
                'location' => $wantToTry->location,
                'date_visited' => now()->format('Y-m-d'),
                'visit_dates' => [now()->format('Y-m-d')],
                'overall_rating' => 0,
                'price_range' => '$$',
            ],
        );

        $wantToTry->update(['restaurant_id' => $restaurant->id]);

        return response()->json(['data' => new RestaurantResource($restaurant)], 201);
    }
}
