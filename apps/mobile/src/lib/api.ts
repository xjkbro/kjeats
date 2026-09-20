import { loginResponseSchema, type LoginPayload, userSchema } from '@savorylogs/shared';
import { z } from 'zod';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

class ApiError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

async function request<T>(path: string, init: RequestInit = {}, schema?: z.ZodType<T>): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...init.headers,
        },
    });

    if (! response.ok) {
        throw new ApiError(`Request failed with status ${response.status}`, response.status);
    }

    const json: unknown = await response.json();

    return schema ? schema.parse(json) : (json as T);
}

export async function login(payload: LoginPayload) {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    }, loginResponseSchema);
}

export async function me(token: string) {
    return request('/user', {
        headers: { Authorization: `Bearer ${token}` },
    }, z.object({ user: userSchema }));
}

export { ApiError };
