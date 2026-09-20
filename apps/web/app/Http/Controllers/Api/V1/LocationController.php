<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $locations = $query->limit(50)->get()->map(function (Location $loc) {
            return [
                'name' => $loc->name,
                'display_name' => $loc->display_name,
            ];
        });

        return response()->json(['data' => $locations]);
    }
}
