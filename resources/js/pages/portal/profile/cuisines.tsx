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
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <div className="pb-[calc(var(--fl-nav-h)+var(--fl-safe)+80px)] lg:pb-[100px]">
                <div className="mb-6">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">Request a Cuisine</h3>
                    <p className="text-xs text-[var(--fl-tx3)] mb-3 leading-[1.5]">
                        Don't see a cuisine in autocomplete? Add it here so it appears in suggestions.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div className="mb-3 relative" style={{ flex: 1, marginBottom: 0 }}>
                            <input
                                className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Szechuan"
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

                    {message && <div className="text-sm font-semibold px-[14px] py-[10px] rounded-xl mb-3 bg-[color-mix(in_srgb,var(--fl-grn)_12%,transparent)] text-[var(--fl-grn)] border border-[color-mix(in_srgb,var(--fl-grn)_30%,transparent)] mt-3">{message}</div>}
                    {error && <div className="text-sm font-semibold px-[14px] py-[10px] rounded-xl mb-3 bg-[color-mix(in_srgb,var(--fl-red)_12%,transparent)] text-[var(--fl-red)] border border-[color-mix(in_srgb,var(--fl-red)_30%,transparent)] mt-3">{error}</div>}
                </div>

                <div className="mb-6">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2" style={{ marginBottom: 0 }}>
                            All Cuisines ({cuisines.length})
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {filteredCuisines.map((c) => (
                            <div
                                key={c.id}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 12px', borderRadius: '12px',
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
