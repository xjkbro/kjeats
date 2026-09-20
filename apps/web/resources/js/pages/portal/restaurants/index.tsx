import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import PortalLayout from '@/layouts/portal/portal-layout';
import PortalPageHeader from '@/components/portal-page-header';
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
        <div className="inline-flex items-center gap-[2px]">
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
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <PortalPageHeader
                title={revisitMode ? 'Select a Restaurant' : 'Restaurant Reviews'}
                addHref={revisitMode ? undefined : RestaurantController.create().url}
                groups={revisitMode ? [] : groups}
                scope={scope}
                onScopeChange={setScope}
            />

            {revisitMode && (
                <div style={{ padding: '10px 14px', background: 'var(--fl-p-dim)', border: '1.5px solid var(--fl-p)', borderRadius: 'var(--fl-r3)', marginBottom: '12px', fontSize: '13px', color: 'var(--fl-p)' }}>
                    🔁 Tap a restaurant to log a new visit, add dishes or update your rating.
                </div>
            )}

            <div className="flex gap-2 mb-[14px]">
                <select className="flex-1 bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-full px-[13px] py-[7px] pr-[30px] text-sm font-semibold text-[var(--fl-tx2)] cursor-pointer whitespace-nowrap transition-colors duration-100 focus:outline-none focus:border-[var(--fl-p)]" value={filter} onChange={(e) => setFilter(e.target.value)}>
                    {cuisines.map((c) => (
                        <option key={c} value={c}>{c === ALL_CUISINES ? 'All Cuisines' : c}</option>
                    ))}
                </select>
                <select className="flex-1 bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-full px-[13px] py-[7px] pr-[30px] text-sm font-semibold text-[var(--fl-tx2)] cursor-pointer whitespace-nowrap transition-colors duration-100 focus:outline-none focus:border-[var(--fl-p)]" value={sort} onChange={(e) => setSort(e.target.value as 'recent' | 'rating')}>
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
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-[var(--fl-p-dim)] text-[var(--fl-p-lt)]">{r.cuisine}</span>
                                </div>
                                <div className="fl-card-sub">
                                    {r.location} · {r.price_range} · {r.dishes.length} dish{r.dishes.length !== 1 ? 'es' : ''}
                                </div>
                                {(r.tags ?? []).length > 0 && (
                                    <div className="flex gap-[5px] flex-wrap mt-[6px]">
                                        {(r.tags ?? []).slice(0, 3).map((tag) => (
                                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-[var(--fl-s3)] text-[var(--fl-tx2)]">{tag}</span>
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
                <div className="flex flex-col items-center px-4 py-12 text-center">
                    <span>🍽️</span>
                    <p>{filter !== ALL_CUISINES ? `No ${filter} restaurants` : 'No restaurants yet'}</p>
                    {filter === ALL_CUISINES && (
                        <Link href={RestaurantController.create().url} className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]">
                            Add your first review
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}

RestaurantsIndex.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
