import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import PortalLayout from '@/layouts/portal/portal-layout';
import type { Restaurant } from '@/types/portal';

interface DishInput {
    name: string;
    rating: string;
    notes: string;
    photo?: File | null;
}

interface FormValues {
    visit_date: string;
    overall_rating: string;
    atmosphere_rating: string;
    service_rating: string;
    value_rating: string;
    review: string;
    dishes: DishInput[];
}

interface Props {
    restaurant: Restaurant;
}

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

export default function RestaurantRevisit({ restaurant }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormValues>({
        visit_date: new Date().toISOString().slice(0, 10),
        overall_rating: String(restaurant.overall_rating ?? ''),
        atmosphere_rating: String(restaurant.atmosphere_rating ?? ''),
        service_rating: String(restaurant.service_rating ?? ''),
        value_rating: String(restaurant.value_rating ?? ''),
        review: restaurant.review ?? '',
        dishes: [],
    });

    const dishPhotoRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        post(RestaurantController.logRevisit(restaurant.id).url);
    }

    return (
        <form className="fl-view fl-form" onSubmit={submit}>
            <div className="fl-fsec">
                <h3 className="fl-fsec-ttl">Visit Details</h3>
                <p style={{ fontSize: '13px', color: 'var(--fl-tx2)', marginBottom: '12px' }}>
                    Logging a revisit to <strong>{restaurant.emoji} {restaurant.name}</strong>
                </p>

                <div className="fl-fgrp">
                    <label className="fl-flbl" htmlFor="visit_date">Date of Visit *</label>
                    <input
                        id="visit_date"
                        className={`fl-fi${errors.visit_date ? ' error' : ''}`}
                        type="date"
                        value={data.visit_date}
                        onChange={(e) => setData('visit_date', e.target.value)}
                        required
                    />
                    {errors.visit_date && <span className="fl-ferr">{errors.visit_date}</span>}
                </div>
            </div>

            <div className="fl-fsec">
                <h3 className="fl-fsec-ttl">Update Your Experience <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--fl-tx3)' }}>(optional)</span></h3>
                <p style={{ fontSize: '13px', color: 'var(--fl-tx2)', marginBottom: '12px' }}>
                    Leave these blank to keep your existing ratings and review.
                </p>
                <StarInput label="Overall Rating" value={data.overall_rating} onChange={(v) => setData('overall_rating', v)} />
                <StarInput label="Atmosphere" value={data.atmosphere_rating} onChange={(v) => setData('atmosphere_rating', v)} />
                <StarInput label="Service" value={data.service_rating} onChange={(v) => setData('service_rating', v)} />
                <StarInput label="Value" value={data.value_rating} onChange={(v) => setData('value_rating', v)} />

                <div className="fl-fgrp">
                    <label className="fl-flbl" htmlFor="review">Review</label>
                    <textarea
                        id="review"
                        className="fl-fi fl-ftxt"
                        value={data.review}
                        onChange={(e) => setData('review', e.target.value)}
                        placeholder="Describe your experience on this visit…"
                        rows={4}
                    />
                </div>
            </div>

            <div className="fl-fsec">
                <div className="fl-fsec-hdr">
                    <h3 className="fl-fsec-ttl">New Dishes <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--fl-tx3)' }}>(optional)</span></h3>
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
                                ref={(el) => {
 dishPhotoRefs.current[idx] = el; 
}}
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

                                                if (ref) {
ref.value = '';
}
                                            }}
                                        >✕</button>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {data.dishes.length === 0 && (
                    <p className="fl-empty-inline">No new dishes added yet.</p>
                )}
            </div>

            <div className="fl-form-footer">
                <button type="submit" className="fl-btn fl-btn-p" disabled={processing}>
                    {processing ? 'Saving…' : 'Log Revisit'}
                </button>
                <button
                    type="button"
                    className="fl-btn fl-btn-ghost"
                    onClick={() => window.history.back()}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

RestaurantRevisit.layout = (page: ReactNode) => <PortalLayout showBack title="Log Revisit">{page}</PortalLayout>;
