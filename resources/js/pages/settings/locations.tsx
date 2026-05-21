import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import SettingsLayout from '@/layouts/settings/portal-settings-layout';
import { store as locationsStoreRoute } from '@/routes/locations';

interface Props {
    locations: Array<{ id: number; name: string; display_name: string }>;
    your_locations: string[];
}

export default function LocationsSettings({ locations, your_locations }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
    });

    const [message, setMessage] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [search, setSearch] = useState('');

    const filteredLocations = locations
        .filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.display_name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.display_name.localeCompare(b.display_name));

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (!data.name.trim()) {
return;
}

        post(locationsStoreRoute.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setMessage(`"${data.name}" added!`);
                setSuggestion('');
                reset();
                setTimeout(() => setMessage(''), 3000);
            },
            onError: (errors) => {
                if (errors.name) {
                    const parsed = JSON.parse(errors.name ?? '{}');

                    if (parsed.suggestion) {
                        setSuggestion(parsed.suggestion);
                    }
                }
            },
        });
    }

    function acceptSuggestion() {
        if (suggestion) {
            setData('name', suggestion);
            setSuggestion('');
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <h3 className="text-sm font-medium dark:text-zinc-200">Add New Location</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Add a location so it appears in autocomplete suggestions. Use the format "City, State" or "Neighborhood, City, State".
                </p>
                <form onSubmit={submit} className="mt-3 flex gap-2">
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => {
                            setData('name', e.target.value);
                            setSuggestion('');
                        }}
                        placeholder="e.g. Las Vegas, NV"
                        className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                    />
                    <button
                        type="submit"
                        disabled={processing || !data.name.trim()}
                        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        {processing ? 'Adding...' : 'Add'}
                    </button>
                </form>
                {suggestion && (
                    <div className="mt-2 rounded-md border border-orange-200 bg-orange-50 p-2 dark:border-orange-800 dark:bg-orange-900/20">
                        <p className="text-xs text-orange-700 dark:text-orange-300">
                            Did you mean <button type="button" className="underline" onClick={acceptSuggestion}>"{suggestion}"</button>?
                        </p>
                    </div>
                )}
                {message && (
                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">{message}</p>
                )}
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium dark:text-zinc-200">All Locations ({locations.length})</h3>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {your_locations.length} used in your reviews
                        </p>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-48 rounded-md border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                    />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3">
                    {filteredLocations.map((l) => (
                        <div
                            key={l.id}
                            className={`rounded-md px-3 py-2 text-xs ${
                                your_locations.includes(l.name)
                                    ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                                    : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                            }`}
                        >
                            <span className="font-medium">{l.display_name}</span>
                            {l.display_name !== l.name && (
                                <span className="ml-1 opacity-60">— {l.name}</span>
                            )}
                            {your_locations.includes(l.name) && (
                                <span className="ml-1 text-[10px] opacity-60">✓</span>
                            )}
                        </div>
                    ))}
                </div>

                {filteredLocations.length === 0 && search && (
                    <p className="mt-4 text-center text-xs text-zinc-400">
                        No locations match "{search}"
                    </p>
                )}
            </div>
        </div>
    );
}

LocationsSettings.layout = (page: React.ReactNode) => (
    <SettingsLayout active="locations" title="Locations">
        {page}
    </SettingsLayout>
);
