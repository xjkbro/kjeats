import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as WantToTryController from '@/actions/App/Http/Controllers/WantToTryController';
import PortalLayout from '@/layouts/portal/portal-layout';

interface Props {
    all_locations: string[];
}

export default function WantToTryCreate({ all_locations = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        cuisine: '',
        location: '',
        notes: '',
    });

    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const locationInputRef = useRef<HTMLInputElement>(null);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(WantToTryController.store().url);
    }

    function handleLocationChange(value: string) {
        setData('location', value);
        setShowLocationSuggestions(value.length > 0);
    }

    function selectLocation(location: string) {
        setData('location', location);
        setShowLocationSuggestions(false);
    }

    const filteredLocations = all_locations
        .filter((loc): loc is string => loc != null)
        .filter((loc) => loc.toLowerCase().includes(data.location.toLowerCase()) && loc !== data.location);

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
                    <div className="fl-fgrp" style={{ position: 'relative' }}>
                        <label className="fl-flbl" htmlFor="location">Location</label>
                        <input
                            id="location"
                            ref={locationInputRef}
                            className="fl-fi"
                            type="text"
                            value={data.location}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                            onFocus={() => data.location.length > 0 && setShowLocationSuggestions(true)}
                            placeholder="City or area"
                            autoComplete="off"
                        />
                        {showLocationSuggestions && filteredLocations.length > 0 && (
                            <div className="fl-autocomplete-dropdown">
                                {filteredLocations.slice(0, 8).map((loc) => (
                                    <button
                                        key={loc}
                                        type="button"
                                        className="fl-autocomplete-item"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            selectLocation(loc);
                                        }}
                                    >
                                        {loc}
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
