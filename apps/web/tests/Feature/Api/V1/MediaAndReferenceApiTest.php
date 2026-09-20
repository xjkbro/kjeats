<?php

use App\Models\Cuisine;
use App\Models\Location;
use App\Models\Recipe;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

test('users can upload an image for their restaurant', function () {
    Storage::fake('public');
    $restaurant = Restaurant::factory()->create(['user_id' => $this->user->id]);

    $response = $this->postJson(route('api.v1.restaurants.images.store', $restaurant), [
        'image' => UploadedFile::fake()->image('pasta.jpg'),
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.original_name', 'pasta.jpg');

    expect($restaurant->images()->count())->toBe(1);
    Storage::disk('public')->assertExists($restaurant->images()->first()->filename);
});

test('image uploads are validated', function () {
    $restaurant = Restaurant::factory()->create(['user_id' => $this->user->id]);

    $response = $this->postJson(route('api.v1.restaurants.images.store', $restaurant), [
        'image' => 'not-a-file',
    ]);

    $response->assertStatus(422)->assertJsonValidationErrors('image');
});

test('users can upload an image for their recipe', function () {
    Storage::fake('public');
    $recipe = Recipe::factory()->create(['user_id' => $this->user->id]);

    $response = $this->postJson(route('api.v1.recipes.images.store', $recipe), [
        'image' => UploadedFile::fake()->image('cake.jpg'),
    ]);

    $response->assertCreated();
    expect($recipe->images()->count())->toBe(1);
});

test('users can delete their own media', function () {
    Storage::fake('public');
    $restaurant = Restaurant::factory()->create(['user_id' => $this->user->id]);
    $file = UploadedFile::fake()->image('pasta.jpg')->store('media', 'public');
    $media = $restaurant->images()->create([
        'user_id' => $this->user->id,
        'filename' => $file,
        'original_name' => 'pasta.jpg',
        'mime_type' => 'image/jpeg',
        'size' => 100,
    ]);

    $response = $this->deleteJson(route('api.v1.media.destroy', $media));

    $response->assertOk();
    expect($media->fresh())->toBeNull();
    Storage::disk('public')->assertMissing($file);
});

test('users cannot delete another user\'s media', function () {
    Storage::fake('public');
    $restaurant = Restaurant::factory()->create(['user_id' => $this->user->id]);
    $media = $restaurant->images()->create([
        'user_id' => User::factory()->create()->id,
        'filename' => 'media/some.jpg',
        'original_name' => 'some.jpg',
        'mime_type' => 'image/jpeg',
        'size' => 100,
    ]);

    $response = $this->deleteJson(route('api.v1.media.destroy', $media));

    $response->assertForbidden();
});

test('cuisine index returns names and supports search', function () {
    Cuisine::create(['name' => 'Italian', 'slug' => 'italian']);
    Cuisine::create(['name' => 'Indian', 'slug' => 'indian']);
    Cuisine::create(['name' => 'Mexican', 'slug' => 'mexican']);

    $response = $this->getJson(route('api.v1.cuisines.index', ['q' => 'ital']));

    $response->assertOk()->assertJsonPath('data.0', 'Italian');
    expect($response->json('data'))->toHaveCount(1);
});

test('location index returns names with display names and supports search', function () {
    Location::create(['name' => 'Portland', 'display_name' => 'Portland, OR']);
    Location::create(['name' => 'Seattle', 'display_name' => 'Seattle, WA']);

    $response = $this->getJson(route('api.v1.locations.index', ['q' => 'port']));

    $response->assertOk()
        ->assertJsonPath('data.0', ['name' => 'Portland', 'display_name' => 'Portland, OR']);
});
