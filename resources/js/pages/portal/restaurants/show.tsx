import { Link, useForm, router } from '@inertiajs/react';
import React from 'react';
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
        return '\u2014';
    }

    if (COUNT_KEYS.has(key)) {
        const n = Array.isArray(v) ? v.length : Number(v);

        return `${n}`;
    }

    if (Array.isArray(v)) {
        return v.length === 0 ? '(none)' : v.map(String).join(', ');
    }

    const s = String(v);

    return s.length > 80 ? s.slice(0, 80) + '\u2026' : s;
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
        <div className="inline-flex items-center gap-[2px]">
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= Math.round(r) ? 'filled' : ''}>
                    {'\u2605'}
                </span>
            ))}
        </div>
    );
}

function RatingBar({ label, value }: { label: string; value: number }) {
    const pct = (value / 5) * 100;

    return (
        <div className="flex flex-col gap-[5px]">
            <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--fl-tx2)]">{label}</span>
                <span className="text-xs font-bold text-[var(--fl-tx)] w-[18px] text-right shrink-0">{value.toFixed(1)}</span>
            </div>
            <div className="h-[6px] bg-[var(--fl-s3)] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--fl-p)] to-[var(--fl-gold)]" style={{ width: `${pct}%` }} />
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
                <a key={img.id} href={img.url} target="_blank" rel="noreferrer" className="shrink-0 w-[90px] h-[90px] rounded-xl overflow-hidden border border-[var(--fl-bdr-s)] block">
                    <img src={img.url} alt={img.original_name} />
                </a>
            ))}
        </div>
    );
}

