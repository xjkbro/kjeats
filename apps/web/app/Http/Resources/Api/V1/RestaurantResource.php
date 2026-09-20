<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'emoji' => $this->emoji,
            'name' => $this->name,
            'cuisine' => $this->cuisine,
            'location' => $this->location,
            'date_visited' => $this->date_visited,
            'visit_dates' => $this->visit_dates ?? [],
            'overall_rating' => (string) $this->overall_rating,
            'price_range' => $this->price_range,
            'review' => $this->review,
            'tags' => $this->tags ?? [],
            'atmosphere_rating' => (int) $this->atmosphere_rating,
            'service_rating' => (int) $this->service_rating,
            'value_rating' => (int) $this->value_rating,
            'dishes' => DishResource::collection($this->whenLoaded('dishes')),
            'group_id' => $this->group_id,
            'group' => $this->whenLoaded('group', fn () => [
                'id' => $this->group?->id,
                'name' => $this->group?->name,
            ]),
            'images' => MediaResource::collection($this->whenLoaded('images')),
        ];
    }
}
