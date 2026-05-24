import { router, useForm } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import TagInput from '@/components/tag-input';
import PortalLayout from '@/layouts/portal/portal-layout';
import { index as cuisinesIndexRoute } from '@/routes/cuisines';
import { index as locationsIndexRoute } from '@/routes/locations';
import type { Restaurant } from '@/types/portal';

interface Props {
    restaurant: Restaurant;
    all_tags: string[];
}

const EMOJIS = ['\uD83C\uDF7D\uFE0F', '\uD83C\uDF55', '\uD83C\uDF63', '\uD83C\uDF2E', '\uD83C\uDF5C', '\uD83E\uDD69', '\uD83E\uDD57', '\uD83C\uDF54', '\uD83E\uDD50', '\uD83C\uDF71', '\uD83C\uDF5B', '\uD83C\uDF5D'];
const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];

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

export default function RestaurantEdit({ restaurant, all_tags }: Props) {
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
        tags: restaurant.tags ?? [],
        atmosphere_rating: String(restaurant.atmosphere_rating),
        service_rating: String(restaurant.service_rating),
        value_rating: String(restaurant.value_rating),
    });

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [newVisitDate, setNewVisitDate] = useState('');

    const [locationSuggestions, setLocationSuggestions] = useState<Array<{ name: string; display_name: string }>>([]);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const locationInputRef = useRef<HTMLInputElement>(null);

    const fetchLocationSuggestions = useCallback(async (query: string) => {
        if (!query.trim()) {
            setLocationSuggestions([]);

            return;
        }

        try {
            const res = await fetch(locationsIndexRoute.url({ query: { q: query } }));
            const result = await res.json();
            setLocationSuggestions(result);
        } catch {
            setLocationSuggestions([]);
        }
    }, []);

    function selectLocation(name: string) {
        setData('location', name);
        setShowLocationSuggestions(false);
    }

    const filteredLocations = locationSuggestions
        .filter((loc) => loc.name.toLowerCase() !== data.location.toLowerCase());

    const [cuisineSuggestions, setCuisineSuggestions] = useState<string[]>([]);
    const [showCuisineSuggestions, setShowCuisineSuggestions] = useState(false);
    const cuisineInputRef = useRef<HTMLInputElement>(null);

    const fetchCuisineSuggestions = useCallback(async (query: string) => {
        if (!query.trim()) {
            setCuisineSuggestions([]);

            return;
        }

        try {
            const res = await fetch(cuisinesIndexRoute.url({ query: { q: query } }));
            const result = await res.json();
            setCuisineSuggestions(result);
        } catch {
            setCuisineSuggestions([]);
        }
    }, []);

    function selectCuisine(name: string) {
        setData('cuisine', name);
        setShowCuisineSuggestions(false);
    }

    const filteredCuisines = cuisineSuggestions
        .filter((c) => c.toLowerCase() !== data.cuisine.toLowerCase());

    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.cuisine.length > 0) {
                fetchCuisineSuggestions(data.cuisine);
            } else {
                setCuisineSuggestions([]);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [data.cuisine, fetchCuisineSuggestions]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.location.length > 0) {
                fetchLocationSuggestions(data.location);
            } else {
                setLocationSuggestions([]);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [data.location, fetchLocationSuggestions]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(RestaurantController.update(restaurant.id).url, { replace: true });
    }

    return (
        <form className="p-4 lg:p-7 kj-anim-viewin pb-[calc(var(--fl-nav-h)+var(--fl-safe)+80px)] lg:pb-[100px]" onSubmit={submit}>
            <div className="mb-6">
                <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">Basic Information</h3>

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Icon</label>
                    <button type="button" className="text-4xl leading-none bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[14px] py-2 cursor-pointer transition-colors duration-100 hover:border-[var(--fl-bdr-h)]" onClick={() => setShowEmojiPicker((v) => !v)}>
                        {data.emoji}
                    </button>
                    {showEmojiPicker && (
                        <div className="grid grid-cols-6 gap-1 bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl p-[10px] mt-2 absolute z-10 left-0 shadow-[var(--fl-sh2)]">
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

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="name">Restaurant Name <span className="text-[var(--fl-red)] ml-[2px]">*</span></label>
                    <input
                        id="name"
                        className={`w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none${errors.name ? ' border-[var(--fl-red)]' : ''}`}
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.name}</span>}
                </div>

                <div className="grid grid-cols-2 gap-[10px]">
                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="cuisine">Cuisine <span className="text-[var(--fl-red)] ml-[2px]">*</span></label>
                        <input
                            id="cuisine"
                            ref={cuisineInputRef}
                            className={`w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none${errors.cuisine ? ' border-[var(--fl-red)]' : ''}`}
                            type="text"
                            value={data.cuisine}
                            onChange={(e) => setData('cuisine', e.target.value)}
                            onBlur={() => setTimeout(() => {
                                setShowCuisineSuggestions(false);
                            }, 200)}
                            onFocus={() => data.cuisine.length > 0 && setShowCuisineSuggestions(true)}
                            required
                            autoComplete="off"
                        />
                        {showCuisineSuggestions && (
                            <div className="absolute top-full left-0 right-0 bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl mt-1 shadow-[var(--fl-sh2)] z-40 overflow-hidden">
                                {filteredCuisines.slice(0, 8).map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        className="w-full px-[13px] py-[10px] text-left text-sm text-[var(--fl-tx)] transition-colors duration-100 hover:bg-[var(--fl-s3)] active:bg-[var(--fl-s3)]"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            selectCuisine(c);
                                        }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}
                        {errors.cuisine && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.cuisine}</span>}
                    </div>
                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Price Range</label>
                        <div className="flex gap-1 bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl p-1">
                            {PRICE_RANGES.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`flex-1 px-[10px] py-[7px] rounded-[10px] text-sm font-semibold bg-transparent transition-all duration-100 cursor-pointer whitespace-nowrap active:scale-[.97]${data.price_range === p ? ' bg-[var(--fl-s3)] text-[var(--fl-tx)] shadow-sm' : ' text-[var(--fl-tx2)]'}`}
                                    onClick={() => setData('price_range', p)}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-[10px]">
                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="location">Location</label>
                        <input
                            id="location"
                            ref={locationInputRef}
                            className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none"
                            type="text"
                            value={data.location}
                            onChange={(e) => {
                                setData('location', e.target.value);
                                setShowLocationSuggestions(e.target.value.length > 0);
                            }}
                            onBlur={() => setTimeout(() => {
                                setShowLocationSuggestions(false);
                            }, 200)}
                            onFocus={() => data.location.length > 0 && setShowLocationSuggestions(true)}
                            autoComplete="off"
                        />
                        {showLocationSuggestions && (
                            <div className="absolute top-full left-0 right-0 bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl mt-1 shadow-[var(--fl-sh2)] z-40 overflow-hidden">
                                {filteredLocations.slice(0, 8).map((loc) => (
                                    <button
                                        key={loc.name}
                                        type="button"
                                        className="w-full px-[13px] py-[10px] text-left text-sm text-[var(--fl-tx)] transition-colors duration-100 hover:bg-[var(--fl-s3)] active:bg-[var(--fl-s3)]"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            selectLocation(loc.name);
                                        }}
                                    >
                                        {loc.display_name !== loc.name ? `${loc.display_name} \u2014 ${loc.name}` : loc.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="date_visited">Date Visited</label>
                        <input
                            id="date_visited"
                            className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none"
                            type="date"
                            value={data.date_visited}
                            onChange={(e) => setData('date_visited', e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Additional Visit Dates</label>
                    <div className="flex flex-col gap-2">
                        {data.visit_dates.map((d) => (
                            <span key={d} className="inline-flex items-center gap-2 bg-[var(--fl-s3)] border border-[var(--fl-bdr)] rounded-full px-[10px] py-[5px] text-sm text-[var(--fl-tx2)] w-fit">
                                {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                <button
                                    type="button"
                                    className="text-[var(--fl-tx3)] text-xs cursor-pointer transition-colors duration-100 hover:text-[var(--fl-red)]"
                                    onClick={() => setData('visit_dates', data.visit_dates.filter((x) => x !== d))}
                                >
                                    {'\u2715'}
                                </button>
                            </span>
                        ))}
                        <div className="flex gap-2 items-center">
                            <input
                                className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none"
                                type="date"
                                value={newVisitDate}
                                onChange={(e) => setNewVisitDate(e.target.value)}
                            />
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s2)] active:scale-[.97] px-[14px] py-2 text-sm font-semibold rounded-xl"
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

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Tags</label>
                    <TagInput
                        value={data.tags}
                        onChange={(tags) => setData('tags', tags)}
                        suggestions={all_tags}
                    />
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">Ratings</h3>
                <StarInput label="Overall Rating *" value={data.overall_rating} onChange={(v) => setData('overall_rating', v)} />
                {errors.overall_rating && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.overall_rating}</span>}
                <StarInput label="Atmosphere" value={data.atmosphere_rating} onChange={(v) => setData('atmosphere_rating', v)} />
                <StarInput label="Service" value={data.service_rating} onChange={(v) => setData('service_rating', v)} />
                <StarInput label="Value" value={data.value_rating} onChange={(v) => setData('value_rating', v)} />
            </div>

            <div className="mb-6">
                <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">Your Review</h3>
                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="review">Review</label>
                    <textarea
                        id="review"
                        className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none min-h-[90px] resize-y leading-[1.55]"
                        value={data.review}
                        onChange={(e) => setData('review', e.target.value)}
                        rows={4}
                    />
                </div>
            </div>

            <div className="fl-form-footer">
                <button type="submit" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]" disabled={processing}>
                    {processing ? 'Saving\u2026' : 'Save Changes'}
                </button>
                <button type="button" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-[var(--fl-s3)] text-[var(--fl-tx)] border-[var(--fl-bdr)] active:bg-[var(--fl-s4)] active:scale-[.97]" onClick={() => router.visit(RestaurantController.show(restaurant.id).url)}>
                    Discard
                </button>
            </div>
        </form>
    );
}

RestaurantEdit.layout = (page: ReactNode) => <PortalLayout showBack title="Edit Restaurant">{page}</PortalLayout>;
