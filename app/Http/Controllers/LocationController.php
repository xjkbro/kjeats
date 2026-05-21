<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('q');

        $query = Location::query()->orderBy('display_name');

        if ($search) {
            $normalized = strtolower(trim($search));
            $query->where(function ($q) use ($normalized) {
                $q->whereRaw('LOWER(name) LIKE ?', ['%'.$normalized.'%'])
                    ->orWhereRaw('LOWER(display_name) LIKE ?', ['%'.$normalized.'%']);
            });
        }

        $locations = $query->limit(20)->get()->map(function (Location $loc) {
            return [
                'name' => $loc->name,
                'display_name' => $loc->display_name,
            ];
        });

        return response()->json($locations);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $name = Location::normalize($validated['name']);
        $similar = Location::findSimilar($name);

        if ($similar) {
            return response()->json([
                'suggestion' => $similar->name,
                'message' => "Did you mean '{$similar->name}'?",
            ], 422);
        }

        $location = Location::findOrCreate($name);

        return response()->json([
            'name' => $location->name,
            'display_name' => $location->display_name,
            'created' => $location->wasRecentlyCreated,
        ]);
    }

    public function settings(Request $request): Response
    {
        $user = $request->user();
        $locations = Location::orderBy('display_name')->get();

        $yourLocations = Restaurant::where('user_id', $user->id)
            ->whereNotNull('location_id')
            ->with('location')
            ->get()
            ->pluck('location.name')
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('settings/locations', [
            'locations' => $locations,
            'your_locations' => $yourLocations,
        ]);
    }
}
