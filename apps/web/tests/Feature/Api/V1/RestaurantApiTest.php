<?php

use App\Models\Dish;
use App\Models\Restaurant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

test('restaurant index only lists the authenticated user\'s restaurants', function () {
    Restaurant::factory()->count(2)->create(['user_id' => $this->user->id]);
    Restaurant::factory()->create(['user_id' => User::factory()->create()->id]);

    $response = $this->getJson(route('api.v1.restaurants.index'));

    $response->assertOk()
        ->assertJsonPath('meta.total', 2)
        ->assertJsonCount(2, 'data');
});

test('users can create a restaurant with dishes', function () {
    $response = $this->postJson(route('api.v1.restaurants.store'), [
        'name' => 'The Golden Fork',
        'cuisine' => 'Italian',
        'location' => 'Downtown',
        'date_visited' => '2026-09-15',
        'overall_rating' => 4.5,
        'price_range' => '$$',
        'review' => 'Wonderful pasta.',
        'dishes' => [
            ['name' => 'Carbonara', 'rating' => 5, 'notes' => 'Creamy'],
        ],
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'The Golden Fork')
        ->assertJsonPath('data.overall_rating', '4.5')
        ->assertJsonCount(1, 'data.dishes');

    $restaurant = Restaurant::where('name', 'The Golden Fork')->first();
    expect($restaurant->user_id)->toBe($this->user->id)
        ->and($restaurant->visit_dates)->toBe(['2026-09-15'])
        ->and($restaurant->dishes()->count())->toBe(1);
});

test('creating a restaurant resolves or creates the cuisine and location', function () {
    $response = $this->postJson(route('api.v1.restaurants.store'), [
        'name' => 'New Spot',
        'cuisine' => 'Klingon',
        'location' => 'Starfleet HQ',
        'date_visited' => '2026-09-15',
        'overall_rating' => 3.5,
        'price_range' => '$$$',
    ]);

    $response->assertCreated();

    $this->assertDatabaseHas('cuisines', ['name' => 'Klingon']);
    $this->assertDatabaseHas('locations', ['name' => 'Starfleet HQ']);
});

test('restaurant name and ratings are validated', function () {
    $response = $this->postJson(route('api.v1.restaurants.store'), [
        'name' => '',
        'overall_rating' => 9,
        'price_range' => 'expensive',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'overall_rating', 'price_range', 'cuisine']);
});

test('users can view their own restaurant', function () {
    $restaurant = Restaurant::factory()->create(['user_id' => $this->user->id]);
    Dish::factory()->create(['restaurant_id' => $restaurant->id, 'user_id' => $this->user->id]);

    $response = $this->getJson(route('api.v1.restaurants.show', $restaurant));

    $response->assertOk()
        ->assertJsonPath('data.id', $restaurant->id)
        ->assertJsonCount(1, 'data.dishes');
});

test('users cannot view another user\'s restaurant', function () {
    $restaurant = Restaurant::factory()->create(['user_id' => User::factory()->create()->id]);

    $response = $this->getJson(route('api.v1.restaurants.show', $restaurant));

    $response->assertForbidden();
});

test('users can update their restaurant and a revision is captured', function () {
    $restaurant = Restaurant::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Old Name',
        'overall_rating' => 3.0,
    ]);

    $response = $this->putJson(route('api.v1.restaurants.update', $restaurant), [
        'name' => 'New Name',
        'cuisine' => $restaurant->cuisine,
        'location' => $restaurant->location,
        'date_visited' => '2026-09-16',
        'overall_rating' => 4.5,
        'price_range' => '$$$',
        'review' => $restaurant->review,
        'tags' => ['Fine Dining'],
        'atmosphere_rating' => 4,
        'service_rating' => 4,
        'value_rating' => 5,
    ]);

    $response->assertOk()->assertJsonPath('data.name', 'New Name');

    expect($restaurant->fresh()->name)->toBe('New Name')
        ->and($restaurant->revisions()->count())->toBe(1);
});

test('users can log a revisit with new dishes', function () {
    $restaurant = Restaurant::factory()->create(['user_id' => $this->user->id]);

    $response = $this->postJson(route('api.v1.restaurants.revisit.store', $restaurant), [
        'visit_date' => '2026-09-18',
        'overall_rating' => 5,
        'dishes' => [
            ['name' => 'Truffle Risotto', 'rating' => 5, 'notes' => null],
        ],
    ]);

    $response->assertOk()
        ->assertJsonPath('data.overall_rating', '5.0')
        ->assertJsonCount(1, 'data.dishes');

    expect($restaurant->fresh()->visit_dates)->toContain('2026-09-18')
        ->and($restaurant->revisions()->count())->toBe(1)
        ->and($restaurant->dishes()->count())->toBe(1);
});

test('users can add a dish to a restaurant', function () {
    $restaurant = Restaurant::factory()->create(['user_id' => $this->user->id]);

    $response = $this->postJson(route('api.v1.restaurants.dishes.store', $restaurant), [
        'name' => 'Tiramisu',
        'rating' => 4.5,
        'notes' => 'Airy',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Tiramisu')
        ->assertJsonPath('data.rating', '4.5');
});

test('users can delete their own dish', function () {
    $restaurant = Restaurant::factory()->create(['user_id' => $this->user->id]);
    $dish = Dish::factory()->create(['restaurant_id' => $restaurant->id, 'user_id' => $this->user->id]);

    $response = $this->deleteJson(route('api.v1.restaurants.dishes.destroy', [$restaurant, $dish]));

    $response->assertOk();
    expect(Dish::find($dish->id))->toBeNull();
});
