<?php

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('creates a restaurant without photos', function () {
    $this->post('/app/restaurants', [
        'name' => 'The Golden Fork',
        'cuisine' => 'Italian',
        'date_visited' => '2024-01-15',
        'overall_rating' => '4',
        'price_range' => '$$',
    ])->assertRedirect();

    expect(Restaurant::where('name', 'The Golden Fork')->exists())->toBeTrue();
});

it('creates a restaurant with a photo', function () {
    $image = UploadedFile::fake()->image('restaurant.jpg');

    $this->post('/app/restaurants', [
        'name' => 'Bella Italia',
        'cuisine' => 'Italian',
        'date_visited' => '2024-01-15',
        'overall_rating' => '5',
        'price_range' => '$$$',
        'restaurant_photo' => $image,
    ])->assertRedirect();

    $restaurant = Restaurant::where('name', 'Bella Italia')->first();
    expect($restaurant)->not->toBeNull();
    expect($restaurant->images)->toHaveCount(1);

    $media = $restaurant->images->first();
    expect($media->user_id)->toBe($this->user->id);
    expect($media->mime_type)->toBe('image/jpeg');
    Storage::disk('public')->assertExists($media->filename);
});

it('creates a restaurant with dishes and dish photos', function () {
    $dishImage = UploadedFile::fake()->image('pizza.jpg');

    $this->post('/app/restaurants', [
        'name' => 'Pizza Palace',
        'cuisine' => 'Italian',
        'date_visited' => '2024-02-10',
        'overall_rating' => '4',
        'price_range' => '$$',
        'dishes' => [
            ['name' => 'Margherita', 'rating' => '5', 'notes' => 'Perfect', 'photo' => $dishImage],
            ['name' => 'Tiramisu', 'rating' => '4', 'notes' => ''],
        ],
    ])->assertRedirect();

    $restaurant = Restaurant::where('name', 'Pizza Palace')->with('dishes.images')->first();
    expect($restaurant->dishes)->toHaveCount(2);

    $margherita = $restaurant->dishes->firstWhere('name', 'Margherita');
    expect($margherita->images)->toHaveCount(1);
    Storage::disk('public')->assertExists($margherita->images->first()->filename);

    $tiramisu = $restaurant->dishes->firstWhere('name', 'Tiramisu');
    expect($tiramisu->images)->toHaveCount(0);
});

it('rejects invalid file types for restaurant photo', function () {
    $badFile = UploadedFile::fake()->create('script.php', 100, 'application/x-php');

    $this->post('/app/restaurants', [
        'name' => 'Bad Upload',
        'cuisine' => 'Test',
        'date_visited' => '2024-01-15',
        'overall_rating' => '3',
        'price_range' => '$',
        'restaurant_photo' => $badFile,
    ])->assertSessionHasErrors('restaurant_photo');
});
