<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->user = User::factory()->create();
    $this->actingAs($this->user);

    $this->restaurant = $this->user->restaurants()->create([
        'name' => 'The Test Bistro',
        'cuisine' => 'French',
        'location' => 'Paris',
        'date_visited' => '2024-01-10',
        'visit_dates' => ['2024-01-10'],
        'overall_rating' => 3,
        'price_range' => '$$$',
        'atmosphere_rating' => 3,
        'service_rating' => 3,
        'value_rating' => 3,
        'review' => 'First visit was okay.',
        'emoji' => '🍽️',
    ]);
});

it('logs a revisit with a new date', function () {
    $this->post("/app/restaurants/{$this->restaurant->id}/revisit", [
        'visit_date' => '2024-06-15',
    ])->assertRedirect();

    $this->restaurant->refresh();
    expect($this->restaurant->visit_dates)->toContain('2024-06-15');
    expect($this->restaurant->date_visited->toDateString())->toBe('2024-06-15');
});

it('appends the new date without removing old dates', function () {
    $this->post("/app/restaurants/{$this->restaurant->id}/revisit", [
        'visit_date' => '2024-03-20',
    ])->assertRedirect();

    $this->restaurant->refresh();
    expect($this->restaurant->visit_dates)->toContain('2024-01-10');
    expect($this->restaurant->visit_dates)->toContain('2024-03-20');
});

it('updates ratings and review on revisit', function () {
    $this->post("/app/restaurants/{$this->restaurant->id}/revisit", [
        'visit_date' => '2024-06-15',
        'overall_rating' => '5',
        'atmosphere_rating' => '5',
        'service_rating' => '4',
        'value_rating' => '4',
        'review' => 'Second visit was amazing!',
    ])->assertRedirect();

    $this->restaurant->refresh();
    expect((float) $this->restaurant->overall_rating)->toBe(5.0);
    expect($this->restaurant->review)->toBe('Second visit was amazing!');
});

it('adds new dishes on revisit', function () {
    expect($this->restaurant->dishes()->count())->toBe(0);

    $this->post("/app/restaurants/{$this->restaurant->id}/revisit", [
        'visit_date' => '2024-06-15',
        'dishes' => [
            ['name' => 'Croque Monsieur', 'rating' => '4', 'notes' => 'Crispy and delicious'],
            ['name' => 'Crème Brûlée', 'rating' => '5', 'notes' => ''],
        ],
    ])->assertRedirect();

    expect($this->restaurant->dishes()->count())->toBe(2);
});

it('captures a revision with a descriptive summary', function () {
    $this->post("/app/restaurants/{$this->restaurant->id}/revisit", [
        'visit_date' => '2024-06-15',
        'overall_rating' => '5',
        'dishes' => [
            ['name' => 'Soupe à l\'oignon', 'rating' => '5', 'notes' => ''],
        ],
    ])->assertRedirect();

    $revision = $this->restaurant->revisions()->latest()->first();
    expect($revision)->not->toBeNull();
    expect($revision->summary)->toContain('Revisited on');
    expect($revision->summary)->toContain('updated rating');
    expect($revision->summary)->toContain('added 1 dish');
});

it('adds a dish photo on revisit', function () {
    $photo = UploadedFile::fake()->image('dish.jpg');

    $this->post("/app/restaurants/{$this->restaurant->id}/revisit", [
        'visit_date' => '2024-06-15',
        'dishes' => [
            ['name' => 'Escargot', 'rating' => '4', 'notes' => '', 'photo' => $photo],
        ],
    ])->assertRedirect();

    $dish = $this->restaurant->dishes()->first();
    expect($dish->images)->toHaveCount(1);
    Storage::disk('public')->assertExists($dish->images->first()->filename);
});

it('does not allow another user to log a revisit', function () {
    $other = User::factory()->create();
    $this->actingAs($other);

    $this->post("/app/restaurants/{$this->restaurant->id}/revisit", [
        'visit_date' => '2024-06-15',
    ])->assertForbidden();
});
