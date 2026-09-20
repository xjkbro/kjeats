<?php

namespace Database\Seeders;

use App\Models\Dish;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\RecipeNutrition;
use App\Models\RecipeStep;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Alex Johnson',
            'email' => 'test@example.com',
        ]);

        // ── Restaurants ─────────────────────────────────────────
        $goldenFork = Restaurant::create([
            'user_id' => $user->id,
            'emoji' => '🍝',
            'name' => 'The Golden Fork',
            'cuisine' => 'Italian',
            'location' => '123 Broadway, Manhattan, NY',
            'date_visited' => '2026-04-28',
            'overall_rating' => 4.5,
            'price_range' => '$$',
            'review' => 'Absolutely phenomenal experience. The pasta was cooked to perfection, and the wine selection was impeccable. Will definitely return for their truffle risotto.',
            'tags' => ['Fine Dining', 'Date Night'],
            'atmosphere_rating' => 5,
            'service_rating' => 4,
            'value_rating' => 4,
        ]);

        Dish::insert([
            ['restaurant_id' => $goldenFork->id, 'name' => 'Truffle Risotto', 'rating' => 5.0, 'notes' => "Buttery, rich, perfectly seasoned. Best I've had in NYC.", 'created_at' => now(), 'updated_at' => now()],
            ['restaurant_id' => $goldenFork->id, 'name' => 'Margherita Pizza', 'rating' => 4.5, 'notes' => 'Wood-fired with fresh mozzarella. Great char on the crust.', 'created_at' => now(), 'updated_at' => now()],
            ['restaurant_id' => $goldenFork->id, 'name' => 'Tiramisu', 'rating' => 5.0, 'notes' => 'House-made. Perfect balance of coffee and mascarpone.', 'created_at' => now(), 'updated_at' => now()],
        ]);

        $sakura = Restaurant::create([
            'user_id' => $user->id,
            'emoji' => '🍱',
            'name' => 'Sakura Garden',
            'cuisine' => 'Japanese',
            'location' => '88 Flatbush Ave, Brooklyn, NY',
            'date_visited' => '2026-05-01',
            'overall_rating' => 4.2,
            'price_range' => '$$$',
            'review' => "Exceptional omakase experience. The chef's attention to detail is remarkable. Fresh fish, beautiful presentation, and genuinely warm service.",
            'tags' => ['Omakase', 'Special Occasion'],
            'atmosphere_rating' => 4,
            'service_rating' => 5,
            'value_rating' => 4,
        ]);

        Dish::insert([
            ['restaurant_id' => $sakura->id, 'name' => 'Toro Sashimi', 'rating' => 5.0, 'notes' => 'Melt-in-your-mouth fatty tuna. Incredible quality.', 'created_at' => now(), 'updated_at' => now()],
            ['restaurant_id' => $sakura->id, 'name' => 'Wagyu Nigiri', 'rating' => 4.5, 'notes' => 'Torched tableside. Rich and indulgent.', 'created_at' => now(), 'updated_at' => now()],
            ['restaurant_id' => $sakura->id, 'name' => 'Miso Soup', 'rating' => 3.5, 'notes' => 'Good but nothing extraordinary.', 'created_at' => now(), 'updated_at' => now()],
        ]);

        $cantina = Restaurant::create([
            'user_id' => $user->id,
            'emoji' => '🌮',
            'name' => 'La Cantina Mexicana',
            'cuisine' => 'Mexican',
            'location' => '45 Jackson Ave, Queens, NY',
            'date_visited' => '2026-05-06',
            'overall_rating' => 3.8,
            'price_range' => '$',
            'review' => 'Authentic street food vibes with incredible value. The tacos al pastor are life-changing. Service can be slow on weekends but the food more than makes up for it.',
            'tags' => ['Casual', 'Budget Friendly', 'Authentic'],
            'atmosphere_rating' => 3,
            'service_rating' => 4,
            'value_rating' => 5,
        ]);

        Dish::insert([
            ['restaurant_id' => $cantina->id, 'name' => 'Tacos Al Pastor', 'rating' => 5.0, 'notes' => 'Perfectly marinated pork with pineapple. Absolutely authentic.', 'created_at' => now(), 'updated_at' => now()],
            ['restaurant_id' => $cantina->id, 'name' => 'Guacamole', 'rating' => 4.0, 'notes' => 'Fresh, chunky, well-seasoned. Made tableside.', 'created_at' => now(), 'updated_at' => now()],
            ['restaurant_id' => $cantina->id, 'name' => 'Churros', 'rating' => 3.5, 'notes' => 'Good but a bit greasy. Great cinnamon sugar ratio.', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── Recipes ──────────────────────────────────────────────
        $pizza = Recipe::create([
            'user_id' => $user->id,
            'emoji' => '🍕',
            'name' => 'Homemade Margherita Pizza',
            'category' => 'Italian',
            'difficulty' => 'Medium',
            'description' => 'A classic Neapolitan-style pizza with simple, high-quality ingredients. The key is the long dough fermentation and a scorching hot oven.',
            'prep_time' => 20,
            'cook_time' => 15,
            'rest_time' => 1440,
            'servings' => 4,
            'tags' => ['Italian', 'Vegetarian', 'Comfort Food'],
        ]);

        RecipeIngredient::insert([
            ['recipe_id' => $pizza->id, 'amount' => '500', 'unit' => 'g', 'name' => '00 Flour (or bread flour)', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $pizza->id, 'amount' => '325', 'unit' => 'ml', 'name' => 'Warm water', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $pizza->id, 'amount' => '7', 'unit' => 'g', 'name' => 'Active dry yeast', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $pizza->id, 'amount' => '10', 'unit' => 'g', 'name' => 'Sea salt', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $pizza->id, 'amount' => '1', 'unit' => 'tbsp', 'name' => 'Olive oil', 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $pizza->id, 'amount' => '200', 'unit' => 'ml', 'name' => 'San Marzano tomato sauce', 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $pizza->id, 'amount' => '250', 'unit' => 'g', 'name' => 'Fresh mozzarella (torn)', 'sort_order' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $pizza->id, 'amount' => '10', 'unit' => 'leaves', 'name' => 'Fresh basil', 'sort_order' => 8, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $pizzaSteps = [
            'Dissolve yeast in warm water and let sit for 10 minutes until foamy.',
            'Mix flour and salt in a large bowl. Make a well and add the yeast mixture and olive oil.',
            'Knead for 8–10 minutes until smooth and elastic.',
            'Divide into 2 balls, cover, and refrigerate for 24–72 hours.',
            'Remove dough 2 hours before baking. Preheat oven to maximum (500°F+) with a pizza stone inside.',
            'Stretch dough by hand on a floured surface into a thin 12-inch round.',
            'Spread tomato sauce thinly leaving a 1-inch border. Add torn mozzarella.',
            'Bake for 8–12 minutes until crust is deeply charred and cheese is bubbling.',
            'Top with fresh basil immediately. Slice and serve hot.',
        ];

        foreach ($pizzaSteps as $i => $step) {
            RecipeStep::create(['recipe_id' => $pizza->id, 'step_number' => $i + 1, 'instruction' => $step]);
        }

        RecipeNutrition::create([
            'recipe_id' => $pizza->id,
            'serving_size' => '2 slices (≈ 200g)',
            'calories' => 480,
            'total_fat' => 16, 'total_fat_dv' => 21,
            'saturated_fat' => 7, 'saturated_fat_dv' => 35,
            'trans_fat' => 0,
            'cholesterol' => 35, 'cholesterol_dv' => 12,
            'sodium' => 780, 'sodium_dv' => 34,
            'total_carbs' => 66, 'total_carbs_dv' => 24,
            'fiber' => 3, 'fiber_dv' => 11,
            'total_sugars' => 4,
            'added_sugars' => 1, 'added_sugars_dv' => 2,
            'protein' => 21,
            'vitamin_d' => 0, 'vitamin_d_dv' => 0,
            'calcium' => 320, 'calcium_dv' => 25,
            'iron' => 4.5, 'iron_dv' => 25,
            'potassium' => 380, 'potassium_dv' => 8,
        ]);

        $tikka = Recipe::create([
            'user_id' => $user->id,
            'emoji' => '🍛',
            'name' => 'Chicken Tikka Masala',
            'category' => 'Indian',
            'difficulty' => 'Medium',
            'description' => 'The ultimate comfort curry — tender charred chicken in a rich, aromatic tomato-cream sauce. Great for batch cooking and tastes even better the next day.',
            'prep_time' => 30,
            'cook_time' => 45,
            'rest_time' => 120,
            'servings' => 6,
            'tags' => ['Indian', 'Chicken', 'Curry', 'Meal Prep'],
        ]);

        RecipeIngredient::insert([
            ['recipe_id' => $tikka->id, 'amount' => '900', 'unit' => 'g', 'name' => 'Chicken breast, cubed', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $tikka->id, 'amount' => '200', 'unit' => 'ml', 'name' => 'Full-fat yogurt', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $tikka->id, 'amount' => '2', 'unit' => 'tbsp', 'name' => 'Lemon juice', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $tikka->id, 'amount' => '2', 'unit' => 'tsp', 'name' => 'Garam masala', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $tikka->id, 'amount' => '1', 'unit' => 'tsp', 'name' => 'Kashmiri chili powder', 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $tikka->id, 'amount' => '400', 'unit' => 'ml', 'name' => 'Heavy cream', 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $tikka->id, 'amount' => '800', 'unit' => 'g', 'name' => 'Crushed tomatoes', 'sort_order' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $tikka->id, 'amount' => '1', 'unit' => 'large', 'name' => 'Yellow onion, minced', 'sort_order' => 8, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $tikkaSteps = [
            'Marinate chicken in yogurt, lemon juice, and half the spices for at least 2 hours (overnight is best).',
            'Grill or broil chicken on high until charred spots appear, about 8 minutes.',
            'Sauté onion in butter until deeply golden, about 12 minutes.',
            'Add garlic paste, ginger paste, and remaining spices. Cook 2 minutes until fragrant.',
            'Add crushed tomatoes and simmer 20 minutes until thickened.',
            'Blend sauce until smooth (optional). Return to pan.',
            'Add chicken and cream. Simmer 10–15 minutes until sauce coats the chicken.',
            'Finish with fresh cilantro and a pat of butter. Serve with basmati rice or naan.',
        ];

        foreach ($tikkaSteps as $i => $step) {
            RecipeStep::create(['recipe_id' => $tikka->id, 'step_number' => $i + 1, 'instruction' => $step]);
        }

        RecipeNutrition::create([
            'recipe_id' => $tikka->id,
            'serving_size' => '1 serving (≈ 280g)',
            'calories' => 385,
            'total_fat' => 20, 'total_fat_dv' => 26,
            'saturated_fat' => 11, 'saturated_fat_dv' => 55,
            'trans_fat' => 0,
            'cholesterol' => 120, 'cholesterol_dv' => 40,
            'sodium' => 620, 'sodium_dv' => 27,
            'total_carbs' => 14, 'total_carbs_dv' => 5,
            'fiber' => 2, 'fiber_dv' => 7,
            'total_sugars' => 8,
            'added_sugars' => 0, 'added_sugars_dv' => 0,
            'protein' => 38,
            'vitamin_d' => 1, 'vitamin_d_dv' => 6,
            'calcium' => 120, 'calcium_dv' => 9,
            'iron' => 3.2, 'iron_dv' => 18,
            'potassium' => 620, 'potassium_dv' => 13,
        ]);

        $avocado = Recipe::create([
            'user_id' => $user->id,
            'emoji' => '🥑',
            'name' => 'Avocado Toast Supreme',
            'category' => 'American',
            'difficulty' => 'Easy',
            'description' => 'Elevated avocado toast with everything bagel seasoning, a soft poached egg, and chili flakes. Ready in 15 minutes and endlessly satisfying.',
            'prep_time' => 10,
            'cook_time' => 5,
            'rest_time' => 0,
            'servings' => 2,
            'tags' => ['Breakfast', 'Vegetarian', 'Quick', 'Healthy'],
        ]);

        RecipeIngredient::insert([
            ['recipe_id' => $avocado->id, 'amount' => '2', 'unit' => 'slices', 'name' => 'Sourdough bread, thick-cut', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $avocado->id, 'amount' => '2', 'unit' => 'large', 'name' => 'Ripe avocados', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $avocado->id, 'amount' => '2', 'unit' => 'large', 'name' => 'Eggs (poached)', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $avocado->id, 'amount' => '1', 'unit' => 'tbsp', 'name' => 'Lemon juice', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $avocado->id, 'amount' => '1', 'unit' => 'tsp', 'name' => 'Everything bagel seasoning', 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $avocado->id, 'amount' => '¼', 'unit' => 'tsp', 'name' => 'Red chili flakes', 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['recipe_id' => $avocado->id, 'amount' => '1', 'unit' => 'pinch', 'name' => 'Flaky sea salt', 'sort_order' => 7, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $avocadoSteps = [
            'Toast sourdough slices until deep golden and properly crispy.',
            'Halve avocados, remove pits, and scoop flesh into a bowl.',
            'Mash with lemon juice, salt, and pepper. Leave it slightly chunky.',
            'Poach eggs in simmering water with a splash of white vinegar for 3 minutes.',
            'Spread mashed avocado generously on each toast slice.',
            'Top each slice with a poached egg.',
            'Finish with everything bagel seasoning, chili flakes, and flaky salt.',
            'Serve immediately while the egg is still warm.',
        ];

        foreach ($avocadoSteps as $i => $step) {
            RecipeStep::create(['recipe_id' => $avocado->id, 'step_number' => $i + 1, 'instruction' => $step]);
        }

        RecipeNutrition::create([
            'recipe_id' => $avocado->id,
            'serving_size' => '1 open-face toast (≈ 220g)',
            'calories' => 410,
            'total_fat' => 28, 'total_fat_dv' => 36,
            'saturated_fat' => 5, 'saturated_fat_dv' => 25,
            'trans_fat' => 0,
            'cholesterol' => 185, 'cholesterol_dv' => 62,
            'sodium' => 480, 'sodium_dv' => 21,
            'total_carbs' => 32, 'total_carbs_dv' => 12,
            'fiber' => 11, 'fiber_dv' => 39,
            'total_sugars' => 2,
            'added_sugars' => 0, 'added_sugars_dv' => 0,
            'protein' => 14,
            'vitamin_d' => 1.5, 'vitamin_d_dv' => 8,
            'calcium' => 80, 'calcium_dv' => 6,
            'iron' => 3, 'iron_dv' => 17,
            'potassium' => 810, 'potassium_dv' => 17,
        ]);
    }
}