function ImageUploadForm({ action }: { action: string }) {
    const form = useForm<{ image: File | null }>({ image: null });
    const inputRef = React.useRef<HTMLInputElement>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;

        if (!file) {
return;
}

        form.setData('image', file);
        form.post(action, { forceFormData: true, preserveScroll: true, onSuccess: () => {
            form.reset();

            if (inputRef.current) {
inputRef.current.value = '';
}
        }});
    }

    return (
        <>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
            <button
                type="button"
                className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s2)] active:scale-[.97] px-[14px] py-2 text-sm font-semibold rounded-xl"
                disabled={form.processing}
                onClick={() => inputRef.current?.click()}
            >
                {form.processing ? 'Uploading\u2026' : '\uD83D\uDCF7 Photo'}
            </button>
        </>
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
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <div className="bg-[var(--fl-s1)] border-b border-[var(--fl-bdr-s)] p-5 px-4 -mx-4 -mt-4 mb-5 lg:rounded-[16px] lg:mx-0 lg:mt-0 lg:mb-5 lg:border">
                <div className="text-5xl block mb-[10px]">{restaurant.emoji}</div>
                <h1 className="text-[22px] font-black text-[var(--fl-tx)] tracking-[-.5px] mb-[6px]">{restaurant.name}</h1>
                <div className="flex items-center gap-[7px] flex-wrap mb-2 text-sm text-[var(--fl-tx2)]">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-[var(--fl-p-dim)] text-[var(--fl-p-lt)]">{restaurant.cuisine}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-[var(--fl-s3)] text-[var(--fl-tx2)]">{restaurant.price_range}</span>
                    {(restaurant.tags ?? []).map((t) => (
                        <span key={t} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-[var(--fl-s3)] text-[var(--fl-tx2)]">
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
                <div className="bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-xl px-[14px] py-3 flex items-start gap-[10px]">
                    <div className="text-xl shrink-0">{'\uD83D\uDCCD'}</div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-[.5px] text-[var(--fl-tx3)] mb-1">Location</div>
                        <div className="text-sm font-bold text-[var(--fl-tx)]">{restaurant.location}</div>
                    </div>
                </div>
                <div className="bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-xl px-[14px] py-3 flex items-start gap-[10px]">
                    <div className="text-xl shrink-0">{'\uD83D\uDCC5'}</div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-[.5px] text-[var(--fl-tx3)] mb-1">Visited</div>
                        <div className="text-sm font-bold text-[var(--fl-tx)]">
                            {restaurant.visit_dates && restaurant.visit_dates.length > 1
                                ? restaurant.visit_dates.map((d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })).join(' \u00B7 ')
                                : dateLabel
                            }
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-xl px-[14px] py-3 flex items-start gap-[10px]">
                    <div className="text-xl shrink-0">{'\u2B50'}</div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-[.5px] text-[var(--fl-tx3)] mb-1">Overall Rating</div>
                        <div className="text-sm font-bold text-[var(--fl-tx)]">
                            <StarDisplay rating={restaurant.overall_rating} />
                        </div>
                    </div>
                </div>
            </div>

            <section className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[15px] font-bold text-[var(--fl-tx)] tracking-[-.2px]">Experience</h3>
                </div>
                <div className="flex flex-col gap-[10px]">
                    <RatingBar label="Atmosphere" value={restaurant.atmosphere_rating} />
                    <RatingBar label="Service" value={restaurant.service_rating} />
                    <RatingBar label="Value" value={restaurant.value_rating} />
                </div>
            </section>

            {restaurant.review && (
                <div className="bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-xl px-4 pt-4 pb-[14px] text-sm text-[var(--fl-tx2)] leading-relaxed relative">
                    <div className="hidden">{'"'}</div>
                    <p>{restaurant.review}</p>
                </div>
            )}

            {(restaurant.images.length > 0 || can_add_dish) && (
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[15px] font-bold text-[var(--fl-tx)] tracking-[-.2px]">Photos</h3>
                        {can_add_dish && <ImageUploadForm action={MediaController.storeRestaurant(restaurant.id).url} />}
                    </div>
                    <ImageGallery images={restaurant.images} />
                </section>
            )}

            {(restaurant.dishes.length > 0 || can_add_dish) && (
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[15px] font-bold text-[var(--fl-tx)] tracking-[-.2px]">
                            Dishes ({restaurant.dishes.length})
                        </h3>
                    </div>
                    {restaurant.dishes.length > 0 && (
                        <div className="flex flex-col">
                            {restaurant.dishes.map((dish) => (
                                <div key={dish.id} className="bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-xl px-[14px] py-3 flex items-start gap-3">
                                    <div className="flex items-center justify-between mb-[5px]">
                                        <span className="text-sm font-bold text-[var(--fl-tx)] mb-[3px] truncate">{dish.name}</span>
                                        <span className="inline-flex items-center gap-[1px]">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <span key={i} className={i < Math.round(parseFloat(dish.rating)) ? 'filled' : ''}>
                                                    {'\u2605'}
                                                </span>
                                            ))}
                                        </span>
                                        {dish.user && dish.user.id === current_user_id && (
                                            <button
                                                className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s2)] active:scale-[.97] px-[14px] py-2 text-sm font-semibold rounded-xl"
                                                style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 8px' }}
                                                onClick={() => deleteDish(dish.id)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    {dish.user && dish.user.id !== current_user_id && (
                                        <p className="text-xs text-[var(--fl-tx3)] m-0">by {dish.user.first_name}</p>
                                    )}
                                    {dish.notes && <p className="text-xs text-[var(--fl-tx2)] leading-relaxed m-0">{dish.notes}</p>}
                                    <ImageGallery images={dish.images} />
                                    {can_add_dish && (
                                        <div style={{ marginTop: '6px' }}>
                                            <ImageUploadForm action={MediaController.storeDish(dish.id).url} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {can_add_dish && (
                        <form onSubmit={addDish} className="mt-3 p-[14px] bg-[var(--fl-s2)] border-[1.5px] border-dashed border-[var(--fl-bdr)] rounded-xl flex flex-col gap-[10px]">
                            <div className="flex flex-col gap-2">
                                <input
                                    className="w-full bg-[var(--fl-bg)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-3 py-[9px] text-sm text-[var(--fl-tx)] outline-none transition-[border-color] duration-150 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_rgba(255,96,64,.12)]"
                                    type="text"
                                    placeholder="Dish name"
                                    value={dishForm.data.name}
                                    onChange={(e) => dishForm.setData('name', e.target.value)}
                                    required
                                />
                                <select
                                    className="w-full bg-[var(--fl-bg)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-3 py-[9px] text-sm text-[var(--fl-tx)] outline-none transition-[border-color] duration-150 placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_rgba(255,96,64,.12)]"
                                    value={dishForm.data.rating}
                                    onChange={(e) => dishForm.setData('rating', e.target.value)}
                                >
                                    {['1', '2', '3', '4', '5'].map((v) => (
                                        <option key={v} value={v}>{v} {'\u2605'}</option>
                                    ))}
                                </select>
                                <input
                                    className="w-full bg-[var(--fl-bg)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-3 py-[9px] text-sm text-[var(--fl-tx)] outline-none transition-[border-color] duration-150 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_rgba(255,96,64,.12)]"
                                    type="text"
                                    placeholder="Notes (optional)"
                                    value={dishForm.data.notes}
                                    onChange={(e) => dishForm.setData('notes', e.target.value)}
                                />
                            </div>
                            <button type="submit" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)] px-[14px] py-2 text-sm font-semibold rounded-xl" disabled={dishForm.processing}>
                                + Add dish
                            </button>
                        </form>
                    )}
                </section>
            )}

            <div className="flex gap-[10px] mt-6 pb-4">
                <Link href={RestaurantController.showRevisit(restaurant.id).url} className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]">
                    {'\uD83D\uDD01'} Log Revisit
                </Link>
                <button type="button" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-[var(--fl-s3)] text-[var(--fl-tx)] border-[var(--fl-bdr)] active:bg-[var(--fl-s4)] active:scale-[.97]" onClick={() => router.visit(RestaurantController.edit(restaurant.id).url, { replace: true })}>
                    Edit Review
                </button>
                <button className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-[var(--fl-red-d)] text-[var(--fl-red)] border-[rgba(255,69,96,.3)] active:bg-[rgba(255,69,96,.25)] active:scale-[.97]" onClick={handleDelete}>
                    Delete
                </button>
            </div>

            {restaurant.revisions && restaurant.revisions.length > 0 && (
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[15px] font-bold text-[var(--fl-tx)] tracking-[-.2px]">History ({restaurant.revisions.length})</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                        {restaurant.revisions.map((revision: Revision, i: number) => {
                            const afterSnap: Record<string, unknown> = i === 0
                                ? { name: restaurant.name, emoji: restaurant.emoji, cuisine: restaurant.cuisine, location: restaurant.location, date_visited: restaurant.date_visited, overall_rating: restaurant.overall_rating, price_range: restaurant.price_range, atmosphere_rating: restaurant.atmosphere_rating, service_rating: restaurant.service_rating, value_rating: restaurant.value_rating, review: restaurant.review, tags: restaurant.tags, dishes: restaurant.dishes }
                                : (restaurant.revisions![i - 1].snapshot as Record<string, unknown>);
                            const changes = diffSnapshots(revision.snapshot as Record<string, unknown>, afterSnap, RESTAURANT_FIELDS);

                            return (
                                <div key={revision.id} className="flex flex-col gap-[6px] px-[14px] py-3 bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-[var(--fl-tx)]">{revision.user.first_name}</span>
                                        <span className="text-xs text-[var(--fl-tx3)]">
                                            {new Date(revision.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    {changes.length > 0 ? (
                                        <div className="flex flex-col gap-1 my-[2px]">
                                            {changes.map((c) => (
                                                <div key={c.label} className="flex items-baseline flex-wrap gap-1 text-xs leading-relaxed">
                                                    <span className="font-bold text-[var(--fl-tx2)] shrink-0 min-w-[72px]">{c.label}</span>
                                                    <span className="text-[var(--fl-red)] line-through break-all">{c.before}</span>
                                                    <span className="text-[var(--fl-tx3)] shrink-0">{'\u2192'}</span>
                                                    <span className="text-[var(--fl-grn)] break-all">{c.after}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-[var(--fl-tx2)]">{revision.summary}</div>
                                    )}
                                    <button
                                        className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s2)] active:scale-[.97] px-[14px] py-2 text-sm font-semibold rounded-xl"
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
