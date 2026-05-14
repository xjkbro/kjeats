<?php

namespace Database\Factories;

use App\Models\Dish;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Dish>
 */
class DishFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['Burger', 'Tacos', 'Pizza', 'Salad', 'Pasta', 'Nachos', 'Burrito', 'Quesadilla', 'Sushi', 'Ramen']),
            'rating' => $this->faker->randomElement(['1.0', '2.0', '3.0', '3.5', '4.0', '4.5', '5.0']),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
