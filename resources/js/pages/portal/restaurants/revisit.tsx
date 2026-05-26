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
        <div className="mb-3">
            <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">{label}</label>
            <div className="flex items-center gap-[2px]">
                {[1, 2, 3, 4, 5].map((i) => (
                    <button
                        key={i}
                        type="button"
                        className={`w-[34px] h-[34px] flex items-center justify-center text-lg cursor-pointer border-none transition-all duration-100 active:scale-[.9] ${i <= (hovered || current) ? 'text-[var(--fl-gold)] drop-shadow-[0_1px_2px_rgba(255,183,77,.4)]' : 'text-[var(--fl-tx3)] hover:text-[var(--fl-gold)]'}`}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => onChange(String(i))}
                    >
                        {'\u2605'}
                    </button>
                ))}
                {current > 0 && <span className="ml-1 text-sm font-bold text-[var(--fl-gold)]">{current.toFixed(1)}</span>}
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
        <form className="p-4 lg:p-7 kj-anim-viewin pb-[calc(var(--fl-nav-h)+var(--fl-safe)+80px)] lg:pb-[100px]" onSubmit={submit}>
            <div className="mb-6">
                <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">Visit Details</h3>
                <p style={{ fontSize: '13px', color: 'var(--fl-tx2)', marginBottom: '12px' }}>
                    Logging a revisit to <strong>{restaurant.emoji} {restaurant.name}</strong>
                </p>

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="visit_date">Date of Visit *</label>
                    <input
                        id="visit_date"
                        className={`w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none${errors.visit_date ? ' border-[var(--fl-red)]' : ''}`}
                        type="date"
                        value={data.visit_date}
                        onChange={(e) => setData('visit_date', e.target.value)}
                        required
                    />
                    {errors.visit_date && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.visit_date}</span>}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">Update Your Experience <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--fl-tx3)' }}>(optional)</span></h3>
                <p style={{ fontSize: '13px', color: 'var(--fl-tx2)', marginBottom: '12px' }}>
                    Leave these blank to keep your existing ratings and review.
                </p>
                <StarInput label="Overall Rating" value={data.overall_rating} onChange={(v) => setData('overall_rating', v)} />
                <StarInput label="Atmosphere" value={data.atmosphere_rating} onChange={(v) => setData('atmosphere_rating', v)} />
                <StarInput label="Service" value={data.service_rating} onChange={(v) => setData('service_rating', v)} />
                <StarInput label="Value" value={data.value_rating} onChange={(v) => setData('value_rating', v)} />

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="review">Review</label>
                    <textarea
                        id="review"
                        className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none min-h-[90px] resize-y leading-[1.55]"
                        value={data.review}
                        onChange={(e) => setData('review', e.target.value)}
                        placeholder="Describe your experience on this visit\u2026"
                        rows={4}
                    />
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">New Dishes <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--fl-tx3)' }}>(optional)</span></h3>
                    <button type="button" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s2)] active:scale-[.97] px-[14px] py-2 text-sm font-semibold rounded-xl" onClick={addDish}>
                        + Add Dish
                    </button>
                </div>
                {data.dishes.map((dish, idx) => (
                    <div key={idx} className="relative bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl p-[14px] pt-[18px] mb-[10px]">
                        <button type="button" className="shrink-0 self-end w-6 h-6 rounded-xl bg-[var(--fl-red-d)] text-[var(--fl-red)] flex items-center justify-center text-xs cursor-pointer transition-colors duration-100 mb-3 active:bg-[rgba(255,69,96,.3)]" onClick={() => removeDish(idx)}>{'\u2715'}</button>
                        <div className="grid grid-cols-2 gap-[10px]">
                            <div className="mb-3 relative" style={{ flex: 2 }}>
                                <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Dish Name</label>
                                <input
                                    className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none"
                                    type="text"
                                    value={dish.name}
                                    onChange={(e) => updateDish(idx, 'name', e.target.value)}
                                    placeholder="e.g. Margherita Pizza"
                                />
                            </div>
                            <div className="mb-3 relative">
                                <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Rating</label>
                                <select className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none" value={dish.rating} onChange={(e) => updateDish(idx, 'rating', e.target.value)}>
                                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} {'\u2605'}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mb-3 relative">
                            <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Notes</label>
                            <input
                                className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none"
                                type="text"
                                value={dish.notes}
                                onChange={(e) => updateDish(idx, 'notes', e.target.value)}
                                placeholder="Any notes about this dish?"
                            />
                        </div>
                        <div className="mb-3 relative">
                            <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Photo</label>
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
                                    className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s2)] active:scale-[.97] px-[14px] py-2 text-sm font-semibold rounded-xl"
                                    onClick={() => dishPhotoRefs.current[idx]?.click()}
                                >
                                    {'\uD83D\uDCF7'} {dish.photo ? 'Change Photo' : 'Add Photo'}
                                </button>
                                {dish.photo && (
                                    <span className="inline-flex items-center gap-2 bg-[var(--fl-s3)] border border-[var(--fl-bdr)] rounded-full px-[10px] py-[5px] text-sm text-[var(--fl-tx2)] w-fit">
                                        {dish.photo.name}
                                        <button
                                            type="button"
                                            className="text-[var(--fl-tx3)] text-xs cursor-pointer transition-colors duration-100 hover:text-[var(--fl-red)]"
                                            onClick={() => {
                                                updateDishPhoto(idx, null);
                                                const ref = dishPhotoRefs.current[idx];

                                                if (ref) {
ref.value = '';
}
                                            }}
                                        >{'\u2715'}</button>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {data.dishes.length === 0 && (
                    <p className="text-sm text-[var(--fl-tx3)] text-center p-3">No new dishes added yet.</p>
                )}
            </div>

            <div className="fl-form-footer">
                <button type="submit" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]" disabled={processing}>
                    {processing ? 'Saving\u2026' : 'Log Revisit'}
                </button>
                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s2)] active:scale-[.97]"
                    onClick={() => window.history.back()}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

RestaurantRevisit.layout = (page: ReactNode) => <PortalLayout showBack title="Log Revisit">{page}</PortalLayout>;
