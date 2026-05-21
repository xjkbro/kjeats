import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import * as WantToTryController from '@/actions/App/Http/Controllers/WantToTryController';
import PortalLayout from '@/layouts/portal/portal-layout';
import { index as wantToTryIndexRoute } from '@/routes/want-to-try';

interface Props {
    items: Array<{
        id: number;
        emoji: string;
        name: string;
        cuisine: string | null;
        location: string | null;
        location_display_name: string | null;
        notes: string | null;
        restaurant_id: number | null;
        created_at: string;
        user: { id: number; name: string };
    }>;
    group: { id: number; name: string } | null;
    scope: string;
    all_locations: Array<{ name: string; display_name: string }>;
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

const ALL = 'All';
const SORT_NEWEST = 'Newest';
const SORT_OLDEST = 'Oldest';
const SORT_AZ = 'A → Z';

export default function WantToTryIndex({ items, group, scope, all_locations = [] }: Props) {
    const [locationFilter, setLocationFilter] = useState('');
    const [cuisineFilter, setCuisineFilter] = useState(ALL);
    const [sort, setSort] = useState<string>(SORT_NEWEST);

    const cuisines = [ALL, ...Array.from(new Set(items.map((i) => i.cuisine).filter(Boolean) as string[]))];
    const locations = [{ name: '', display_name: ALL }, ...all_locations];

    const filtered = items
        .filter((item) => locationFilter === '' || item.location === locationFilter)
        .filter((item) => cuisineFilter === ALL || item.cuisine === cuisineFilter)
        .sort((a, b) => {
            if (sort === SORT_NEWEST) {
return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

            if (sort === SORT_OLDEST) {
return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

            if (sort === SORT_AZ) {
return a.name.localeCompare(b.name);
}

            return 0;
        });

    function setScope(newScope: string) {
        router.get(
            wantToTryIndexRoute.url({ query: { scope: newScope } }),
            {},
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }

    return (
        <div className="fl-view">
            <div className="fl-view-hdr">
                <h1 className="fl-view-ttl">Want to Try</h1>
                <Link href={WantToTryController.create().url} className="fl-btn fl-btn-p fl-btn-sm">
                    + Add
                </Link>
            </div>

            {group && (
                <div className="fl-scope-toggle">
                    <button
                        className={`fl-scope-btn${scope === 'group' ? ' active' : ''}`}
                        onClick={() => setScope('group')}
                    >
                        {group.name}
                    </button>
                    <button
                        className={`fl-scope-btn${scope === 'mine' ? ' active' : ''}`}
                        onClick={() => setScope('mine')}
                    >
                        Mine
                    </button>
                </div>
            )}

            <div className="fl-filters">
                <select className="fl-filter-sel" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                    {locations.map((loc) => (
                        <option key={loc.name} value={loc.name}>{loc.display_name}</option>
                    ))}
                </select>
                {cuisines.length > 1 && (
                    <select className="fl-filter-sel" value={cuisineFilter} onChange={(e) => setCuisineFilter(e.target.value)}>
                        {cuisines.map((c) => (
                            <option key={c} value={c}>{c === ALL ? 'All Cuisines' : c}</option>
                        ))}
                    </select>
                )}
                <select className="fl-filter-sel" value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value={SORT_NEWEST}>Newest</option>
                    <option value={SORT_OLDEST}>Oldest</option>
                    <option value={SORT_AZ}>A → Z</option>
                </select>
            </div>

            {filtered.length > 0 ? (
                <div className="fl-wtt-list">
                    {filtered.map((item) => (
                        <Link key={item.id} href={WantToTryController.show(item.id).url} className="fl-wtt-card">
                            <div className="fl-wtt-ico">{item.emoji}</div>
                            <div className="fl-wtt-body">
                                <div className="fl-wtt-name">{item.name}</div>
                                <div className="fl-wtt-meta">
                                    {item.cuisine && <span className="fl-badge fl-badge-org">{item.cuisine}</span>}
                                    {item.location && <span className="fl-badge fl-badge-def">{item.location_display_name ?? item.location}</span>}
                                    {group && scope === 'group' && (
                                        <span className="fl-wtt-by">{item.user.name} · {timeAgo(item.created_at)}</span>
                                    )}
                                    {(!group || scope === 'mine') && (
                                        <span className="fl-wtt-by">{timeAgo(item.created_at)}</span>
                                    )}
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
