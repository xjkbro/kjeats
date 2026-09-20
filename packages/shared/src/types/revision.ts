export interface Revision {
    id: number;
    user: { name: string };
    summary: string;
    created_at: string;
    snapshot: Record<string, unknown>;
}
