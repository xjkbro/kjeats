import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import PortalLayout from '@/layouts/portal/portal-layout';
import type { Restaurant } from '@/types/portal';

interface Props {
    restaurant: Restaurant;
}

const EMOJIS = ['🍽️', '🍕', '🍣', '🌮', '🍜', '🥩', '🥗', '🍔', '🥐', '🍱', '🍛', '🍝'];
const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];

function StarInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const [hovered, setHovered] = useState(0);
    const current = parseFloat(value) || 0;

    return (
        <div className="fl-star-inp">
            <label className="fl-flbl">{label}</label>
            <div className="fl-stars-row">
                {[1, 2, 3, 4, 5].map((i) => (
                    <button
                        key={i}
                        type="button"
                        className={i <= (hovered || current) ? 'filled' : ''}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => onChange(String(i))}
                    >
                        ★
                    </button>
                ))}
                {current > 0 && <span className="fl-star-val">{current.toFixed(1)}</span>}
            </div>
        </div>
    );
}

export default function RestaurantEdit({ restaurant }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        emoji: restaurant.emoji,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        location: restaurant.location,
        date_visited: restaurant.date_visited,
        visit_dates: restaurant.visit_dates ?? [],
        overall_rating: String(restaurant.overall_rating),
        price_range: restaurant.price_range,
        review: restaurant.review ?? '',
        tags: (restaurant.tags ?? []).join(', '),
        atmosphere_rating: String(restaurant.atmosphere_rating),
        service_rating: String(restaurant.service_rating),
        value_rating: String(restaurant.value_rating),
    });

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [newVisitDate, setNewVisitDate] = useState('');

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(RestaurantController.update(restaurant.id).url);
    }

    return (
        <form className="fl-view fl-form" onSubmit={submit}>
            <div className="fl-fsec">
                <h3 className="fl-fsec-ttl">Basic Information</h3>

                <div className="fl-fgrp fl-emoji-grp">
                    <label className="fl-flbl">Icon</label>
                    <button type="button" className="fl-emoji-btn" onClick={() => setShowEmojiPicker((v) => !v)}>
                        {data.emoji}
                    </button>
                    {showEmojiPicker && (
                        <div className="fl-emoji-picker">
                            {EMOJIS.map((e) => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() => {
                                        setData('emoji', e);
                                        setShowEmojiPicker(false);
                                    }}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="fl-fgrp">
                    <label className="fl-flbl" htmlFor="name">Restaurant Name *</label>
                    <input
                        id="name"
                        className={`fl-fi${errors.name ? ' error' : ''}`}
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && <span className="fl-ferr">{errors.name}</span>}
                </div>

                <div className="fl-frow">
                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="cuisine">Cuisine *</label>
                        <input
                            id="cuisine"
                            className={`fl-fi${errors.cuisine ? ' error' : ''}`}
                            type="text"
                            value={data.cuisine}
                            onChange={(e) => setData('cuisine', e.target.value)}
                            required
                        />
                        {errors.cuisine && <span className="fl-ferr">{errors.cuisine}</span>}
                    </div>
                    <div className="fl-fgrp">
                        <label className="fl-flbl">Price Range</label>
                        <div className="fl-seg">
                            {PRICE_RANGES.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`fl-seg-btn${data.price_range === p ? ' active' : ''}`}
                                    onClick={() => setData('price_range', p)}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="fl-frow">
                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="location">Location</label>
                        <input
                            id="location"
                            className="fl-fi"
                            type="text"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                        />
                    </div>
                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="date_visited">Date Visited</label>
                        <input
                            id="date_visited"
                            className="fl-fi"
                            type="date"
                            value={data.date_visited}
                            onChange={(e) => setData('date_visited', e.target.value)}
                        />
                    </div>
                </div>

                <div className="fl-fgrp">
                    <label className="fl-flbl">Additional Visit Dates</label>
                    <div className="fl-visit-dates">
                        {data.visit_dates.map((d) => (
                            <span key={d} className="fl-visit-chip">
                                {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                <button
                                    type="button"
                                    className="fl-visit-chip-rm"
                                    onClick={() => setData('visit_dates', data.visit_dates.filter((x) => x !== d))}
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                        <div className="fl-visit-add">
                            <input
                                className="fl-fi"
                                type="date"
                                value={newVisitDate}
                                onChange={(e) => setNewVisitDate(e.target.value)}
                            />
                            <button
                                type="button"
                                className="fl-btn fl-btn-ghost fl-btn-sm"
                                disabled={!newVisitDate || data.visit_dates.includes(newVisitDate)}
                                onClick={() => {
                                    if (newVisitDate && !data.visit_dates.includes(newVisitDate)) {
                                        setData('visit_dates', [...data.visit_dates, newVisitDate]);
                                        setNewVisitDate('');
                                    }
                                }}
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                </div>

                <div className="fl-fgrp">
                    <label className="fl-flbl" htmlFor="tags">Tags (comma-separated)</label>
                    <input
                        id="tags"
                        className="fl-fi"
                        type="text"
                        value={data.tags}
                        onChange={(e) => setData('tags', e.target.value)}
                    />
                </div>
            </div>

            <div className="fl-fsec">
                <h3 className="fl-fsec-ttl">Ratings</h3>
                <StarInput label="Overall Rating *" value={data.overall_rating} onChange={(v) => setData('overall_rating', v)} />
                {errors.overall_rating && <span className="fl-ferr">{errors.overall_rating}</span>}
                <StarInput label="Atmosphere" value={data.atmosphere_rating} onChange={(v) => setData('atmosphere_rating', v)} />
                <StarInput label="Service" value={data.service_rating} onChange={(v) => setData('service_rating', v)} />
                <StarInput label="Value" value={data.value_rating} onChange={(v) => setData('value_rating', v)} />
            </div>

            <div className="fl-fsec">
                <h3 className="fl-fsec-ttl">Your Review</h3>
                <div className="fl-fgrp">
                    <label className="fl-flbl" htmlFor="review">Review</label>
                    <textarea
                        id="review"
                        className="fl-fi fl-ftxt"
                        value={data.review}
                        onChange={(e) => setData('review', e.target.value)}
                        rows={4}
                    />
                </div>
            </div>

            <div className="fl-form-footer">
                <button type="submit" className="fl-btn fl-btn-p" disabled={processing}>
                    {processing ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="fl-btn fl-btn-sec" onClick={() => router.visit(RestaurantController.show(restaurant.id).url)}>
                    Discard
                </button>
            </div>
        </form>
    );
}

RestaurantEdit.layout = (page: ReactNode) => <PortalLayout showBack title="Edit Restaurant">{page}</PortalLayout>;
