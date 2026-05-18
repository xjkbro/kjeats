<?php

use App\Models\Group;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\WantToTry;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('want-to-try.index'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the want to try index', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('want-to-try.index'));
    $response->assertOk();
});

test('users can create a want to try item', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('want-to-try.store'), [
        'name' => 'The Golden Fork',
        'cuisine' => 'Italian',
        'location' => 'Downtown',
        'notes' => 'Heard great things about their pasta',
    ]);

    $response->assertRedirect(route('want-to-try.index'));
    expect($user->wantToTries()->count())->toBe(1);
    expect($user->wantToTries()->first()->name)->toBe('The Golden Fork');
});

test('want to try name is required', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('want-to-try.store'), [
        'name' => '',
    ]);

    $response->assertSessionHasErrors('name');
});

test('users can view their want to try detail page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $wantToTry = WantToTry::factory()->create(['user_id' => $user->id]);

    $response = $this->get(route('want-to-try.show', $wantToTry));
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portal/want-to-try/show')
            ->where('item.id', $wantToTry->id)
        );
});

test('users cannot view another users want to try without shared group', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $this->actingAs($user);

    $wantToTry = WantToTry::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->get(route('want-to-try.show', $wantToTry));
    $response->assertForbidden();
});

test('users can delete their own want to try', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $wantToTry = WantToTry::factory()->create(['user_id' => $user->id]);

    $response = $this->delete(route('want-to-try.destroy', $wantToTry));
    $response->assertRedirect(route('want-to-try.index'));
    expect(WantToTry::find($wantToTry->id))->toBeNull();
});

test('users cannot delete another users want to try', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $this->actingAs($user);

    $wantToTry = WantToTry::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->delete(route('want-to-try.destroy', $wantToTry));
    $response->assertForbidden();
});

test('group members can see each others want to try items', function () {
    $user = User::factory()->create();
    $member = User::factory()->create();
    $group = Group::create(['name' => 'Test Group']);
    $group->members()->attach($user->id, ['role' => 'owner']);
    $group->members()->attach($member->id, ['role' => 'member']);

    WantToTry::factory()->create(['user_id' => $member->id, 'group_id' => $group->id]);

    config(['app.frontend_group_id' => $group->id]);

    $response = $this->actingAs($user)
        ->get(route('want-to-try.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('items', 1)
        );
});

test('want to try items appear in dashboard feed for group members', function () {
    $user = User::factory()->create();
    $member = User::factory()->create();
    $group = Group::create(['name' => 'Test Group']);
    $group->members()->attach($user->id, ['role' => 'owner']);
    $group->members()->attach($member->id, ['role' => 'member']);

    WantToTry::factory()->create([
        'user_id' => $member->id,
        'group_id' => $group->id,
        'name' => 'Test Restaurant',
        'cuisine' => 'Italian',
    ]);

    config(['app.frontend_group_id' => $group->id]);

    $response = $this->actingAs($user)
        ->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('feed')
        );
});

test('converted want to try items do not appear in list', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $restaurant = Restaurant::factory()->create(['user_id' => $user->id]);
    $wantToTry = WantToTry::factory()->create([
        'user_id' => $user->id,
        'restaurant_id' => $restaurant->id,
    ]);

    $response = $this->get(route('want-to-try.index'));
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('items', 0)
        );
});

test('want to try index page renders correctly', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    WantToTry::factory()->create(['user_id' => $user->id, 'name' => 'My Restaurant']);

    $response = $this->get(route('want-to-try.index'));
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portal/want-to-try/index')
            ->has('items', 1)
        );
});
