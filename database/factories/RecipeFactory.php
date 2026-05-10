<?php

namespace Database\Factories;

use App\Models\Recipe;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Recipe>
 */
class RecipeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'emoji' => fake()->randomElement(['🍕', '🍛', '🥑', '🍜', '🥗', '🍰', '🥘', '🍲']),
            'name' => fake()->words(3, true),
            'category' => fake()->randomElement(['Italian', 'Indian', 'American', 'Japanese', 'Mexican', 'French', 'Korean']),
            'difficulty' => fake()->randomElement(['Easy', 'Medium', 'Hard']),
            'description' => fake()->paragraph(2),
            'prep_time' => fake()->numberBetween(5, 60),
            'cook_time' => fake()->numberBetween(10, 120),
            'rest_time' => fake()->numberBetween(0, 1440),
            'servings' => fake()->numberBetween(2, 8),
            'tags' => fake()->randomElements(['Vegetarian', 'Quick', 'Comfort Food', 'Healthy', 'Meal Prep', 'Breakfast', 'Dinner'], 2),
        ];
    }
}
