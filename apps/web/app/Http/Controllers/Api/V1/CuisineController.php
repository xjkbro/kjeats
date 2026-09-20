<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Cuisine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CuisineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('q');

        $query = Cuisine::query()->orderBy('name');

        if ($search) {
            $query->where('name', 'like', '%'.$search.'%');
        }

        return response()->json(['data' => $query->limit(50)->pluck('name')->values()]);
    }
}
