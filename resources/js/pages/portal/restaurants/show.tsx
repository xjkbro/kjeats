import { Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import * as RevisionController from '@/actions/App/Http/Controllers/RevisionController';
import PortalLayout from '@/layouts/portal/portal-layout';
import type { Restaurant, Revision } from '@/types/portal';

interface Props {
    restaurant: Restaurant;
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

function RatingBar({ label, value }: { label: string; value: number }) {
    const pct = (value / 5) * 100;

    return (
        <div className="fl-rbar">
            <div className="fl-rbar-top">
                <span className="fl-rbar-lbl">{label}</span>
                <span className="fl-rbar-val">{value.toFixed(1)}</span>
            </div>
            <div className="fl-rbar-track">
                <div className="fl-rbar-fill" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export default function RestaurantShow({ restaurant }: Props) {
    const dateLabel = new Date(restaurant.date_visited + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    function handleDelete() {
        if (!confirm(`Delete ${restaurant.name}? This cannot be undone.`)) {
            return;
        }

        router.delete(RestaurantController.show(restaurant.id).url);
    }

    return (
        <div className="fl-view">
            <div className="fl-hero">
                <div className="fl-hero-emoji">{restaurant.emoji}</div>
                <h1 className="fl-hero-name">{restaurant.name}</h1>
                <div className="fl-hero-meta">
                    <span className="fl-badge fl-badge-org">{restaurant.cuisine}</span>
                    <span className="fl-badge fl-badge-def">{restaurant.price_range}</span>
                    {restaurant.tags.map((t) => (
                        <span key={t} className="fl-badge fl-badge-def">
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            <div className="fl-info-grid">
                <div className="fl-info-item">
                    <div className="fl-info-ico">📍</div>
                    <div className="fl-info-body">
                        <div className="fl-info-lbl">Location</div>
                        <div className="fl-info-val">{restaurant.location}</div>
                    </div>
                </div>
                <div className="fl-info-item">
                    <div className="fl-info-ico">📅</div>
                    <div className="fl-info-body">
                        <div className="fl-info-lbl">Visited</div>
                        <div className="fl-info-val">{dateLabel}</div>
                    </div>
                </div>
                <div className="fl-info-item">
                    <div className="fl-info-ico">⭐</div>
                    <div className="fl-info-body">
                        <div className="fl-info-lbl">Overall Rating</div>
                        <div className="fl-info-val">
                            <StarDisplay rating={restaurant.overall_rating} />
                        </div>
                    </div>
                </div>
            </div>

            <section className="fl-section">
                <h3 className="fl-section-ttl">Experience</h3>
                <div className="fl-rbars">
                    <RatingBar label="Atmosphere" value={restaurant.atmosphere_rating} />
                    <RatingBar label="Service" value={restaurant.service_rating} />
                    <RatingBar label="Value" value={restaurant.value_rating} />
                </div>
            </section>

            {restaurant.review && (
                <div className="fl-quote">
                    <div className="fl-quote-mark">"</div>
                    <p>{restaurant.review}</p>
                </div>
            )}

            {restaurant.dishes.length > 0 && (
                <section className="fl-section">
                    <h3 className="fl-section-ttl">
                        Dishes ({restaurant.dishes.length})
                    </h3>
                    <div className="fl-dish-list">
                        {restaurant.dishes.map((dish) => (
                            <div key={dish.id} className="fl-dish-card">
                                <div className="fl-dish-top">
                                    <span className="fl-dish-name">{dish.name}</span>
                                    <span className="fl-dish-rating">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span key={i} className={i < Math.round(parseFloat(dish.rating)) ? 'filled' : ''}>
                                                ★
                                            </span>
                                        ))}
                                    </span>
                                </div>
                                {dish.notes && <p className="fl-dish-notes">{dish.notes}</p>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="fl-actions">
                <Link href={RestaurantController.edit(restaurant.id).url} className="fl-btn fl-btn-sec">
                    Edit Review
                </Link>
                <button className="fl-btn fl-btn-danger" onClick={handleDelete}>
                    Delete
                </button>
            </div>

            {restaurant.revisions && restaurant.revisions.length > 0 && (
                <section className="fl-section">
                    <h3 className="fl-section-ttl">History ({restaurant.revisions.length})</h3>
                    <div className="fl-revision-list">
                        {restaurant.revisions.map((revision: Revision) => (
                            <div key={revision.id} className="fl-revision-row">
                                <div className="fl-revision-meta">
                                    <span className="fl-revision-user">{revision.user.name}</span>
                                    <span className="fl-revision-time">
                                        {new Date(revision.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                {revision.summary && <div className="fl-revision-summary">{revision.summary}</div>}
                                <button
                                    className="fl-btn fl-btn-ghost fl-btn-sm"
                                    onClick={() => {
                                        if (confirm('Revert to this version?')) {
                                            router.post(RevisionController.revert(revision.id).url);
                                        }
                                    }}
                                >
                                    Revert
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

RestaurantShow.layout = (page: ReactNode) => <PortalLayout showBack title="Restaurant">{page}</PortalLayout>;
