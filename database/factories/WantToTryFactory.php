<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\WantToTry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WantToTry>
 */
class WantToTryFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'emoji' => fake()->randomElement(['🍽️', '🍕', '🍣', '🌮', '🍜', '🥩', '🍔']),
            'name' => fake()->company(),
            'cuisine' => fake()->randomElement(['Italian', 'Japanese', 'Mexican', 'American', 'Indian', 'French']),
            'location' => fake()->city(),
            'notes' => fake()->sentence(),
            'restaurant_id' => null,
        ];
    }
}
