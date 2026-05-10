<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\Restaurant;
use App\Models\Revision;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RevisionController extends Controller
{
    public function revert(Request $request, Revision $revision): RedirectResponse
    {
        $model = $revision->revisionable;
        abort_if($model === null, 404);

        // Only the model's owner or a group member may revert
        if ($model instanceof Restaurant || $model instanceof Recipe) {
            $this->authorize('update', $model);
        }

        $snapshot = $revision->snapshot;

        // Extract related data from the snapshot before updating the main model
        $ingredients = $snapshot['ingredients'] ?? null;
        $steps = $snapshot['steps'] ?? null;
        $dishes = $snapshot['dishes'] ?? null;
        unset($snapshot['ingredients'], $snapshot['steps'], $snapshot['dishes'], $snapshot['id'], $snapshot['created_at'], $snapshot['updated_at']);

        // Use setRawAttributes to avoid double-encoding JSON/array-cast columns.
        // The snapshot stores raw DB values (from getAttributes()), so we bypass
        // the cast layer and write them directly back to the model's attributes.
        $model->setRawAttributes(array_merge($model->getAttributes(), $snapshot));
        $model->save();

        if ($model instanceof Restaurant && $dishes !== null) {
            $model->dishes()->delete();

            foreach ($dishes as $dish) {
                unset($dish['id'], $dish['restaurant_id']);
                $model->dishes()->create($dish);
            }
        }

        if ($model instanceof Recipe) {
            if ($ingredients !== null) {
                $model->ingredients()->delete();

                foreach ($ingredients as $ing) {
                    unset($ing['id'], $ing['recipe_id']);
                    $model->ingredients()->create($ing);
                }
            }

            if ($steps !== null) {
                $model->steps()->delete();

                foreach ($steps as $step) {
                    unset($step['id'], $step['recipe_id']);
                    $model->steps()->create($step);
                }
            }
        }

        $routeName = $model instanceof Restaurant ? 'restaurants.show' : 'recipes.show';

        return redirect()->route($routeName, $model)
            ->with('flash.type', 'ok')
            ->with('flash.message', 'Reverted to earlier version.');
    }
}
