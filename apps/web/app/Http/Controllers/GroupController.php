<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(Request $request): Response
    {
        $groups = $request->user()->groups()->withCount(['groupMembers', 'restaurants', 'recipes'])->get();

        return Inertia::render('portal/groups/index', [
            'groups' => $groups,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('portal/groups/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $maxMembers = config('collaboration.max_group_members');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $group = Group::create($validated);
        $group->groupMembers()->create([
            'user_id' => $request->user()->id,
            'role' => 'owner',
        ]);

        return redirect()->route('groups.show', $group)
            ->with('flash.type', 'ok')
            ->with('flash.message', 'Group created! Share your invite code: '.$group->invite_code);
    }

    public function show(Group $group): Response
    {
        $user = request()->user();
        abort_unless($group->isMember($user), 403);

        $group->load([
            'groupMembers.user',
            'restaurants' => fn ($q) => $q->with('dishes')->orderByDesc('date_visited'),
            'recipes' => fn ($q) => $q->with(['ingredients', 'steps'])->orderByDesc('created_at'),
        ]);

        return Inertia::render('portal/groups/show', [
            'group' => $group,
            'isOwner' => $group->isOwner($user),
            'maxMembers' => config('collaboration.max_group_members'),
        ]);
    }

    public function join(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'invite_code' => 'required|string|max:10',
        ]);

        $group = Group::where('invite_code', strtoupper($validated['invite_code']))->firstOrFail();
        $user = $request->user();

        if ($group->isMember($user)) {
            return redirect()->route('groups.show', $group)
                ->with('flash.type', 'inf')
                ->with('flash.message', 'You are already a member of this group.');
        }

        $maxMembers = config('collaboration.max_group_members');

        abort_if($group->memberCount() >= $maxMembers, 422, "This group has reached the maximum of {$maxMembers} members.");

        $group->groupMembers()->create([
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        return redirect()->route('groups.show', $group)
            ->with('flash.type', 'ok')
            ->with('flash.message', 'You joined '.$group->name.'!');
    }

    public function leave(Request $request, Group $group): RedirectResponse
    {
        $user = $request->user();
        abort_unless($group->isMember($user), 403);
        abort_if($group->isOwner($user) && $group->memberCount() > 1, 422, 'Transfer ownership before leaving.');

        $group->groupMembers()->where('user_id', $user->id)->delete();

        if ($group->memberCount() === 0) {
            $group->delete();

            return redirect()->route('groups.index')
                ->with('flash.type', 'inf')
                ->with('flash.message', 'Group deleted (no members remaining).');
        }

        return redirect()->route('groups.index')
            ->with('flash.type', 'inf')
            ->with('flash.message', 'You left '.$group->name.'.');
    }

    public function removeMember(Request $request, Group $group, int $userId): RedirectResponse
    {
        abort_unless($group->isOwner($request->user()), 403);
        abort_if($userId === $request->user()->id, 422, 'Cannot remove yourself.');

        $group->groupMembers()->where('user_id', $userId)->delete();

        return redirect()->route('groups.show', $group)
            ->with('flash.type', 'ok')
            ->with('flash.message', 'Member removed.');
    }
}
