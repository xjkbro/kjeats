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
        <form className="fl-view fl-form" onSubmit={submit}>
            <div className="fl-fsec">
                <h3 className="fl-fsec-ttl">Quick Save</h3>

                <div className="fl-fgrp">
                    <label className="fl-flbl" htmlFor="name">
                        Restaurant Name <span className="fl-req">*</span>
                    </label>
                    <input
                        id="name"
                        className={`fl-fi${errors.name ? ' error' : ''}`}
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. The Golden Fork"
                        required
                        autoFocus
                    />
                    {errors.name && <span className="fl-ferr">{errors.name}</span>}
                </div>

                <div className="fl-frow">
                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="cuisine">Cuisine</label>
                        <input
                            id="cuisine"
                            className="fl-fi"
                            type="text"
                            value={data.cuisine}
                            onChange={(e) => setData('cuisine', e.target.value)}
                            placeholder="e.g. Italian"
                        />
                    </div>
                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="location">Location</label>
                        <input
                            id="location"
                            ref={locationInputRef}
                            className="fl-fi"
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
                            <div className="fl-autocomplete-dropdown">
                                {filteredLocations.slice(0, 8).map((loc) => (
                                    <button
                                        key={loc.name}
                                        type="button"
                                        className="fl-autocomplete-item"
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

                <div className="fl-fgrp">
                    <label className="fl-flbl" htmlFor="notes">Notes</label>
                    <textarea
                        id="notes"
                        className="fl-fi fl-ftxt"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Why do you want to try it?"
                        rows={3}
                    />
                </div>
            </div>

            <div className="fl-form-footer">
                <button type="submit" className="fl-btn fl-btn-p" disabled={processing}>
                    {processing ? 'Saving…' : 'Save'}
                </button>
            </div>
        </form>
    );
}

WantToTryCreate.layout = (page: ReactNode) => <PortalLayout showBack title="Want to Try">{page}</PortalLayout>;
