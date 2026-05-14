<?php

use App\Models\Group;
use App\Models\Recipe;
use App\Models\Restaurant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard renders personal feed without group config', function () {
    config(['app.frontend_group_id' => 0]);

    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portal/home')
            ->where('group', null)
            ->where('feed', null)
        );
});

test('dashboard shows group feed when user is a group member', function () {
    $user = User::factory()->create();
    $group = Group::create(['name' => 'Test Group']);
    $group->members()->attach($user->id, ['role' => 'owner']);

    Restaurant::factory()->create(['user_id' => $user->id]);
    Recipe::factory()->create(['user_id' => $user->id]);

    config(['app.frontend_group_id' => $group->id]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portal/home')
            ->where('group.name', 'Test Group')
            ->has('feed', 2)
        );
});

test('dashboard shows personal feed when user is not in the configured group', function () {
    $user = User::factory()->create();
    $group = Group::create(['name' => 'Other Group']);

    config(['app.frontend_group_id' => $group->id]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portal/home')
            ->where('group', null)
            ->where('feed', null)
        );
});
