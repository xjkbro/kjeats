import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as WantToTryController from '@/actions/App/Http/Controllers/WantToTryController';
import PortalLayout from '@/layouts/portal/portal-layout';

interface Props {
    items: Array<{
        id: number;
        emoji: string;
        name: string;
        cuisine: string | null;
        location: string | null;
        notes: string | null;
        restaurant_id: number | null;
        created_at: string;
        user: { id: number; name: string };
    }>;
    group: { id: number; name: string } | null;
}

function timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const days = Math.floor(diff / 86400000);

    if (days >= 30) {
return `${Math.floor(days / 30)}mo ago`;
}

    if (days >= 1) {
return `${days}d ago`;
}

    const hours = Math.floor(diff / 3600000);

    if (hours >= 1) {
return `${hours}h ago`;
}

    return 'just now';
}

export default function WantToTryIndex({ items, group }: Props) {
    return (
        <div className="fl-view">
            <div className="fl-view-hdr">
                <h1 className="fl-view-ttl">Want to Try</h1>
                <Link href={WantToTryController.create().url} className="fl-btn fl-btn-p fl-btn-sm">
                    + Add
                </Link>
            </div>

            {group && (
                <p className="fl-hero-sub" style={{ marginBottom: '16px' }}>
                    {group.name}
                </p>
            )}

            {items.length > 0 ? (
                <div className="fl-wtt-list">
                    {items.map((item) => (
                        <Link key={item.id} href={WantToTryController.show(item.id).url} className="fl-wtt-card">
                            <div className="fl-wtt-ico">{item.emoji}</div>
                            <div className="fl-wtt-body">
                                <div className="fl-wtt-name">{item.name}</div>
                                <div className="fl-wtt-meta">
                                    {item.cuisine && <span className="fl-badge fl-badge-org">{item.cuisine}</span>}
                                    {item.location && <span className="fl-badge fl-badge-def">{item.location}</span>}
                                    <span className="fl-wtt-by">
                                        {item.user.name} · {timeAgo(item.created_at)}
                                    </span>
                                </div>
                            </div>
                            <svg className="fl-wtt-chev" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="fl-empty">
                    <span>🍽️</span>
                    <p className="fl-empty-ttl">No restaurants to try yet</p>
                    <p className="fl-empty-desc">Quickly save restaurants you want to visit later</p>
                    <Link href={WantToTryController.create().url} className="fl-btn fl-btn-p">
                        Add your first one
                    </Link>
                </div>
            )}
        </div>
    );
}

WantToTryIndex.layout = (page: ReactNode) => <PortalLayout title="Want to Try" showBack>{page}</PortalLayout>;
