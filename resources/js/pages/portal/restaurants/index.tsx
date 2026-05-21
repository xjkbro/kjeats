import { Link, router, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import PortalLayout from '@/layouts/portal/portal-layout';
import { index as restaurantsIndexRoute } from '@/routes/restaurants';
import type { Restaurant } from '@/types/portal';

interface Props {
    restaurants: Restaurant[];
    group: { id: number; name: string } | null;
    scope: string;
    all_cuisines: string[];
    current_user_id: number;
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

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(); }}
            className="fl-chk"
            aria-label={checked ? 'Deselect' : 'Select'}
        >
            {checked ? (
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : null}
        </button>
    );
}

const ALL_CUISINES = 'All';

export default function RestaurantsIndex({ restaurants, group, scope, all_cuisines = [], current_user_id }: Props) {
    const { url } = usePage();
    const revisitMode = new URLSearchParams(url.split('?')[1] ?? '').get('revisit') === '1';

    const cuisines = [ALL_CUISINES, ...all_cuisines.filter((c) =>
        restaurants.some((r) => r.cuisine === c)
    )];
    const [filter, setFilter] = useState(ALL_CUISINES);
    const [sort, setSort] = useState<'recent' | 'rating'>('recent');
    const [selectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const filtered = restaurants
        .filter((r) => filter === ALL_CUISINES || r.cuisine === filter)
        .sort((a, b) => {
            if (sort === 'rating') {
                return parseFloat(b.overall_rating) - parseFloat(a.overall_rating);
            }

            return new Date(b.date_visited).getTime() - new Date(a.date_visited).getTime();
        });

    const filteredIds = filtered.map((r) => r.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
    const someSelected = filteredIds.some((id) => selectedIds.has(id));

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(filteredIds));
    }, [filteredIds]);

    const selectMine = useCallback(() => {
        setSelectedIds(new Set(filtered.filter((r) => r.user_id === current_user_id).map((r) => r.id)));
    }, [filtered, current_user_id]);

    const selectGroup = useCallback(() => {
        setSelectedIds(new Set(filtered.filter((r) => r.user_id !== current_user_id).map((r) => r.id)));
    }, [filtered, current_user_id]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    function setScope(newScope: string) {
        if (selectMode) { setSelectMode(false); setSelectedIds(new Set()); }

        router.get(
            restaurantsIndexRoute.url({ query: { scope: newScope } }),
            {},
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }

    function toggleSelectMode() {
        setSelectMode((prev) => {
            if (prev) setSelectedIds(new Set());
            return !prev;
        });
    }

    return (
        <div className="fl-view">
            <div className="fl-view-hdr">
                <h2 className="fl-view-ttl">{revisitMode ? 'Select a Restaurant' : 'Restaurant Reviews'}</h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {!revisitMode && (
                        <button
                            type="button"
                            onClick={toggleSelectMode}
                            className={`fl-btn fl-btn-sm ${selectMode ? 'fl-btn-p' : 'fl-btn-ghost'}`}
                        >
                            {selectMode ? 'Done' : 'Select'}
                        </button>
                    )}
                    {!revisitMode && !selectMode && (
                        <Link href={RestaurantController.create().url} className="fl-btn fl-btn-p fl-btn-sm">
                            + Add
                        </Link>
                    )}
                </div>
            </div>

            {revisitMode && (
                <div style={{ padding: '10px 14px', background: 'var(--fl-p-dim)', border: '1.5px solid var(--fl-p)', borderRadius: 'var(--fl-r3)', marginBottom: '12px', fontSize: '13px', color: 'var(--fl-p)' }}>
                    🔁 Tap a restaurant to log a new visit, add dishes or update your rating.
                </div>
            )}

            {group && !revisitMode && !selectMode && (
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

            {selectMode && (
                <div className="fl-sel-bar">
                    <div className="fl-sel-btns">
                        <button type="button" onClick={selectAll} className="fl-sel-btn">All</button>
                        <button type="button" onClick={selectMine} className="fl-sel-btn">Mine</button>
                        {group && (
                            <button type="button" onClick={selectGroup} className="fl-sel-btn">{group.name}</button>
                        )}
                        {selectedIds.size > 0 && (
                            <button type="button" onClick={clearSelection} className="fl-sel-btn fl-sel-btn-clear">Clear</button>
                        )}
                    </div>
                    <span className="fl-sel-count">
                        {selectedIds.size} selected
                    </span>
                    {allSelected ? (
                        <button type="button" onClick={clearSelection} className="fl-chk fl-chk-checked" aria-label="Deselect all">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </button>
                    ) : someSelected ? (
                        <button type="button" onClick={selectAll} className="fl-chk fl-chk-partial" aria-label="Select all">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    ) : (
                        <button type="button" onClick={selectAll} className="fl-chk" aria-label="Select all" />
                    )}
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
                        selectMode ? (
                            <div key={r.id} className={`fl-card${selectedIds.has(r.id) ? ' fl-card-sel' : ''}`}>
                                <Checkbox checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)} />
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
                            </div>
                        ) : (
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
                        )
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
