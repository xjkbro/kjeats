import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import PortalLayout from '@/layouts/portal/portal-layout';

interface DishInput {
    name: string;
    rating: string;
    notes: string;
    photo?: File | null;
}

interface FormValues {
    emoji: string;
    name: string;
    cuisine: string;
    location: string;
    date_visited: string;
    visit_dates: string[];
    overall_rating: string;
    price_range: string;
    review: string;
    tags: string;
    atmosphere_rating: string;
    service_rating: string;
    value_rating: string;
    restaurant_photo: File | null;
    dishes: DishInput[];
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

export default function RestaurantCreate() {
    const { data, setData, post, processing, errors } = useForm<FormValues>({
        emoji: '🍽️',
        name: '',
        cuisine: '',
        location: '',
        date_visited: new Date().toISOString().slice(0, 10),
        visit_dates: [],
        overall_rating: '',
        price_range: '$$',
        review: '',
        tags: '',
        atmosphere_rating: '',
        service_rating: '',
        value_rating: '',
        restaurant_photo: null,
        dishes: [],
    });

    const restaurantPhotoRef = useRef<HTMLInputElement>(null);
    const dishPhotoRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [newVisitDate, setNewVisitDate] = useState('');

    function addDish() {
        setData('dishes', [...data.dishes, { name: '', rating: '3', notes: '', photo: null }]);
    }

    function updateDish(idx: number, field: keyof DishInput, value: string) {
        const dishes = [...data.dishes];
        dishes[idx] = { ...dishes[idx], [field]: value };
        setData('dishes', dishes);
    }

    function updateDishPhoto(idx: number, file: File | null) {
        const dishes = [...data.dishes];
        dishes[idx] = { ...dishes[idx], photo: file };
        setData('dishes', dishes);
    }

    function removeDish(idx: number) {
        setData('dishes', data.dishes.filter((_, i) => i !== idx));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(RestaurantController.store().url);
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
                        placeholder="e.g. The Golden Fork"
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
                            placeholder="e.g. Italian"
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
                            placeholder="City, Neighborhood"
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
                        placeholder="e.g. Date Night, Family Friendly, Outdoor"
                    />
                </div>

                <div className="fl-fgrp">
                    <label className="fl-flbl">Photo</label>
                    <input
                        ref={restaurantPhotoRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => setData('restaurant_photo', e.target.files?.[0] ?? null)}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="fl-btn fl-btn-ghost fl-btn-sm"
                            onClick={() => restaurantPhotoRef.current?.click()}
                        >
                            📷 {data.restaurant_photo ? 'Change Photo' : 'Add Photo'}
                        </button>
                        {data.restaurant_photo && (
                            <span className="fl-visit-chip">
                                {data.restaurant_photo.name}
                                <button
                                    type="button"
                                    className="fl-visit-chip-rm"
                                    onClick={() => {
                                        setData('restaurant_photo', null);
                                        if (restaurantPhotoRef.current) restaurantPhotoRef.current.value = '';
                                    }}
                                >✕</button>
                            </span>
                        )}
                    </div>
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
                        placeholder="Share your experience…"
                        rows={4}
                    />
                </div>
            </div>

            <div className="fl-fsec">
                <div className="fl-fsec-hdr">
                    <h3 className="fl-fsec-ttl">Dishes</h3>
                    <button type="button" className="fl-btn fl-btn-ghost fl-btn-sm" onClick={addDish}>
                        + Add Dish
                    </button>
                </div>
                {data.dishes.map((dish, idx) => (
                    <div key={idx} className="fl-dish-form">
                        <button type="button" className="fl-dish-remove" onClick={() => removeDish(idx)}>✕</button>
                        <div className="fl-frow">
                            <div className="fl-fgrp" style={{ flex: 2 }}>
                                <label className="fl-flbl">Dish Name</label>
                                <input
                                    className="fl-fi"
                                    type="text"
                                    value={dish.name}
                                    onChange={(e) => updateDish(idx, 'name', e.target.value)}
                                    placeholder="e.g. Margherita Pizza"
                                />
                            </div>
                            <div className="fl-fgrp">
                                <label className="fl-flbl">Rating</label>
                                <select className="fl-fi" value={dish.rating} onChange={(e) => updateDish(idx, 'rating', e.target.value)}>
                                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="fl-fgrp">
                            <label className="fl-flbl">Notes</label>
                            <input
                                className="fl-fi"
                                type="text"
                                value={dish.notes}
                                onChange={(e) => updateDish(idx, 'notes', e.target.value)}
                                placeholder="Any notes about this dish?"
                            />
                        </div>
                        <div className="fl-fgrp">
                            <label className="fl-flbl">Photo</label>
                            <input
                                ref={(el) => { dishPhotoRefs.current[idx] = el; }}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => updateDishPhoto(idx, e.target.files?.[0] ?? null)}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    className="fl-btn fl-btn-ghost fl-btn-sm"
                                    onClick={() => dishPhotoRefs.current[idx]?.click()}
                                >
                                    📷 {dish.photo ? 'Change Photo' : 'Add Photo'}
                                </button>
                                {dish.photo && (
                                    <span className="fl-visit-chip">
                                        {dish.photo.name}
                                        <button
                                            type="button"
                                            className="fl-visit-chip-rm"
                                            onClick={() => {
                                                updateDishPhoto(idx, null);
                                                const ref = dishPhotoRefs.current[idx];
                                                if (ref) ref.value = '';
                                            }}
                                        >✕</button>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {data.dishes.length === 0 && (
                    <p className="fl-empty-inline">No dishes added yet. Click "+ Add Dish" above.</p>
                )}
            </div>

            <div className="fl-form-footer">
                <button type="submit" className="fl-btn fl-btn-p" disabled={processing}>
                    {processing ? 'Saving…' : 'Save Review'}
                </button>
            </div>
        </form>
    );
}

RestaurantCreate.layout = (page: ReactNode) => <PortalLayout showBack title="Add Restaurant">{page}</PortalLayout>;
