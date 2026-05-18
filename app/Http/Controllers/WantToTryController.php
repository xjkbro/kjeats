<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\WantToTry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WantToTryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $groupId = (int) config('app.frontend_group_id', 0);

        if ($groupId > 0) {
            $group = Group::find($groupId);

            if ($group && $group->isMember($user)) {
                $memberIds = $group->members()->pluck('users.id');
                $items = WantToTry::whereIn('user_id', $memberIds)
                    ->with('user')
                    ->whereNull('restaurant_id')
                    ->latest()
                    ->get();

                return Inertia::render('portal/want-to-try/index', [
                    'items' => $items,
                    'group' => ['id' => $group->id, 'name' => $group->name],
                ]);
            }
        }

        $items = $user->wantToTries()
            ->with('user')
            ->whereNull('restaurant_id')
            ->latest()
            ->get();

        return Inertia::render('portal/want-to-try/index', [
            'items' => $items,
            'group' => null,
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
