import { Link, useForm, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as DishController from '@/actions/App/Http/Controllers/DishController';
import * as MediaController from '@/actions/App/Http/Controllers/MediaController';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import * as RevisionController from '@/actions/App/Http/Controllers/RevisionController';
import PortalLayout from '@/layouts/portal/portal-layout';
import type { MediaItem, Restaurant, Revision } from '@/types/portal';

type DiffEntry = { label: string; before: string; after: string };

function parseRaw(v: unknown): unknown {
    if (typeof v === 'string') {
        try {
            return JSON.parse(v);
        } catch {
            return v;
        }
    }

    return v;
}

const COUNT_KEYS = new Set(['dishes', 'ingredients', 'steps']);

function cmpVal(key: string, raw: unknown): string {
    const v = parseRaw(raw);

    if (COUNT_KEYS.has(key)) {
        return String(Array.isArray(v) ? v.length : Number(v));
    }

    if (Array.isArray(v)) {
        return JSON.stringify(v);
    }

    return String(v ?? '');
}

function fmtVal(key: string, raw: unknown): string {
    const v = parseRaw(raw);

    if (v === null || v === undefined || v === '') {
        return '—';
    }

    if (COUNT_KEYS.has(key)) {
        const n = Array.isArray(v) ? v.length : Number(v);

        return `${n}`;
    }

    if (Array.isArray(v)) {
        return v.length === 0 ? '(none)' : v.map(String).join(', ');
    }

    const s = String(v);

    return s.length > 80 ? s.slice(0, 80) + '…' : s;
}

function diffSnapshots(
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    fields: { key: string; label: string }[],
): DiffEntry[] {
    return fields.flatMap(({ key, label }) => {
        if (cmpVal(key, before[key]) === cmpVal(key, after[key])) {
            return [];
        }

        return [{ label, before: fmtVal(key, before[key]), after: fmtVal(key, after[key]) }];
    });
}

const RESTAURANT_FIELDS = [
    { key: 'name', label: 'Name' },
    { key: 'emoji', label: 'Emoji' },
    { key: 'cuisine', label: 'Cuisine' },
    { key: 'location', label: 'Location' },
    { key: 'date_visited', label: 'Date visited' },
    { key: 'overall_rating', label: 'Rating' },
    { key: 'price_range', label: 'Price range' },
    { key: 'atmosphere_rating', label: 'Atmosphere' },
    { key: 'service_rating', label: 'Service' },
    { key: 'value_rating', label: 'Value' },
    { key: 'review', label: 'Review' },
    { key: 'tags', label: 'Tags' },
    { key: 'dishes', label: 'Dishes' },
];

interface Props {
    restaurant: Restaurant;
    can_add_dish: boolean;
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

function ImageGallery({ images }: { images: MediaItem[] }) {
    if (images.length === 0) {
        return null;
    }

    return (
        <div className="fl-img-gallery">
            {images.map((img) => (
                <a key={img.id} href={img.url} target="_blank" rel="noreferrer" className="fl-img-thumb">
                    <img src={img.url} alt={img.original_name} />
                </a>
            ))}
        </div>
    );
}

function ImageUploadForm({ action }: { action: string }) {
    const form = useForm<{ image: File | null }>({ image: null });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(action, { forceFormData: true, preserveScroll: true, onSuccess: () => form.reset() });
    }

    return (
        <form onSubmit={submit} className="fl-img-upload">
            <input
                type="file"
                accept="image/*"
                className="fl-img-file-input"
                onChange={(e) => form.setData('image', e.target.files?.[0] ?? null)}
            />
            <button type="submit" className="fl-btn fl-btn-ghost fl-btn-sm" disabled={!form.data.image || form.processing}>
                {form.processing ? 'Uploading…' : '+ Photo'}
            </button>
        </form>
    );
}

export default function RestaurantShow({ restaurant, can_add_dish, current_user_id }: Props) {
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

    const dishForm = useForm({ name: '', rating: '5', notes: '' });

    function addDish(e: React.FormEvent) {
        e.preventDefault();
        dishForm.post(DishController.store(restaurant.id).url, {
            preserveScroll: true,
            onSuccess: () => dishForm.reset(),
        });
    }

    function deleteDish(dishId: number) {
        if (!confirm('Remove this dish?')) {
            return;
        }

        router.delete(DishController.destroy({ restaurant: restaurant.id, dish: dishId }).url, { preserveScroll: true });
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
                        <div className="fl-info-val">
                            {restaurant.visit_dates && restaurant.visit_dates.length > 1
                                ? restaurant.visit_dates.map((d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })).join(' · ')
                                : dateLabel
                            }
                        </div>
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

            {(restaurant.images.length > 0 || can_add_dish) && (
                <section className="fl-section">
                    <h3 className="fl-section-ttl">Photos</h3>
                    {can_add_dish && <ImageUploadForm action={MediaController.storeRestaurant(restaurant.id).url} />}
                    <ImageGallery images={restaurant.images} />
                </section>
            )}

            {(restaurant.dishes.length > 0 || can_add_dish) && (
                <section className="fl-section">
                    <h3 className="fl-section-ttl">
                        Dishes ({restaurant.dishes.length})
                    </h3>
                    {restaurant.dishes.length > 0 && (
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
                                        {dish.user && dish.user.id === current_user_id && (
                                            <button
                                                className="fl-btn fl-btn-ghost fl-btn-sm"
                                                style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 8px' }}
                                                onClick={() => deleteDish(dish.id)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    {dish.user && dish.user.id !== current_user_id && (
                                        <p className="fl-dish-by">by {dish.user.name}</p>
                                    )}
                                    {dish.notes && <p className="fl-dish-notes">{dish.notes}</p>}
                                    <ImageGallery images={dish.images} />
                                    {can_add_dish && (
                                        <ImageUploadForm action={MediaController.storeDish(dish.id).url} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {can_add_dish && (
                        <form onSubmit={addDish} className="fl-dish-add-form">
                            <div className="fl-dish-add-fields">
                                <input
                                    className="fl-input"
                                    type="text"
                                    placeholder="Dish name"
                                    value={dishForm.data.name}
                                    onChange={(e) => dishForm.setData('name', e.target.value)}
                                    required
                                />
                                <select
                                    className="fl-input"
                                    value={dishForm.data.rating}
                                    onChange={(e) => dishForm.setData('rating', e.target.value)}
                                >
                                    {['1', '2', '3', '4', '5'].map((v) => (
                                        <option key={v} value={v}>{v} ★</option>
                                    ))}
                                </select>
                                <input
                                    className="fl-input"
                                    type="text"
                                    placeholder="Notes (optional)"
                                    value={dishForm.data.notes}
                                    onChange={(e) => dishForm.setData('notes', e.target.value)}
                                />
                            </div>
                            <button type="submit" className="fl-btn fl-btn-p fl-btn-sm" disabled={dishForm.processing}>
                                + Add dish
                            </button>
                        </form>
                    )}
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
                        {restaurant.revisions.map((revision: Revision, i: number) => {
                            const afterSnap: Record<string, unknown> = i === 0
                                ? { name: restaurant.name, emoji: restaurant.emoji, cuisine: restaurant.cuisine, location: restaurant.location, date_visited: restaurant.date_visited, overall_rating: restaurant.overall_rating, price_range: restaurant.price_range, atmosphere_rating: restaurant.atmosphere_rating, service_rating: restaurant.service_rating, value_rating: restaurant.value_rating, review: restaurant.review, tags: restaurant.tags, dishes: restaurant.dishes }
                                : (restaurant.revisions![i - 1].snapshot as Record<string, unknown>);
                            const changes = diffSnapshots(revision.snapshot as Record<string, unknown>, afterSnap, RESTAURANT_FIELDS);

                            return (
                                <div key={revision.id} className="fl-revision-row">
                                    <div className="fl-revision-meta">
                                        <span className="fl-revision-user">{revision.user.name}</span>
                                        <span className="fl-revision-time">
                                            {new Date(revision.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    {changes.length > 0 ? (
                                        <div className="fl-revision-changes">
                                            {changes.map((c) => (
                                                <div key={c.label} className="fl-revision-change">
                                                    <span className="fl-revision-field">{c.label}</span>
                                                    <span className="fl-revision-old">{c.before}</span>
                                                    <span className="fl-revision-arrow">&rarr;</span>
                                                    <span className="fl-revision-new">{c.after}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="fl-revision-summary">{revision.summary}</div>
                                    )}
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
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}

RestaurantShow.layout = (page: ReactNode) => <PortalLayout showBack title="Restaurant">{page}</PortalLayout>;
