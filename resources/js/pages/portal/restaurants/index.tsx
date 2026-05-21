import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import PortalLayout from '@/layouts/portal/portal-layout';
import { index as restaurantsIndexRoute } from '@/routes/restaurants';
import type { Restaurant } from '@/types/portal';

interface Props {
    restaurants: Restaurant[];
    groups: { id: number; name: string }[];
    scope: string;
    all_cuisines: string[];
}

function StarDisplay({ rating }: { rating: number | string }) {
    const r = parseFloat(String(rating));

    return (
        <div className="fl-stars">
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= Math.round(r) ? 'filled' : ''}>
                    ★
                </span>
            ))}
        </div>
    );
}

const ALL_CUISINES = 'All';

export default function RestaurantsIndex({ restaurants, groups, scope, all_cuisines = [] }: Props) {
    const { url } = usePage();
    const revisitMode = new URLSearchParams(url.split('?')[1] ?? '').get('revisit') === '1';

    const cuisines = [ALL_CUISINES, ...all_cuisines.filter((c) =>
        restaurants.some((r) => r.cuisine === c)
    )];
    const [filter, setFilter] = useState(ALL_CUISINES);
    const [sort, setSort] = useState<'recent' | 'rating'>('recent');

    const filtered = restaurants
        .filter((r) => filter === ALL_CUISINES || r.cuisine === filter)
        .sort((a, b) => {
            if (sort === 'rating') {
                return parseFloat(b.overall_rating) - parseFloat(a.overall_rating);
            }

            return new Date(b.date_visited).getTime() - new Date(a.date_visited).getTime();
        });

    function setScope(newScope: string) {
        router.get(
            restaurantsIndexRoute.url({ query: { scope: newScope } }),
            {},
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }

    return (
        <div className="fl-view">
            <div className="fl-view-hdr">
                <h2 className="fl-view-ttl">{revisitMode ? 'Select a Restaurant' : 'Restaurant Reviews'}</h2>
                {!revisitMode && (
                    <Link href={RestaurantController.create().url} className="fl-btn fl-btn-p fl-btn-sm">
                        + Add
                    </Link>
                )}
            </div>

            {revisitMode && (
                <div style={{ padding: '10px 14px', background: 'var(--fl-p-dim)', border: '1.5px solid var(--fl-p)', borderRadius: 'var(--fl-r3)', marginBottom: '12px', fontSize: '13px', color: 'var(--fl-p)' }}>
                    🔁 Tap a restaurant to log a new visit, add dishes or update your rating.
                </div>
            )}

            {groups.length > 0 && !revisitMode && (
                <div className="fl-scope-toggle">
                    <button
                        className={`fl-scope-btn${scope === 'mine' ? ' active' : ''}`}
                        onClick={() => setScope('mine')}
                    >
                        Mine
                    </button>
                    {groups.map((g) => (
                        <button
                            key={g.id}
                            className={`fl-scope-btn${scope === String(g.id) ? ' active' : ''}`}
                            onClick={() => setScope(String(g.id))}
                        >
                            {g.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="fl-filters">
                <select className="fl-filter-sel" value={filter} onChange={(e) => setFilter(e.target.value)}>
                    {cuisines.map((c) => (
                        <option key={c} value={c}>{c === ALL_CUISINES ? 'All Cuisines' : c}</option>
                    ))}
                </select>
                <select className="fl-filter-sel" value={sort} onChange={(e) => setSort(e.target.value as 'recent' | 'rating')}>
                    <option value="recent">Most Recent</option>
                    <option value="rating">Top Rated</option>
                </select>
            </div>

            {filtered.length > 0 ? (
                <div className="fl-card-list">
                    {filtered.map((r) => (
                        <Link key={r.id} href={RestaurantController.show(r.id).url} className="fl-card">
                            <div className="fl-card-emoji">{r.emoji}</div>
                            <div className="fl-card-body">
                                <div className="fl-card-name">{r.name}</div>
                                <div className="fl-card-meta">
                                    <StarDisplay rating={r.overall_rating} />
                                    <span className="fl-badge fl-badge-org">{r.cuisine}</span>
                                </div>
                                <div className="fl-card-sub">
                                    {r.location} · {r.price_range} · {r.dishes.length} dish{r.dishes.length !== 1 ? 'es' : ''}
                                </div>
                                {(r.tags ?? []).length > 0 && (
                                    <div className="fl-card-tags">
                                        {(r.tags ?? []).slice(0, 3).map((tag) => (
                                            <span key={tag} className="fl-badge fl-badge-def">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <svg className="fl-card-chev" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="fl-empty">
                    <span>🍽️</span>
                    <p>{filter !== ALL_CUISINES ? `No ${filter} restaurants` : 'No restaurants yet'}</p>
                    {filter === ALL_CUISINES && (
                        <Link href={RestaurantController.create().url} className="fl-btn fl-btn-p">
                            Add your first review
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}

RestaurantsIndex.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
