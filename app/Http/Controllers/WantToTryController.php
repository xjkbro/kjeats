<?php

namespace App\Http\Controllers;

use App\Models\Cuisine;
use App\Models\Group;
use App\Models\Location;
use App\Models\WantToTry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class WantToTryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $groupId = (int) config('app.frontend_group_id', 0);
        $group = null;

        if ($groupId > 0) {
            $foundGroup = Group::find($groupId);

            if ($foundGroup && $foundGroup->isMember($user)) {
                $group = ['id' => $foundGroup->id, 'name' => $foundGroup->name];
            }
        }

        $query = $user->wantToTries()->with('user')->whereNull('restaurant_id');

        if ($group && $request->query('scope') === 'group') {
            $memberIds = Group::find($groupId)->members()->pluck('users.id');
            $query = WantToTry::whereIn('user_id', $memberIds)->with('user')->whereNull('restaurant_id');
        }

        $items = $query->with(['user', 'locationRelation'])->latest()->get();

        return Inertia::render('portal/want-to-try/index', [
            'items' => $items->map(fn ($item) => [
                'id' => $item->id,
                'emoji' => $item->emoji,
                'name' => $item->name,
                'cuisine' => $item->cuisine,
                'location' => $item->location,
                'location_display_name' => $item->locationRelation?->display_name ?? $item->location,
                'notes' => $item->notes,
                'restaurant_id' => $item->restaurant_id,
                'created_at' => $item->created_at,
                'user' => $item->user,
            ])->values(),
            'group' => $group,
            'scope' => $request->query('scope', 'mine'),
            'all_locations' => Location::orderBy('display_name')->get()->map(fn ($l) => [
                'name' => $l->name,
                'display_name' => $l->display_name,
            ])->values(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('portal/want-to-try/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cuisine' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
        ]);

        // Resolve or create cuisine
        if (! empty($validated['cuisine'])) {
            $cuisine = Cuisine::firstOrCreate(
                ['name' => $validated['cuisine']],
                ['slug' => Str::slug($validated['cuisine'])]
            );
            $validated['cuisine'] = $cuisine->name;
        }

        // Resolve or create location and set FK
        if (! empty($validated['location'])) {
            $location = Location::findOrCreate($validated['location']);
            $validated['location'] = $location->name;
            $validated['location_id'] = $location->id;
        }

        $groupId = (int) config('app.frontend_group_id', 0);
        $group = null;

        if ($groupId > 0) {
            $group = Group::find($groupId);

            if ($group && $group->isMember($request->user())) {
                $validated['group_id'] = $groupId;
            }
        }

        $request->user()->wantToTries()->create([
            ...$validated,
            'emoji' => '🍽️',
        ]);

        return redirect()->route('want-to-try.index')
            ->with('flash.type', 'ok')
            ->with('flash.message', 'Want to Try saved!');
    }

    public function show(WantToTry $wantToTry): Response
    {
        $this->authorize('view', $wantToTry);

        return Inertia::render('portal/want-to-try/show', [
            'item' => $wantToTry->load('user'),
        ]);
    }

    public function destroy(Request $request, WantToTry $wantToTry): RedirectResponse
    {
        $this->authorize('delete', $wantToTry);

        $wantToTry->delete();

        return redirect()->route('want-to-try.index')
            ->with('flash.type', 'ok')
            ->with('flash.message', 'Want to Try removed.');
    }

    public function convertToReview(WantToTry $wantToTry): RedirectResponse
    {
        $this->authorize('view', $wantToTry);

        $wantToTry->restaurant()->updateOrCreate(
            [
                'user_id' => $wantToTry->user_id,
                'name' => $wantToTry->name,
            ],
            [
                'emoji' => $wantToTry->emoji,
                'cuisine' => $wantToTry->cuisine ?? '',
                'location' => $wantToTry->location,
                'date_visited' => now()->format('Y-m-d'),
                'visit_dates' => [now()->format('Y-m-d')],
                'overall_rating' => 0,
                'price_range' => '$$',
            ],
        );

        return redirect()->route('want-to-try.index')
            ->with('flash.type', 'ok')
            ->with('flash.message', 'Want to Try converted!');
    }
}
