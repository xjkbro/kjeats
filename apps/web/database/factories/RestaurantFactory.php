<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Restaurant>
 */
class RestaurantFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'emoji' => fake()->randomElement(['🍝', '🍱', '🌮', '🍕', '🍣', '🥗', '🍜', '🥩']),
            'name' => fake()->company(),
            'cuisine' => fake()->randomElement(['Italian', 'Japanese', 'Mexican', 'American', 'Indian', 'French', 'Chinese', 'Thai']),
            'location' => fake()->address(),
            'date_visited' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'overall_rating' => fake()->randomFloat(1, 2.5, 5.0),
            'price_range' => fake()->randomElement(['$', '$$', '$$$', '$$$$']),
            'review' => fake()->paragraph(3),
            'tags' => fake()->randomElements(['Fine Dining', 'Casual', 'Date Night', 'Authentic', 'Budget Friendly', 'Family Friendly', 'Special Occasion'], 2),
            'atmosphere_rating' => fake()->numberBetween(1, 5),
            'service_rating' => fake()->numberBetween(1, 5),
            'value_rating' => fake()->numberBetween(1, 5),
        ];
    }
}
