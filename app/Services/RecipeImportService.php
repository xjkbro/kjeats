<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecipeImportService
{
    public function import(string $url): ?array
    {
        $html = $this->fetchPage($url);

        if ($html === null) {
            return null;
        }

        $result = $this->extractJsonLd($html);

        if ($result !== null) {
            return $result;
        }

        $pageText = $this->cleanHtml($html);

        if ($pageText === '') {
            return null;
        }

        return $this->extractViaAi($url, $pageText);
    }

    private function fetchPage(string $url): ?string
    {
        try {
            $response = Http::timeout(15)
                ->withUserAgent('Mozilla/5.0 (compatible; kjeats-bot/1.0)')
                ->get($url);

            return $response->failed() ? null : $response->body();
        } catch (\Exception $e) {
            Log::warning("RecipeImport: Failed to fetch URL: {$e->getMessage()}");

            return null;
        }
    }

    private function cleanHtml(string $html): string
    {
        $html = preg_replace('/<script[^>]*>.*?<\/script>/is', '', $html);
        $html = preg_replace('/<style[^>]*>.*?<\/style>/is', '', $html);
        $html = preg_replace('/<nav[^>]*>.*?<\/nav>/is', '', $html);
        $html = preg_replace('/<footer[^>]*>.*?<\/footer>/is', '', $html);
        $html = strip_tags($html);
        $html = preg_replace('/\s+/', ' ', $html);
        $html = trim($html);

        return mb_substr($html, 0, 15000);
    }

    private function extractJsonLd(string $html): ?array
    {
        preg_match_all('/<script[^>]*type="?application\/ld\+json"?[^>]*>(.*?)<\/script>/is', $html, $matches);

        foreach ($matches[1] as $json) {
            $data = json_decode($json, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                continue;
            }

            $recipes = [];

            $types = $data['@type'] ?? null;
            if (is_string($types) && $types === 'Recipe') {
                $recipes[] = $data;
            } elseif (is_array($types) && in_array('Recipe', $types, true)) {
                $recipes[] = $data;
            }

            foreach ($data['@graph'] ?? [] as $item) {
                $itemTypes = $item['@type'] ?? [];
                if (is_string($itemTypes)) {
                    $itemTypes = [$itemTypes];
                }
                if (is_array($itemTypes) && in_array('Recipe', $itemTypes, true)) {
                    $recipes[] = $item;
                }
            }

            foreach ($recipes as $recipe) {
                $parsed = $this->parseJsonLdRecipe($recipe);

                if ($parsed !== null) {
                    return $parsed;
                }
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $recipe
     * @return array<string, mixed>|null
     */
    private function parseJsonLdRecipe(array $recipe): ?array
    {
        $rawName = $recipe['name'] ?? null;

        if ($rawName === null) {
            return null;
        }

        $name = is_string($rawName) ? $rawName : ($rawName[0] ?? null);
        $name = $name !== null ? html_entity_decode($name, ENT_QUOTES | ENT_HTML5, 'UTF-8') : null;

        if ($name === null) {
            return null;
        }

        $description = is_string($recipe['description'] ?? null)
            ? html_entity_decode($recipe['description'], ENT_QUOTES | ENT_HTML5, 'UTF-8')
            : (is_array($recipe['description'] ?? null) ? html_entity_decode($recipe['description'][0] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8') : null);

        $prepTime = $this->parseIso8601Duration($recipe['prepTime'] ?? null);
        $cookTime = $this->parseIso8601Duration($recipe['cookTime'] ?? null);
        $totalTime = $this->parseIso8601Duration($recipe['totalTime'] ?? null);

        if ($cookTime === 0 && $totalTime > 0 && $prepTime > 0) {
            $cookTime = $totalTime - $prepTime;
        } elseif ($cookTime === 0 && $totalTime > 0) {
            $cookTime = (int) round($totalTime / 2);
        }

        $yield = $recipe['recipeYield'] ?? null;
        $servings = 4;
        if (is_string($yield)) {
            $parsed = (int) $yield;
            if ($parsed > 0) {
                $servings = $parsed;
            }
        } elseif (is_array($yield) && isset($yield[0])) {
            $parsed = (int) $yield[0];
            if ($parsed > 0) {
                $servings = $parsed;
            }
        }

        $category = null;
        $rawCategory = $recipe['recipeCategory'] ?? null;
        if (is_string($rawCategory)) {
            $category = $rawCategory;
        } elseif (is_array($rawCategory) && isset($rawCategory[0])) {
            $category = $rawCategory[0];
        }

        $category = $this->normalizeCategory($category);

        $cuisine = null;
        $rawCuisine = $recipe['recipeCuisine'] ?? null;
        if (is_string($rawCuisine)) {
            $cuisine = $rawCuisine;
        } elseif (is_array($rawCuisine) && isset($rawCuisine[0])) {
            $cuisine = $rawCuisine[0];
        }

        $tags = [];
        if ($cuisine !== null) {
            $tags[] = $cuisine;
        }

        $rawIngredients = $recipe['recipeIngredient'] ?? [];

        if (! is_array($rawIngredients) || $rawIngredients === []) {
            return null;
        }

        $ingredients = [];
        foreach ($rawIngredients as $raw) {
            $parsedIngredient = $this->parseIngredientString($raw);
            if ($parsedIngredient !== null) {
                $ingredients[] = $parsedIngredient;
            }
        }

        if ($ingredients === []) {
            return null;
        }

        $rawInstructions = $recipe['recipeInstructions'] ?? [];
        $steps = [];

        foreach ($rawInstructions as $instruction) {
            $text = is_string($instruction) ? $instruction : ($instruction['text'] ?? null);

            if ($text !== null) {
                $steps[] = ['instruction' => trim(html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8'))];
            }
        }

        if ($steps === []) {
            return null;
        }

        $emoji = $this->suggestEmoji($name, $tags);

        return [
            'name' => $name,
            'emoji' => $emoji,
            'category' => $category,
            'difficulty' => $this->inferDifficulty($cookTime),
            'description' => $description ?? '',
            'prep_time' => $prepTime,
            'cook_time' => $cookTime,
            'rest_time' => 0,
            'servings' => $servings,
            'tags' => $tags,
            'ingredients' => $ingredients,
            'steps' => $steps,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>|null
     */
    private function extractViaAi(string $url, string $pageText): ?array
    {
        $prompt = $this->buildPrompt($url, $pageText);

        if ($key = config('services.gemini.key')) {
            $result = $this->callGemini($key, $prompt);
            if ($result !== null) {
                return $result;
            }
        }

        if ($key = config('services.openrouter.key')) {
            $result = $this->callOpenRouter($key, $prompt);
            if ($result !== null) {
                return $result;
            }
        }

        return null;
    }

    private function buildPrompt(string $url, string $pageText): string
    {
        return <<<EOT
            You are a recipe extraction expert. Extract the recipe from the following webpage text.

            URL: {$url}
            Page content:
            {$pageText}

            Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
            {
              "name": "Recipe Name",
              "emoji": "🍛",
              "category": "Dinner",
              "difficulty": "Medium",
              "description": "Short description of the recipe",
              "prep_time": 15,
              "cook_time": 30,
              "rest_time": 0,
              "servings": 4,
              "tags": ["tag1", "tag2"],
              "ingredients": [
                {"amount": "1", "unit": "cup", "name": "Flour"}
              ],
              "steps": [
                {"instruction": "Step 1 description"}
              ]
            }

            Rules:
            - category must be one of: Breakfast, Lunch, Dinner, Dessert, Snack, Drink, Side, Other
            - difficulty must be: Easy, Medium, or Hard
            - emoji should be a relevant food emoji (default 📋)
            - prep_time, cook_time, rest_time are in minutes (use 0 if unknown)
            - servings is a number (default 4)
            - tags is an array of up to 5 relevant tags as strings
            - If you can't extract a field, use a reasonable default
            EOT;
    }

    /**
     * @param  array<string, mixed>  $result
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
        $data = json_decode($text, true);

        return is_array($data) ? $this->normalizeAiResult($data) : null;
    }

    /**
     * @param  array<string, mixed>  $result
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
        $data = json_decode($text, true);

        return is_array($data) ? $this->normalizeAiResult($data) : null;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalizeAiResult(array $data): array
    {
        $normalized = [
            'name' => $data['name'] ?? 'Imported Recipe',
            'emoji' => $data['emoji'] ?? '📋',
            'category' => $this->normalizeCategory($data['category'] ?? null),
            'difficulty' => in_array($data['difficulty'] ?? '', ['Easy', 'Medium', 'Hard'], true)
                ? $data['difficulty'] : 'Medium',
            'description' => $data['description'] ?? '',
            'prep_time' => (int) ($data['prep_time'] ?? 0),
            'cook_time' => (int) ($data['cook_time'] ?? 0),
            'rest_time' => (int) ($data['rest_time'] ?? 0),
            'servings' => max(1, (int) ($data['servings'] ?? 4)),
            'tags' => is_array($data['tags'] ?? null) ? $data['tags'] : [],
        ];

        $ingredients = [];
        foreach ($data['ingredients'] ?? [] as $i) {
            if (is_string($i)) {
                $parsed = $this->parseIngredientString($i);
                if ($parsed !== null) {
                    $ingredients[] = $parsed;
                }
            } elseif (is_array($i) && isset($i['name'])) {
                $ingredients[] = [
                    'amount' => (string) ($i['amount'] ?? ''),
                    'unit' => (string) ($i['unit'] ?? ''),
                    'name' => (string) $i['name'],
                ];
            }
        }
        $normalized['ingredients'] = $ingredients;

        $steps = [];
        foreach ($data['steps'] ?? [] as $s) {
            if (is_string($s)) {
                $steps[] = ['instruction' => $s];
            } elseif (is_array($s) && isset($s['instruction'])) {
                $steps[] = ['instruction' => (string) $s['instruction']];
            }
        }
        $normalized['steps'] = $steps;

        return $normalized;
    }

    /**
     * @return array{amount: string, unit: string, name: string}|null
     */
    private function parseIngredientString(string $raw): ?array
    {
        $raw = trim($raw);

        if ($raw === '') {
            return null;
        }

        $pattern = '/^(?:(?<amount>[\d\s\-\/\.,¼½¾⅓⅔⅛⅜⅝⅞]+)\s+)?(?:(?<unit>(?:cups?|tablespoons?|tbsp|teaspoons?|tsp|ounces?|oz|pounds?|lbs?|lb|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l|pieces?|pcs|cloves?|slices?|sprigs?|bunch|bunches|handful|pinch|dash|cans?|packages?|pkg|packets?|sticks?|heads?|strips?|scoops?|drops?|envelopes?)\b\.?)\s+)?(?<name>.+)$/i';

        if (preg_match($pattern, $raw, $m)) {
            $amount = trim($m['amount'] ?? '');
            $unit = trim($m['unit'] ?? '');
            $name = trim($m['name'] ?? $raw);

            $name = preg_replace('/[\(\[].*?[\)\]]$/', '', $name);
            $name = trim($name);

            if ($name === '') {
                return null;
            }

            return [
                'amount' => $amount,
                'unit' => $this->normalizeUnit($unit),
                'name' => $this->decodeName($name),
            ];
        }

        return [
            'amount' => '',
            'unit' => '',
            'name' => $this->decodeName($raw),
        ];
    }

    private function decodeName(string $name): string
    {
        return html_entity_decode(trim($name), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    private function normalizeUnit(string $unit): string
    {
        $map = [
            'tablespoons' => 'tbsp',
            'tablespoon' => 'tbsp',
            'teaspoons' => 'tsp',
            'teaspoon' => 'tsp',
            'ounces' => 'oz',
            'ounce' => 'oz',
            'pounds' => 'lb',
            'pound' => 'lb',
            'lbs' => 'lb',
            'grams' => 'g',
            'gram' => 'g',
            'kilograms' => 'kg',
            'kilogram' => 'kg',
            'milliliters' => 'ml',
            'milliliter' => 'ml',
            'liters' => 'l',
            'liter' => 'l',
            'pieces' => 'pcs',
            'piece' => 'pcs',
            'package' => 'pkg',
            'packages' => 'pkg',
            'cups' => 'cup',
        ];

        return $map[strtolower($unit)] ?? $unit;
    }

    private function normalizeCategory(?string $category): string
    {
        $valid = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Drink', 'Side', 'Other'];

        if ($category !== null) {
            $normalized = ucfirst(strtolower(trim($category)));

            if (in_array($normalized, $valid, true)) {
                return $normalized;
            }

            if (stripos($category, 'dinner') !== false || stripos($category, 'main') !== false || stripos($category, 'entree') !== false) {
                return 'Dinner';
            }

            if (stripos($category, 'breakfast') !== false || stripos($category, 'brunch') !== false) {
                return 'Breakfast';
            }

            if (stripos($category, 'lunch') !== false) {
                return 'Lunch';
            }

            if (stripos($category, 'dessert') !== false || stripos($category, 'sweet') !== false) {
                return 'Dessert';
            }

            if (stripos($category, 'snack') !== false || stripos($category, 'appetizer') !== false) {
                return 'Snack';
            }

            if (stripos($category, 'drink') !== false || stripos($category, 'beverage') !== false || stripos($category, 'cocktail') !== false || stripos($category, 'smoothie') !== false) {
                return 'Drink';
            }

            if (stripos($category, 'side') !== false) {
                return 'Side';
            }
        }

        return 'Dinner';
    }

    private function inferDifficulty(?int $cookTimeMinutes): string
    {
        if ($cookTimeMinutes === null || $cookTimeMinutes <= 0) {
            return 'Medium';
        }

        if ($cookTimeMinutes <= 20) {
            return 'Easy';
        }

        if ($cookTimeMinutes <= 60) {
            return 'Medium';
        }

        return 'Hard';
    }

    private function parseIso8601Duration(?string $duration): int
    {
        if ($duration === null) {
            return 0;
        }

        $totalMinutes = 0;

        if (preg_match('/PT(?:(\d+)H)?(?:(\d+)M)?/', $duration, $m)) {
            if (isset($m[1])) {
                $totalMinutes += (int) $m[1] * 60;
            }
            if (isset($m[2])) {
                $totalMinutes += (int) $m[2];
            }
        }

        return $totalMinutes;
    }

    /**
     * @param  string[]  $tags
     */
    private function suggestEmoji(string $name, array $tags): string
    {
        $name = strtolower($name);

        $emojiMap = [
            'beef' => '🥩',
            'chicken' => '🍗',
            'pork' => '🥩',
            'pasta' => '🍝',
            'pizza' => '🍕',
            'rice' => '🍚',
            'sushi' => '🍣',
            'salad' => '🥗',
            'soup' => '🍜',
            'taco' => '🌮',
            'burger' => '🍔',
            'sandwich' => '🥪',
            'bread' => '🍞',
            'cake' => '🎂',
            'cookie' => '🍪',
            'pie' => '🥧',
            'ice cream' => '🍦',
            'smoothie' => '🥤',
            'coffee' => '☕',
            'tea' => '🫖',
            'egg' => '🥚',
            'fish' => '🐟',
            'shrimp' => '🦐',
            'noodle' => '🍜',
            'ramen' => '🍜',
            'curry' => '🍛',
            'fry' => '🍟',
            'potato' => '🥔',
            'avocado' => '🥑',
            'cheese' => '🧀',
            'chocolate' => '🍫',
            'pancake' => '🥞',
            'waffle' => '🧇',
            'donut' => '🍩',
            'muffin' => '🧁',
            'bagel' => '🥯',
            'burrito' => '🌯',
            'falafel' => '🧆',
            'popcorn' => '🍿',
            'steak' => '🥩',
            'broccoli' => '🥦',
            'dessert' => '🍰',
            'breakfast' => '🍳',
        ];

        foreach ($emojiMap as $keyword => $emoji) {
            if (str_contains($name, $keyword)) {
                return $emoji;
            }
        }

        foreach ($tags as $tag) {
            $tagLower = strtolower($tag);
            if (isset($emojiMap[$tagLower])) {
                return $emojiMap[$tagLower];
            }
        }

        return '📋';
    }
}
