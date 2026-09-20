<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NutritionController extends Controller
{
    public function calculate(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'servings' => 'nullable|integer|min:1',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.amount' => 'required|string',
            'ingredients.*.unit' => 'nullable|string',
            'ingredients.*.name' => 'required|string',
        ]);

        $ingredientList = collect($request->ingredients)
            ->map(fn ($i) => trim("{$i['amount']} {$i['unit']} {$i['name']}"))
            ->join("\n");

        $name = $request->name ?? 'Recipe';
        $servings = $request->servings ?? 4;

        $prompt = $this->buildPrompt($name, $servings, $ingredientList);

        Log::info("Nutrition prompt: {$prompt}");

        if ($key = config('services.gemini.key')) {
            $result = $this->callGemini($key, $prompt);
            if ($result !== null) {
                return response()->json($result);
            }
        }

        if ($key = config('services.openrouter.key')) {
            $result = $this->callOpenRouter($key, $prompt);
            if ($result !== null) {
                return response()->json($result);
            }
        }

        return response()->json(['error' => 'AI request failed. Ensure GEMINI_API_KEY or OPENROUTER_API_KEY is set.'], 503);
    }

    private function buildPrompt(string $name, int $servings, string $ingredientList): string
    {
        return <<<EOT
            You are a nutrition expert. Estimate the nutritional content for this recipe.
            Recipe: {$name}
            Ingredients:
            {$ingredientList}

            Provide reasonable Serving Size and number of servings based on the recipe.
            Return ONLY a valid JSON object (no markdown, no extra text) with per-serving values using this exact shape:
            {
              "serving_size": "e.g. 1 cup (240g)",
              "servings_per_container": {$servings},
              "calories": 0,
              "total_fat_g": "0",
              "saturated_fat_g": "0",
              "trans_fat_g": "0",
              "cholesterol_mg": "0",
              "sodium_mg": "0",
              "total_carbohydrate_g": "0",
              "dietary_fiber_g": "0",
              "total_sugars_g": "0",
              "added_sugars_g": "0",
              "protein_g": "0",
              "vitamin_d_mcg": "0",
              "calcium_mg": "0",
              "iron_mg": "0",
              "potassium_mg": "0"
            }
            EOT;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function callGemini(string $apiKey, string $prompt): ?array
    {
        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}",
            [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                ],
            ]
        );

        if ($response->failed()) {
            return null;
        }

        $text = data_get($response->json(), 'candidates.0.content.parts.0.text', '{}');
        $nutrition = json_decode($text, true);

        return is_array($nutrition) ? $nutrition : null;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function callOpenRouter(string $apiKey, string $prompt): ?array
    {
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'HTTP-Referer' => config('app.url'),
            'X-Title' => config('app.name'),
        ])->post('https://openrouter.ai/api/v1/chat/completions', [
            'model' => 'deepseek/deepseek-v4-flash:free',
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
            'response_format' => ['type' => 'json_object'],
        ]);

        if ($response->failed()) {
            return null;
        }

        $text = data_get($response->json(), 'choices.0.message.content', '{}');
        $nutrition = json_decode($text, true);

        return is_array($nutrition) ? $nutrition : null;
    }
}
