<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Restaurant;
use App\Models\WantToTry;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedLocations();
        $this->backfillRestaurantFks();
        $this->backfillWantToTryFks();
    }

    private function seedLocations(): void
    {
        $restaurantLocations = Restaurant::whereNotNull('location')
            ->where('location', '!=', '')
            ->pluck('location')
            ->unique();

        $wantToTryLocations = WantToTry::whereNotNull('location')
            ->where('location', '!=', '')
            ->pluck('location')
            ->unique();

        $all = $restaurantLocations->merge($wantToTryLocations)->unique();

        foreach ($all as $loc) {
            Location::findOrCreate($loc);
        }
    }

    private function backfillRestaurantFks(): void
    {
        Restaurant::whereNull('location_id')->whereNotNull('location')->each(function (Restaurant $restaurant) {
            $location = Location::where('name', Location::normalize($restaurant->location))->first();

            if ($location) {
                $restaurant->update(['location_id' => $location->id]);
            }
        });
    }

    private function backfillWantToTryFks(): void
    {
        WantToTry::whereNull('location_id')->whereNotNull('location')->each(function (WantToTry $item) {
            $location = Location::where('name', Location::normalize($item->location))->first();

            if ($location) {
                $item->update(['location_id' => $location->id]);
            }
        });
    }
}
