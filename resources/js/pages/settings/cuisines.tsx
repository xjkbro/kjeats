import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { store as cuisinesStoreRoute } from '@/routes/cuisines';
import SettingsLayout from '@/layouts/settings/portal-settings-layout';

interface Props {
    cuisines: Array<{ id: number; name: string; slug: string }>;
    your_cuisines: string[];
}

export default function CuisinesSettings({ cuisines, your_cuisines }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
    });

    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');

    const filteredCuisines = cuisines
        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (!data.name.trim()) return;

        post(cuisinesStoreRoute.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setMessage(`"${data.name}" added to your cuisines!`);
                reset();
                setTimeout(() => setMessage(''), 3000);
            },
        });
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <h3 className="text-sm font-medium dark:text-zinc-200">Add New Cuisine</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Cuisines not in the list? Add them here so they appear in autocomplete suggestions.
                </p>
                <form onSubmit={submit} className="mt-3 flex gap-2">
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Szechuan"
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
                {message && (
                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">{message}</p>
                )}
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium dark:text-zinc-200">All Cuisines ({cuisines.length})</h3>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {your_cuisines.length} used in your reviews
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

                <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
                    {filteredCuisines.map((c) => (
                        <div
                            key={c.id}
                            className={`rounded-md px-3 py-2 text-xs ${
                                your_cuisines.includes(c.name)
                                    ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                                    : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                            }`}
                        >
                            {c.name}
                            {your_cuisines.includes(c.name) && (
                                <span className="ml-1 text-[10px] opacity-60">✓</span>
                            )}
                        </div>
                    ))}
                </div>

                {filteredCuisines.length === 0 && search && (
                    <p className="mt-4 text-center text-xs text-zinc-400">
                        No cuisines match "{search}"
                    </p>
                )}
            </div>
        </div>
    );
}

CuisinesSettings.layout = (page: React.ReactNode) => (
    <SettingsLayout active="cuisines" title="Cuisines">
        {page}
    </SettingsLayout>
);
