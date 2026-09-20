<?php

use App\Models\Recipe;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

test('recipe index lists the authenticated user\'s recipes with details', function () {
    $recipe = Recipe::factory()->create(['user_id' => $this->user->id]);
    $recipe->ingredients()->create(['amount' => '2', 'unit' => 'cups', 'name' => 'Flour', 'sort_order' => 1]);
    $recipe->steps()->create(['step_number' => 1, 'instruction' => 'Mix it all.']);
    Recipe::factory()->create(['user_id' => User::factory()->create()->id]);

    $response = $this->getJson(route('api.v1.recipes.index'));

    $response->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonCount(1, 'data')
        ->assertJsonCount(1, 'data.0.ingredients')
        ->assertJsonCount(1, 'data.0.steps');
});

test('users can create a recipe with ingredients, steps, and nutrition', function () {
    $response = $this->postJson(route('api.v1.recipes.store'), [
        'name' => 'Grandma\'s Soup',
        'category' => 'Dinner',
        'difficulty' => 'Easy',
        'description' => 'Comfort in a bowl.',
        'prep_time' => 10,
        'cook_time' => 40,
        'servings' => 4,
        'ingredients' => [
            ['amount' => '2', 'unit' => 'cups', 'name' => 'Stock'],
        ],
        'steps' => [
            ['instruction' => 'Boil.'],
        ],
        'has_nutrition' => true,
        'calories' => 220,
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Grandma\'s Soup')
        ->assertJsonCount(1, 'data.ingredients')
        ->assertJsonCount(1, 'data.steps')
        ->assertJsonPath('data.nutrition.calories', 220);

    expect(Recipe::where('name', 'Grandma\'s Soup')->first()->user_id)->toBe($this->user->id);
});

test('recipe creation validates required fields', function () {
    $response = $this->postJson(route('api.v1.recipes.store'), [
        'name' => '',
        'difficulty' => 'Impossible',
        'servings' => 0,
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'category', 'difficulty', 'prep_time', 'cook_time', 'servings']);
});

test('users can view their own recipe', function () {
    $recipe = Recipe::factory()->create(['user_id' => $this->user->id]);

    $response = $this->getJson(route('api.v1.recipes.show', $recipe));

    $response->assertOk()->assertJsonPath('data.id', $recipe->id);
});

test('users cannot view another user\'s recipe', function () {
    $recipe = Recipe::factory()->create(['user_id' => User::factory()->create()->id]);

    $response = $this->getJson(route('api.v1.recipes.show', $recipe));

    $response->assertForbidden();
});

test('users can update a recipe and its steps are replaced', function () {
    $recipe = Recipe::factory()->create(['user_id' => $this->user->id]);
    $recipe->steps()->create(['step_number' => 1, 'instruction' => 'Old step.']);

    $response = $this->putJson(route('api.v1.recipes.update', $recipe), [
        'name' => 'Updated Soup',
        'category' => $recipe->category,
        'difficulty' => $recipe->difficulty,
        'prep_time' => 15,
        'cook_time' => 30,
        'servings' => 2,
        'steps' => [
            ['instruction' => 'New step one.'],
            ['instruction' => 'New step two.'],
        ],
    ]);

    $response->assertOk()
        ->assertJsonPath('data.name', 'Updated Soup')
        ->assertJsonCount(2, 'data.steps');

    expect($recipe->fresh()->steps()->count())->toBe(2)
        ->and($recipe->revisions()->count())->toBe(1);
});

test('users can delete their own recipe', function () {
    $recipe = Recipe::factory()->create(['user_id' => $this->user->id]);

    $response = $this->deleteJson(route('api.v1.recipes.destroy', $recipe));

    $response->assertOk();
    expect(Recipe::find($recipe->id))->toBeNull();
});
