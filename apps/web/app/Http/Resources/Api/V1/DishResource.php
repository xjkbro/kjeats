<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DishResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'rating' => (string) $this->rating,
            'notes' => $this->notes,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => trim($this->user->first_name.' '.$this->user->last_name),
                ];
            }),
            'images' => MediaResource::collection($this->whenLoaded('images')),
        ];
    }
}
