<?php

namespace Database\Seeders;

use App\Models\Cuisine;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CuisineSeeder extends Seeder
{
    public function run(): void
    {
        $cuisines = [
            // Western / European
            'American',
            'Italian',
            'French',
            'Spanish',
            'Greek',
            'German',
            'British',
            'Irish',
            'Portuguese',
            'Swiss',
            'Scandinavian',
            'Eastern European',

            // Asian
            'Japanese',
            'Chinese',
            'Korean',
            'Thai',
            'Vietnamese',
            'Indian',
            'Filipino',
            'Indonesian',
            'Malaysian',
            'Singaporean',
            'Mongolian',
            'Tibetan',
            'Nepalese',
            'Sri Lankan',

            // Middle Eastern / North African
            'Middle Eastern',
            'Lebanese',
            'Turkish',
            'Persian',
            'Moroccan',
            'Egyptian',
            'Israeli',
            'Iraqi',
            'Syrian',

            // Latin American
            'Mexican',
            'Brazilian',
            'Peruvian',
            'Colombian',
            'Argentinian',
            'Cuban',
            'Venezuelan',
            'Salvadoran',
            'Guatemalan',

            // African
            'Ethiopian',
            'Nigerian',
            'South African',
            'Senegalese',
            'Ghanaian',
            'Kenyan',

            // Regional US
            'Southern',
            'Cajun/Creole',
            'Tex-Mex',
            'Caribbean',
            'Hawaiian',
            'Pacific Northwest',
            'New England',

            // Category-based
            'BBQ',
            'Steakhouse',
            'Seafood',
            'Pizza',
            'Burgers',
            'Sandwiches',
            'Sushi',
            'Ramen',
            'Dim Sum',
            'Tapas',
            'Pho',
            'Noodles',
            'Dumplings',
            'Curry',

            // Dietary / Style
            'Vegan',
            'Vegetarian',
            'Halal',
            'Kosher',
            'Fusion',
            'Contemporary',
            'Farm-to-Table',

            // Desserts / Casual
            'Bakery',
            'Cafe',
            'Coffee',
            'Ice Cream',
            'Donuts',
            'Street Food',
            'Food Truck',
        ];

        foreach ($cuisines as $name) {
            Cuisine::firstOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name)]
            );
        }
    }
}
