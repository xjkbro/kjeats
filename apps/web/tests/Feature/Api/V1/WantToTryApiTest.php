<?php

use App\Models\Restaurant;
use App\Models\User;
use App\Models\WantToTry;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

test('want-to-try index lists the user\'s unconverted items', function () {
    WantToTry::factory()->count(2)->create(['user_id' => $this->user->id]);
    WantToTry::factory()->create(['user_id' => User::factory()->create()->id]);

    $convertedRestaurant = Restaurant::factory()->create(['user_id' => $this->user->id]);
    WantToTry::factory()->create(['user_id' => $this->user->id, 'restaurant_id' => $convertedRestaurant->id]);

    $response = $this->getJson(route('api.v1.want-to-try.index'));

    $response->assertOk()
        ->assertJsonPath('meta.total', 2)
        ->assertJsonCount(2, 'data');
});

test('users can create a want-to-try item', function () {
    $response = $this->postJson(route('api.v1.want-to-try.store'), [
        'name' => 'The Hidden Gem',
        'cuisine' => 'Peruvian',
        'location' => 'Old Town',
        'notes' => 'Try the ceviche.',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'The Hidden Gem')
        ->assertJsonPath('data.is_converted', false);
});

test('want-to-try name is required', function () {
    $response = $this->postJson(route('api.v1.want-to-try.store'), [
        'name' => '',
    ]);

    $response->assertStatus(422)->assertJsonValidationErrors('name');
});

test('users can delete their own want-to-try item', function () {
    $item = WantToTry::factory()->create(['user_id' => $this->user->id]);

    $response = $this->deleteJson(route('api.v1.want-to-try.destroy', $item));

    $response->assertOk();
    expect(WantToTry::find($item->id))->toBeNull();
});

test('users cannot delete another user\'s want-to-try item', function () {
    $item = WantToTry::factory()->create(['user_id' => User::factory()->create()->id]);

    $response = $this->deleteJson(route('api.v1.want-to-try.destroy', $item));

    $response->assertForbidden();
});

test('users can convert a want-to-try item into a restaurant review', function () {
    $item = WantToTry::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Ceviche Palace',
        'cuisine' => 'Peruvian',
        'location' => 'Old Town',
    ]);

    $response = $this->postJson(route('api.v1.want-to-try.convert', $item));

    $response->assertCreated();

    expect($item->fresh()->restaurant_id)->not->toBeNull()
        ->and($this->user->restaurants()->where('name', 'Ceviche Palace')->exists())->toBeTrue();
});
