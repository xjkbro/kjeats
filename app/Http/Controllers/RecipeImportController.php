<?php

namespace App\Http\Controllers;

use App\Services\RecipeImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecipeImportController extends Controller
{
    public function __invoke(Request $request, RecipeImportService $importer): JsonResponse
    {
        $request->validate([
            'url' => 'required|url|max:1000',
        ]);

        $url = $request->input('url');

        $result = $importer->import($url);

        if ($result === null) {
            return response()->json(['error' => 'Could not fetch or parse the provided URL.'], 422);
        }

        return response()->json($result);
    }
}
