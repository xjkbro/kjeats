import { useState } from 'react';
import type { ReactNode } from 'react';
import * as CuisineController from '@/actions/App/Http/Controllers/CuisineController';
import PortalLayout from '@/layouts/portal/portal-layout';

interface Props {
    cuisines: Array<{ id: number; name: string; slug: string }>;
    your_cuisines: string[];
}

export default function PortalCuisines({ cuisines: initialCuisines, your_cuisines }: Props) {
    const [cuisines, setCuisines] = useState(initialCuisines);
    const [name, setName] = useState('');
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const filteredCuisines = cuisines
        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || submitting) return;
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch(CuisineController.store().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ name: name.trim() }),
            });

            const json = await res.json();

            if (!res.ok) {
                setError(json.message ?? 'Failed to add cuisine.');
            } else {
                const newName: string = json.name;
                if (!cuisines.find((c) => c.name === newName)) {
                    setCuisines((prev) => [...prev, { id: Date.now(), name: newName, slug: newName.toLowerCase() }]);
                }
                setMessage(json.created ? `"${newName}" added!` : `"${newName}" already exists.`);
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
                    <h3 className="fl-fsec-ttl">Request a Cuisine</h3>
                    <p className="fl-fsec-sub">
                        Don't see a cuisine in autocomplete? Add it here so it appears in suggestions.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div className="fl-fgrp" style={{ flex: 1 }}>
                            <input
                                className="fl-fi"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Szechuan"
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

                    {message && <p className="fl-toast-inline fl-toast-ok">{message}</p>}
                    {error && <p className="fl-toast-inline fl-toast-err">{error}</p>}
                </div>

                <div className="fl-fsec">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <h3 className="fl-fsec-ttl" style={{ marginBottom: 0 }}>
                            All Cuisines ({cuisines.length})
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {filteredCuisines.map((c) => (
                            <div
                                key={c.id}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 12px', borderRadius: 'var(--fl-r2)',
                                    background: your_cuisines.includes(c.name) ? 'var(--fl-p-dim)' : 'var(--fl-s2)',
                                    color: your_cuisines.includes(c.name) ? 'var(--fl-p-lt)' : 'var(--fl-tx2)',
                                    fontSize: 14,
                                }}
                            >
                                <span>{c.name}</span>
                                {your_cuisines.includes(c.name) && (
                                    <span style={{ fontSize: 11, opacity: 0.7 }}>used ✓</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {filteredCuisines.length === 0 && search && (
                        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--fl-tx3)', marginTop: 16 }}>
                            No cuisines match "{search}"
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

PortalCuisines.layout = (page: ReactNode) => (
    <PortalLayout title="Cuisines" showBack>{page}</PortalLayout>
);
