import { useCallback } from 'react';

export type GetInitialsFn = (firstName: string, lastName?: string | null) => string;

export function useInitials(): GetInitialsFn {
    return useCallback((firstName: string, lastName?: string | null): string => {
        const first = (firstName || '')[0] || '';
        const last = (lastName || '')[0] || '';

        return (first + last || first || '?').toUpperCase();
    }, []);
}
