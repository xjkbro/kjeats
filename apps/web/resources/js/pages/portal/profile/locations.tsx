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
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <div className="pb-[calc(var(--fl-nav-h)+var(--fl-safe)+80px)] lg:pb-[100px]">
                <div className="mb-6">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">Request a Location</h3>
                    <p className="text-xs text-[var(--fl-tx3)] mb-3 leading-[1.5]">
                        Add a location so it appears in autocomplete. Use "City, State" or "Neighborhood, City, State".
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div className="mb-3 relative" style={{ flex: 1, marginBottom: 0 }}>
                            <input
                                className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none"
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
                            className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)] shrink-0"
                            disabled={submitting || !name.trim()}
                        >
                            {submitting ? 'Adding…' : 'Add'}
                        </button>
                    </form>

                    {suggestion && (
                        <div className="text-sm font-semibold px-[14px] py-[10px] rounded-xl mb-3 bg-[color-mix(in_srgb,var(--fl-gold)_12%,transparent)] text-[var(--fl-gold)] border border-[color-mix(in_srgb,var(--fl-gold)_30%,transparent)] mt-3" style={{ background: 'color-mix(in srgb, var(--fl-gold) 12%, transparent)' }}>
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
                    {message && <div className="text-sm font-semibold px-[14px] py-[10px] rounded-xl mb-3 bg-[color-mix(in_srgb,var(--fl-grn)_12%,transparent)] text-[var(--fl-grn)] border border-[color-mix(in_srgb,var(--fl-grn)_30%,transparent)] mt-3">{message}</div>}
                    {error && <div className="text-sm font-semibold px-[14px] py-[10px] rounded-xl mb-3 bg-[color-mix(in_srgb,var(--fl-red)_12%,transparent)] text-[var(--fl-red)] border border-[color-mix(in_srgb,var(--fl-red)_30%,transparent)] mt-3">{error}</div>}
                </div>

                <div className="mb-6">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2" style={{ marginBottom: 0 }}>
                            All Locations ({locations.length})
                        </h3>
                        <input
                            className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none"
                            style={{ maxWidth: 160, padding: '6px 12px', fontSize: 13 }}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search…"
                        />
                    </div>

                    <div className="flex flex-wrap gap-[6px]">
                        {filteredLocations.map((l) => (
                            <span
                                key={l.id}
                                className={`inline-flex items-center gap-[4px] px-[10px] py-[5px] rounded-full text-[12px] font-semibold tracking-[-.1px] bg-[var(--fl-s2)] text-[var(--fl-tx2)] border border-[var(--fl-bdr-s)]${your_locations.includes(l.name) ? ' bg-[var(--fl-p-dim)] text-[var(--fl-p-lt)] border-[var(--fl-p)]' : ''}`}
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
