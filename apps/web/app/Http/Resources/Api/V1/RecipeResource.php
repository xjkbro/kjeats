<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecipeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'emoji' => $this->emoji,
            'name' => $this->name,
            'category' => $this->category,
            'difficulty' => $this->difficulty,
            'description' => $this->description,
            'prep_time' => $this->prep_time,
            'cook_time' => $this->cook_time,
            'rest_time' => $this->rest_time,
            'servings' => $this->servings,
            'tags' => $this->tags ?? [],
            'ingredients' => $this->whenLoaded('ingredients', fn () => $this->ingredients->map(fn ($ingredient) => [
                'id' => $ingredient->id,
                'amount' => $ingredient->amount,
                'unit' => $ingredient->unit,
                'name' => $ingredient->name,
                'sort_order' => $ingredient->sort_order,
            ])->values()),
            'steps' => $this->whenLoaded('steps', fn () => $this->steps->map(fn ($step) => [
                'id' => $step->id,
                'step_number' => $step->step_number,
                'instruction' => $step->instruction,
            ])->values()),
            'nutrition' => $this->whenLoaded('nutrition', fn () => $this->nutrition),
            'group_id' => $this->group_id,
            'group' => $this->whenLoaded('group', fn () => [
                'id' => $this->group?->id,
                'name' => $this->group?->name,
            ]),
            'images' => MediaResource::collection($this->whenLoaded('images')),
        ];
    }
}
