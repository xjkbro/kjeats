<?php

namespace App\Http\Controllers;

use App\Models\Dish;
use App\Models\Media;
use App\Models\Recipe;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function storeRestaurant(Request $request, Restaurant $restaurant): RedirectResponse
    {
        $this->authorize('view', $restaurant);

        $request->validate([
            'image' => 'required|image|max:20480',
        ]);

        $file = $request->file('image');
        $path = $file->store('media', 'public');

        $restaurant->images()->create([
            'user_id' => $request->user()->id,
            'filename' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return back()->with('flash.type', 'ok')->with('flash.message', 'Photo added!');
    }

    public function storeDish(Request $request, Dish $dish): RedirectResponse
    {
        $this->authorize('view', $dish->restaurant);

        $request->validate([
            'image' => 'required|image|max:20480',
        ]);

        $file = $request->file('image');
        $path = $file->store('media', 'public');

        $dish->images()->create([
            'user_id' => $request->user()->id,
            'filename' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return back()->with('flash.type', 'ok')->with('flash.message', 'Photo added!');
    }

    public function storeRecipe(Request $request, Recipe $recipe): RedirectResponse
    {
        $this->authorize('view', $recipe);

        $request->validate([
            'image' => 'required|image|max:20480',
        ]);

        $file = $request->file('image');
        $path = $file->store('media', 'public');

        $recipe->images()->create([
            'user_id' => $request->user()->id,
            'filename' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return back()->with('flash.type', 'ok')->with('flash.message', 'Photo added!');
    }

    public function destroy(Request $request, Media $media): RedirectResponse
    {
        abort_unless($media->user_id === $request->user()->id, 403);

        Storage::disk('public')->delete($media->filename);
        $media->delete();

        return back()->with('flash.type', 'ok')->with('flash.message', 'Photo removed.');
    }
}
