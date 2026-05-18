import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as WantToTryController from '@/actions/App/Http/Controllers/WantToTryController';
import PortalLayout from '@/layouts/portal/portal-layout';

interface Props {
    item: {
        id: number;
        emoji: string;
        name: string;
        cuisine: string | null;
        location: string | null;
        notes: string | null;
        restaurant_id: number | null;
        created_at: string;
        user: { id: number; name: string };
    };
}

function formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function WantToTryShow({ item }: Props) {
    return (
        <div className="fl-view">
            <div className="fl-wtt-hero">
                <div className="fl-wtt-hero-emoji">{item.emoji}</div>
                <h1 className="fl-wtt-hero-name">{item.name}</h1>
                <div className="fl-wtt-hero-meta">
                    {item.cuisine && <span className="fl-badge fl-badge-org">{item.cuisine}</span>}
                    {item.location && <span className="fl-badge fl-badge-def">{item.location}</span>}
                </div>
                <p className="fl-wtt-by">
                    Added by {item.user.name} · {formatDate(item.created_at)}
                </p>
            </div>

            {item.notes && (
                <section className="fl-section">
                    <h3 className="fl-section-ttl">Notes</h3>
                    <div className="fl-wtt-notes">
                        {item.notes}
                    </div>
                </section>
            )}

            <section className="fl-section">
                <h3 className="fl-section-ttl">Actions</h3>
                <div className="fl-wtt-actions">
                    <Link
                        href={WantToTryController.convertToReview(item.id).url}
                        method="post"
                        as="button"
                        className="fl-btn fl-btn-p"
                    >
                        Convert to Review
                    </Link>
                    <Link
                        href={WantToTryController.destroy(item.id).url}
                        method="delete"
                        as="button"
                        className="fl-btn fl-btn-sec"
                    >
                        Remove
                    </Link>
                </div>
            </section>
        </div>
    );
}

WantToTryShow.layout = (page: ReactNode) => <PortalLayout showBack title="Want to Try">{page}</PortalLayout>;
