import { useForm } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import TagInput from '@/components/tag-input';
import PortalLayout from '@/layouts/portal/portal-layout';
import { index as cuisinesIndexRoute } from '@/routes/cuisines';
import { index as locationsIndexRoute } from '@/routes/locations';

interface Props {
    all_tags: string[];
    want_to_tries: Array<{
        id: number;
        emoji: string;
        name: string;
        cuisine: string | null;
        location: string | null;
        notes: string | null;
    }>;
}

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
    tags: string[];
    atmosphere_rating: string;
    service_rating: string;
    value_rating: string;
    restaurant_photo: File | null;
    dishes: DishInput[];
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

export default function RestaurantCreate({ all_tags, want_to_tries = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormValues>({
        emoji: '\uD83C\uDF7D\uFE0F',
        name: '',
        cuisine: '',
        location: '',
        date_visited: new Date().toISOString().slice(0, 10),
        visit_dates: [],
        overall_rating: '',
        price_range: '$$',
        review: '',
        tags: [],
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
    const [showWantToTry, setShowWantToTry] = useState(false);
    const [selectedWantToTryId, setSelectedWantToTryId] = useState<number | null>(null);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState<Array<{ name: string; display_name: string }>>([]);
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
            const data = await res.json();
            setCuisineSuggestions(data);
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

    function selectWantToTry(id: number) {
        const item = want_to_tries.find((w) => w.id === id);

        if (item) {
            setData({
                ...data,
                emoji: item.emoji,
                name: item.name,
                cuisine: item.cuisine ?? '',
                location: item.location ?? '',
            });
            setSelectedWantToTryId(id);
            setShowWantToTry(false);
        }
    }

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
        <form className="p-4 lg:p-7 kj-anim-viewin pb-[calc(var(--fl-nav-h)+var(--fl-safe)+80px)] lg:pb-[100px]" onSubmit={submit}>
            {want_to_tries.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">From Want to Try</h3>
                        <button type="button" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s2)] active:scale-[.97] px-[14px] py-2 text-sm font-semibold rounded-xl" onClick={() => setShowWantToTry((v) => !v)}>
                            {showWantToTry ? 'Hide' : 'Select'}
                        </button>
                    </div>
                    {showWantToTry && (
                        <div className="flex flex-col gap-2 mt-[10px]">
                            {want_to_tries.map((w) => (
                                <button
                                    key={w.id}
                                    type="button"
                                    className={`flex items-center gap-3 px-3 py-3 bg-[var(--fl-s1)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl text-left cursor-pointer transition-all duration-100 active:bg-[var(--fl-s2)]${selectedWantToTryId === w.id ? ' border-[var(--fl-p)] bg-[var(--fl-p-dim)]' : ''}`}
                                    onClick={() => selectWantToTry(w.id)}
                                >
                                    <span className="text-[22px] shrink-0">{w.emoji}</span>
                                    <span className="flex-1 text-sm font-semibold text-[var(--fl-tx)]">{w.name}</span>
                                    {w.cuisine && <span className="text-xs text-[var(--fl-tx2)]">{w.cuisine}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

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
                        placeholder="e.g. The Golden Fork"
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
                            onChange={(e) => {
                                setData('cuisine', e.target.value);
                                setShowCuisineSuggestions(e.target.value.length > 0);
                            }}
                            onBlur={() => setTimeout(() => {
                                setShowCuisineSuggestions(false);
                            }, 200)}
                            onFocus={() => data.cuisine.length > 0 && setShowCuisineSuggestions(true)}
                            placeholder="e.g. Italian"
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
                            placeholder="City, Neighborhood"
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
                        placeholder="e.g. Date Night, Family Friendly, Outdoor"
                    />
                </div>

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Photo</label>
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
                            className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s2)] active:scale-[.97] px-[14px] py-2 text-sm font-semibold rounded-xl"
                            onClick={() => restaurantPhotoRef.current?.click()}
                        >
                            {'\uD83D\uDCF7'} {data.restaurant_photo ? 'Change Photo' : 'Add Photo'}
                        </button>
                        {data.restaurant_photo && (
                            <span className="inline-flex items-center gap-2 bg-[var(--fl-s3)] border border-[var(--fl-bdr)] rounded-full px-[10px] py-[5px] text-sm text-[var(--fl-tx2)] w-fit">
                                {data.restaurant_photo.name}
                                <button
                                    type="button"
                                    className="text-[var(--fl-tx3)] text-xs cursor-pointer transition-colors duration-100 hover:text-[var(--fl-red)]"
                                    onClick={() => {
                                        setData('restaurant_photo', null);

                                        if (restaurantPhotoRef.current) {
restaurantPhotoRef.current.value = '';
}
                                    }}
                                >{'\u2715'}</button>
                            </span>
                        )}
                    </div>
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
                        placeholder="Share your experience\u2026"
                        rows={4}
                    />
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">Dishes</h3>
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
                    <p className="text-sm text-[var(--fl-tx3)] text-center p-3">No dishes added yet. Click &quot;+ Add Dish&quot; above.</p>
                )}
            </div>

            <div className="fl-form-footer">
                <button type="submit" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]" disabled={processing}>
                    {processing ? 'Saving\u2026' : 'Save Review'}
                </button>
            </div>
        </form>
    );
}

RestaurantCreate.layout = (page: ReactNode) => <PortalLayout showBack title="Add Restaurant">{page}</PortalLayout>;
