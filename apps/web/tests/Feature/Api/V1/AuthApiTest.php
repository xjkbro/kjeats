<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('users can log in with email and password and receive a token', function () {
    $user = User::factory()->create(['password' => 'secret-password']);

    $response = $this->postJson(route('api.v1.auth.login'), [
        'email' => $user->email,
        'password' => 'secret-password',
        'device_name' => 'test-device',
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'token',
            'user' => ['id', 'first_name', 'last_name', 'email', 'avatar_url'],
        ]);

    expect($user->tokens()->count())->toBe(1);
    expect($user->tokens()->first()->name)->toBe('test-device');
});

test('login fails with invalid credentials', function () {
    $user = User::factory()->create();

    $response = $this->postJson(route('api.v1.auth.login'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(422)->assertJsonValidationErrors('email');
    expect($user->tokens()->count())->toBe(0);
});

test('login requires an email and password', function () {
    $response = $this->postJson(route('api.v1.auth.login'), []);

    $response->assertStatus(422)->assertJsonValidationErrors(['email', 'password']);
});

test('authenticated users can fetch themselves', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->getJson(route('api.v1.user'));

    $response->assertOk()
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('user.email', $user->email);
});

test('the user endpoint requires authentication', function () {
    $response = $this->getJson(route('api.v1.user'));

    $response->assertUnauthorized();
});

test('logout revokes the current token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-device');

    $response = $this->withToken($token->plainTextToken)->postJson(route('api.v1.auth.logout'));

    $response->assertOk();
    expect($user->tokens()->count())->toBe(0);
});
