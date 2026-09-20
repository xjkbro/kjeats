<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read bool $is_converted
 */
class WantToTryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'group_id' => $this->group_id,
            'emoji' => $this->emoji,
            'name' => $this->name,
            'cuisine' => $this->cuisine,
            'location' => $this->location,
            'notes' => $this->notes,
            'restaurant_id' => $this->restaurant_id,
            'is_converted' => $this->is_converted,
        ];
    }
}
