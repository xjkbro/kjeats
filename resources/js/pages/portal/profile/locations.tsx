import { useState } from 'react';
import type { ReactNode } from 'react';
import * as LocationController from '@/actions/App/Http/Controllers/LocationController';
import PortalLayout from '@/layouts/portal/portal-layout';

interface LocationItem {
    id: number;
    name: string;
    display_name: string;
}

interface Props {
    locations: LocationItem[];
    your_locations: string[];
}

export default function PortalLocations({ locations: initialLocations, your_locations }: Props) {
    const [locations, setLocations] = useState(initialLocations);
    const [name, setName] = useState('');
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const filteredLocations = locations
        .filter(
            (l) =>
                l.name.toLowerCase().includes(search.toLowerCase()) ||
                l.display_name.toLowerCase().includes(search.toLowerCase()),
        )
        .sort((a, b) => a.display_name.localeCompare(b.display_name));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || submitting) return;
        setSubmitting(true);
        setError('');
        setSuggestion('');

        try {
            const res = await fetch(LocationController.store().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ name: name.trim() }),
            });

            const json = await res.json();

            if (res.status === 422 && json.suggestion) {
                setSuggestion(json.suggestion);
            } else if (!res.ok) {
                setError(json.message ?? 'Failed to add location.');
            } else {
                const newLoc: LocationItem = { id: Date.now(), name: json.name, display_name: json.display_name };
                if (!locations.find((l) => l.name === json.name)) {
                    setLocations((prev) => [...prev, newLoc]);
                }
                setMessage(json.created ? `"${json.display_name}" added!` : `"${json.display_name}" already exists.`);
                setName('');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch {
            setError('Something went wrong.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fl-view">
            <div className="fl-form">
                <div className="fl-fsec">
                    <h3 className="fl-fsec-ttl">Request a Location</h3>
                    <p className="fl-fsec-sub">
                        Add a location so it appears in autocomplete. Use "City, State" or "Neighborhood, City, State".
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div className="fl-fgrp" style={{ flex: 1 }}>
                            <input
                                className="fl-fi"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setSuggestion('');
                                }}
                                placeholder="e.g. Las Vegas, NV"
                                autoComplete="off"
                            />
                        </div>
                        <button
                            type="submit"
                            className="fl-btn fl-btn-p"
                            disabled={submitting || !name.trim()}
                        >
                            {submitting ? 'Adding…' : 'Add'}
                        </button>
                    </form>

                    {suggestion && (
                        <div className="fl-toast-inline" style={{ borderColor: 'var(--fl-gold)', color: 'var(--fl-gold)' }}>
                            Did you mean{' '}
                            <button
                                type="button"
                                style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                                onClick={() => { setName(suggestion); setSuggestion(''); }}
                            >
                                "{suggestion}"
                            </button>
                            ?
                        </div>
                    )}
                    {message && <p className="fl-toast-inline fl-toast-ok">{message}</p>}
                    {error && <p className="fl-toast-inline fl-toast-err">{error}</p>}
                </div>

                <div className="fl-fsec">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <h3 className="fl-fsec-ttl" style={{ marginBottom: 0 }}>
                            All Locations ({locations.length})
                        </h3>
                        <input
                            className="fl-fi"
                            style={{ maxWidth: 160, padding: '6px 12px', fontSize: 13 }}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search…"
                        />
                    </div>

                    <div className="fl-chips">
                        {filteredLocations.map((l) => (
                            <span
                                key={l.id}
                                className={`fl-chip${your_locations.includes(l.name) ? ' active' : ''}`}
                            >
                                {l.display_name}
                                {your_locations.includes(l.name) && <span style={{ marginLeft: 4, opacity: 0.6, fontSize: 10 }}>✓</span>}
                            </span>
                        ))}
                    </div>

                    {filteredLocations.length === 0 && search && (
                        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--fl-tx3)', marginTop: 16 }}>
                            No locations match "{search}"
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

PortalLocations.layout = (page: ReactNode) => (
    <PortalLayout title="Locations" showBack>{page}</PortalLayout>
);
