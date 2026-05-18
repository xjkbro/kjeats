<?php

use App\Models\User;
use App\Services\RecipeImportService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('extracts recipe from JSON-LD structured data', function () {
    $jsonLd = <<<'JSON'
    {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Recipe",
                "name": "Test Recipe",
                "description": "A delicious test recipe.",
                "prepTime": "PT15M",
                "cookTime": "PT30M",
                "totalTime": "PT45M",
                "recipeYield": ["4", "4 people"],
                "recipeCategory": ["Dinner"],
                "recipeCuisine": ["Italian"],
                "recipeIngredient": [
                    "2 tbsp olive oil",
                    "1 lb pasta",
                    "3 cloves garlic"
                ],
                "recipeInstructions": [
                    {"@type": "HowToStep", "text": "Boil the pasta."},
                    {"@type": "HowToStep", "text": "Saute garlic in oil."},
                    {"@type": "HowToStep", "text": "Combine and serve."}
                ]
            }
        ]
    }
    JSON;

    Http::fake([
        'natashaskitchen.com/*' => Http::response(
            '<html><head><script type="application/ld+json">'.json_encode(json_decode($jsonLd, true)).'</script></head><body><p>Some page content</p></body></html>'
        ),
    ]);

    $service = app(RecipeImportService::class);
    $result = $service->import('https://natashaskitchen.com/test-recipe');

    expect($result)->not->toBeNull();
    expect($result['name'])->toBe('Test Recipe');
    expect($result['description'])->toBe('A delicious test recipe.');
    expect($result['prep_time'])->toBe(15);
    expect($result['cook_time'])->toBe(30);
    expect($result['servings'])->toBe(4);
    expect($result['category'])->toBe('Dinner');
    expect($result['difficulty'])->toBe('Medium');
    expect($result['tags'])->toContain('Italian');

    expect($result['ingredients'])->toHaveCount(3);
    expect($result['ingredients'][0]['amount'])->toBe('2');
    expect($result['ingredients'][0]['unit'])->toBe('tbsp');
    expect($result['ingredients'][0]['name'])->toBe('olive oil');

    expect($result['steps'])->toHaveCount(3);
    expect($result['steps'][0]['instruction'])->toBe('Boil the pasta.');
});

it('returns null on fetch failure', function () {
    Http::fake([
        'example.com/*' => Http::response(null, 500),
    ]);

    $service = app(RecipeImportService::class);
    $result = $service->import('https://example.com/recipe');

    expect($result)->toBeNull();
});

it('handles recipe name as array from JSON-LD', function () {
    $jsonLd = [
        '@context' => 'https://schema.org',
        '@graph' => [
            [
                '@type' => 'Recipe',
                'name' => ['Test Recipe'],
                'prepTime' => 'PT10M',
                'cookTime' => 'PT20M',
                'recipeYield' => '2',
                'recipeCategory' => 'Lunch',
                'recipeIngredient' => ['1 cup flour'],
                'recipeInstructions' => [['@type' => 'HowToStep', 'text' => 'Mix.']],
            ],
        ],
    ];

    Http::fake([
        'example.com/*' => Http::response(
            '<html><script type="application/ld+json">'.json_encode($jsonLd).'</script></html>'
        ),
    ]);

    $service = app(RecipeImportService::class);
    $result = $service->import('https://example.com/recipe');

    expect($result)->not->toBeNull();
    expect($result['name'])->toBe('Test Recipe');
    expect($result['category'])->toBe('Lunch');
});

it('returns null when JSON-LD has no ingredients', function () {
    $jsonLd = [
        '@context' => 'https://schema.org',
        '@type' => 'Recipe',
        'name' => 'Empty Recipe',
        'recipeIngredient' => [],
        'recipeInstructions' => [['@type' => 'HowToStep', 'text' => 'Do nothing.']],
    ];

    Http::fake([
        'example.com/*' => Http::response(
            '<html><script type="application/ld+json">'.json_encode($jsonLd).'</script></html>'
        ),
    ]);

    $service = app(RecipeImportService::class);
    $result = $service->import('https://example.com/empty-recipe');

    expect($result)->toBeNull();
});

it('returns null when JSON-LD has no instructions', function () {
    $jsonLd = [
        '@context' => 'https://schema.org',
        '@type' => 'Recipe',
        'name' => 'No Steps',
        'recipeIngredient' => ['1 cup sugar'],
        'recipeInstructions' => [],
    ];

    Http::fake([
        'example.com/*' => Http::response(
            '<html><script type="application/ld+json">'.json_encode($jsonLd).'</script></html>'
        ),
    ]);

    $service = app(RecipeImportService::class);
    $result = $service->import('https://example.com/no-steps');

    expect($result)->toBeNull();
});
