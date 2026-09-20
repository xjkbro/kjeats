export function formatRating(rating: number | string | null | undefined): string {
    if (rating === null || rating === undefined || rating === '') {
        return '';
    }

    const parsed = parseFloat(String(rating));

    return Number.isFinite(parsed) && parsed > 0 ? parsed.toFixed(1) : '';
}

export function getInitials(firstName: string, lastName?: string | null): string {
    const first = (firstName || '')[0] || '';
    const last = (lastName || '')[0] || '';

    return (first + last || first || '?').toUpperCase();
}
