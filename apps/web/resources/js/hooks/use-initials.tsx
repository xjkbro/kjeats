import { getInitials } from '@savorylogs/shared';
import { useCallback } from 'react';

export type GetInitialsFn = (firstName: string, lastName?: string | null) => string;

export function useInitials(): GetInitialsFn {
    return useCallback((firstName: string, lastName?: string | null): string => {
        return getInitials(firstName, lastName);
    }, []);
}
