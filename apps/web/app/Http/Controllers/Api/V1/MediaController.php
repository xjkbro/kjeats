<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\MediaResource;
use App\Models\Media;
use App\Models\Recipe;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function storeRestaurant(Request $request, Restaurant $restaurant): JsonResponse
    {
        $this->authorize('view', $restaurant);

        $media = $this->storeMedia($request, $restaurant, 'images');

        return response()->json(['data' => new MediaResource($media)], 201);
    }

    public function storeRecipe(Request $request, Recipe $recipe): JsonResponse
    {
        $this->authorize('view', $recipe);

        $media = $this->storeMedia($request, $recipe, 'images');

        return response()->json(['data' => new MediaResource($media)], 201);
    }

    public function destroy(Request $request, Media $media): JsonResponse
    {
        abort_unless($media->user_id === $request->user()->id, 403);

        Storage::disk('public')->delete($media->filename);
        $media->delete();

        return response()->json(['message' => 'Photo removed.']);
    }

    private function storeMedia(Request $request, Restaurant|Recipe $model, string $relation): Media
    {
        $request->validate([
            'image' => 'required|image|max:20480',
        ]);

        $file = $request->file('image');
        $path = $file->store('media', 'public');

        return $model->{$relation}()->create([
            'user_id' => $request->user()->id,
            'filename' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);
    }
}
