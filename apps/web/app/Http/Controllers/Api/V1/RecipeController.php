<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\RecipeResource;
use App\Models\Recipe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $recipes = $request->user()
            ->recipes()
            ->with(['ingredients', 'steps', 'nutrition', 'images'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => RecipeResource::collection($recipes),
            'meta' => [
                'current_page' => $recipes->currentPage(),
                'last_page' => $recipes->lastPage(),
                'per_page' => $recipes->perPage(),
                'total' => $recipes->total(),
            ],
        ]);
    }

    public function show(Request $request, Recipe $recipe): JsonResponse
    {
        $this->authorize('view', $recipe);

        $recipe->load(['ingredients', 'steps', 'nutrition', 'images', 'group']);

        return response()->json(['data' => new RecipeResource($recipe)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateRecipe($request);

        $recipe = $request->user()->recipes()->create([
            'emoji' => $validated['emoji'] ?? '📋',
            'name' => $validated['name'],
            'category' => $validated['category'],
            'difficulty' => $validated['difficulty'],
            'description' => $validated['description'] ?? null,
            'prep_time' => $validated['prep_time'],
            'cook_time' => $validated['cook_time'],
            'rest_time' => $validated['rest_time'] ?? 0,
            'servings' => $validated['servings'],
            'tags' => $validated['tags'] ?? [],
            'group_id' => $validated['group_id'] ?? null,
        ]);

        $this->syncIngredientsAndSteps($recipe, $validated);
        $this->syncNutrition($recipe, $validated);

        return response()->json(['data' => new RecipeResource($recipe->load(['ingredients', 'steps', 'nutrition']))], 201);
    }

    public function update(Request $request, Recipe $recipe): JsonResponse
    {
        $this->authorize('update', $recipe);

        $validated = $this->validateRecipe($request);

        $recipe->captureRevision(
            $request->user(),
            [
                'ingredients' => $recipe->ingredients->toArray(),
                'steps' => $recipe->steps->toArray(),
            ],
        );

        $recipe->update([
            'emoji' => $validated['emoji'] ?? '📋',
            'name' => $validated['name'],
            'category' => $validated['category'],
            'difficulty' => $validated['difficulty'],
            'description' => $validated['description'] ?? null,
            'prep_time' => $validated['prep_time'],
            'cook_time' => $validated['cook_time'],
            'rest_time' => $validated['rest_time'] ?? 0,
            'servings' => $validated['servings'],
            'tags' => $validated['tags'] ?? [],
        ]);

        $recipe->ingredients()->delete();
        $recipe->steps()->delete();
        $this->syncIngredientsAndSteps($recipe, $validated);
        $this->syncNutrition($recipe, $validated);

        return response()->json(['data' => new RecipeResource($recipe->load(['ingredients', 'steps', 'nutrition']))]);
    }

    public function destroy(Request $request, Recipe $recipe): JsonResponse
    {
        $this->authorize('delete', $recipe);

        $recipe->delete();

        return response()->json(['message' => 'Recipe deleted.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateRecipe(Request $request): array
    {
        if (is_string($request->tags)) {
            $request->merge([
                'tags' => array_filter(array_map('trim', explode(',', $request->tags))),
            ]);
        }

        return $request->validate([
            'emoji' => 'nullable|string|max:10',
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'difficulty' => 'required|in:Easy,Medium,Hard',
            'description' => 'nullable|string|max:2000',
            'prep_time' => 'required|integer|min:0',
            'cook_time' => 'required|integer|min:0',
            'rest_time' => 'nullable|integer|min:0',
            'servings' => 'required|integer|min:1',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'ingredients' => 'nullable|array',
            'ingredients.*.amount' => 'required|string|max:20',
            'ingredients.*.unit' => 'nullable|string|max:20',
            'ingredients.*.name' => 'required|string|max:255',
            'steps' => 'nullable|array',
            'steps.*.instruction' => 'required|string|max:2000',
            'has_nutrition' => 'boolean',
            'serving_size' => 'nullable|string|max:50',
            'servings_per_container' => 'nullable|integer',
            'calories' => 'nullable|integer',
            'total_fat_g' => 'nullable|numeric',
            'saturated_fat_g' => 'nullable|numeric',
            'trans_fat_g' => 'nullable|numeric',
            'cholesterol_mg' => 'nullable|numeric',
            'sodium_mg' => 'nullable|numeric',
            'total_carbohydrate_g' => 'nullable|numeric',
            'dietary_fiber_g' => 'nullable|numeric',
            'total_sugars_g' => 'nullable|numeric',
            'added_sugars_g' => 'nullable|numeric',
            'protein_g' => 'nullable|numeric',
            'vitamin_d_mcg' => 'nullable|numeric',
            'calcium_mg' => 'nullable|numeric',
            'iron_mg' => 'nullable|numeric',
            'potassium_mg' => 'nullable|numeric',
            'group_id' => 'nullable|exists:groups,id',
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function syncIngredientsAndSteps(Recipe $recipe, array $validated): void
    {
        foreach ($validated['ingredients'] ?? [] as $i => $ingredient) {
            $recipe->ingredients()->create([...$ingredient, 'sort_order' => $i + 1]);
        }

        foreach ($validated['steps'] ?? [] as $i => $step) {
            $recipe->steps()->create([
                'step_number' => $i + 1,
                'instruction' => $step['instruction'],
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function syncNutrition(Recipe $recipe, array $validated): void
    {
        if (! empty($validated['has_nutrition'])) {
            $nutritionFields = array_filter(
                array_intersect_key($validated, array_flip([
                    'serving_size', 'servings_per_container', 'calories',
                    'total_fat_g', 'saturated_fat_g', 'trans_fat_g',
                    'cholesterol_mg', 'sodium_mg', 'total_carbohydrate_g',
                    'dietary_fiber_g', 'total_sugars_g', 'added_sugars_g',
                    'protein_g', 'vitamin_d_mcg', 'calcium_mg', 'iron_mg', 'potassium_mg',
                ])),
                fn ($v) => $v !== null && $v !== '',
            );

            if (! empty($nutritionFields)) {
                $recipe->nutrition()->updateOrCreate([], $nutritionFields);
            }

            return;
        }

        $recipe->nutrition()->delete();
    }
}
