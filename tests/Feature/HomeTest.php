<?php

use App\Models\Group;
use App\Models\Recipe;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

test('homepage is publicly accessible', function () {
    $this->get(route('home'))->assertOk();
});

test('homepage renders welcome component without group config', function () {
    config(['app.frontend_group_id' => 0]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('feed', null)
            ->where('group', null)
        );
});

test('homepage shows group activity feed when FRONTEND_GROUP_ID is set', function () {
    $user = User::factory()->create();
    $group = Group::create(['name' => 'Test Group']);
    $group->members()->attach($user->id, ['role' => 'owner']);

    Restaurant::factory()->create(['user_id' => $user->id, 'group_id' => $group->id]);
    Recipe::factory()->create(['user_id' => $user->id, 'group_id' => $group->id]);

    config(['app.frontend_group_id' => $group->id]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('feed', 2)
            ->where('group.name', 'Test Group')
        );
});

test('feed items are sorted newest first', function () {
    $user = User::factory()->create();
    $group = Group::create(['name' => 'Sort Group']);
    $group->members()->attach($user->id, ['role' => 'owner']);

    $older = Restaurant::factory()->create(['user_id' => $user->id, 'group_id' => $group->id]);
    DB::table('restaurants')->where('id', $older->id)->update(['created_at' => now()->subDays(5)]);

    $newer = Recipe::factory()->create(['user_id' => $user->id, 'group_id' => $group->id]);
    DB::table('recipes')->where('id', $newer->id)->update(['created_at' => now()->subDay()]);

    config(['app.frontend_group_id' => $group->id]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('feed', 2)
            ->where('feed.0.type', 'recipe')
            ->where('feed.1.type', 'restaurant')
        );
});

test('homepage falls back to no feed when configured group does not exist', function () {
    config(['app.frontend_group_id' => 99999]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('feed', null)
        );
});
