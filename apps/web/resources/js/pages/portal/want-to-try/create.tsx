import { useForm } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as WantToTryController from '@/actions/App/Http/Controllers/WantToTryController';
import PortalLayout from '@/layouts/portal/portal-layout';
import { index as locationsIndexRoute } from '@/routes/locations';

export default function WantToTryCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        cuisine: '',
        location: '',
        notes: '',
    });

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
        post(WantToTryController.store().url);
    }

    return (
        <form className="p-4 lg:p-7 kj-anim-viewin pb-[calc(var(--fl-nav-h)+var(--fl-safe)+80px)] lg:pb-[100px]" onSubmit={submit}>
            <div className="mb-6">
                <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Quick Save</h3>

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="name">
                        Restaurant Name <span className="text-[var(--fl-red)] ml-[2px]">*</span>
                    </label>
                    <input
                        id="name"
                        className={`w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none${errors.name ? ' border-[var(--fl-red)] shadow-[0_0_0_3px_var(--fl-red-d)]' : ''}`}
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. The Golden Fork"
                        required
                        autoFocus
                    />
                    {errors.name && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.name}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="cuisine">Cuisine</label>
                        <input
                            id="cuisine"
                            className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none"
                            type="text"
                            value={data.cuisine}
                            onChange={(e) => setData('cuisine', e.target.value)}
                            placeholder="e.g. Italian"
                        />
                    </div>
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
                            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                            onFocus={() => data.location.length > 0 && setShowLocationSuggestions(true)}
                            placeholder="City or area"
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
                                        {loc.display_name !== loc.name ? `${loc.display_name} — ${loc.name}` : loc.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="notes">Notes</label>
                    <textarea
                        id="notes"
                        className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none resize-vertical min-h-[80px]"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Why do you want to try it?"
                        rows={3}
                    />
                </div>
            </div>

            <div className="fl-form-footer">
                <button type="submit" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]" disabled={processing}>
                    {processing ? 'Saving…' : 'Save'}
                </button>
            </div>
        </form>
    );
}

WantToTryCreate.layout = (page: ReactNode) => <PortalLayout showBack title="Want to Try">{page}</PortalLayout>;
