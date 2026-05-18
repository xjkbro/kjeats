import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { search } from '@/routes';

interface SearchResult {
    type: 'restaurant' | 'recipe' | 'dish';
    id: number;
    emoji: string;
    title: string;
    subtitle: string;
    url: string;
}

export default function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();
    const prevOpenRef = useRef(false);

    useEffect(() => {
        if (open && !prevOpenRef.current) {
            inputRef.current?.focus();
        }

        prevOpenRef.current = open;
    }, [open]);

    function triggerSearch(q: string) {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (q.length < 1) {
            setResults([]);
            setLoading(false);

            return;
        }

        setLoading(true);
        timerRef.current = setTimeout(async () => {
            try {
                const xsrfToken = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1];

                const res = await fetch(search.url() + '?q=' + encodeURIComponent(q), {
                    headers: {
                        Accept: 'application/json',
                        'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                    },
                });

                const json = await res.json();
                setResults(json.results ?? []);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 200);
    }

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    function handleInputChange(value: string) {
        setQuery(value);
        setSelectedIdx(-1);
        triggerSearch(value);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIdx((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIdx((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        } else if (e.key === 'Enter' && selectedIdx >= 0 && results[selectedIdx]) {
            navigate(results[selectedIdx]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    }

    function navigate(result: SearchResult) {
        onClose();

        router.visit(result.url);
    }

    const grouped = results.reduce(
        (acc, r) => {
            if (!acc[r.type]) {
                acc[r.type] = [];
            }

            acc[r.type].push(r);

            return acc;
        },
        {} as Record<string, SearchResult[]>,
    );

    const labels: Record<string, string> = {
        restaurant: 'Restaurants',
        recipe: 'Recipes',
        dish: 'Dishes',
    };

    return (
        <>
            {open && <div className="fl-sp-overlay" onClick={onClose} />}
            <div className={`fl-sp${open ? ' open' : ''}`} role="dialog" aria-modal="true">
                <div className="fl-sp-input-row">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search restaurants, recipes, dishes…"
                        value={query}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <kbd>ESC</kbd>
                </div>

                {loading && (
                    <div className="fl-sp-status">Searching…</div>
                )}

                {!loading && query.length > 0 && results.length === 0 && (
                    <div className="fl-sp-empty">No results found</div>
                )}

                {!loading && results.length > 0 && (
                    <div className="fl-sp-results">
                        {Object.entries(grouped).map(([type, items]) => (
                            <div key={type} className="fl-sp-group">
                                <div className="fl-sp-group-label">{labels[type] ?? type}</div>
                                {items.map((item) => {
                                    const globalIdx = results.indexOf(item);

                                    return (
                                        <button
                                            key={`${item.type}-${item.id}`}
                                            className={`fl-sp-item${selectedIdx === globalIdx ? ' sel' : ''}`}
                                            onClick={() => navigate(item)}
                                            onMouseEnter={() => setSelectedIdx(globalIdx)}
                                        >
                                            <span className="fl-sp-item-emoji">{item.emoji}</span>
                                            <div className="fl-sp-item-body">
                                                <div className="fl-sp-item-title">{item.title}</div>
                                                <div className="fl-sp-item-sub">{item.subtitle}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}

                <div className="fl-sp-footer">
                    <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                    <span><kbd>Enter</kbd> open</span>
                    <span><kbd>Esc</kbd> close</span>
                </div>
            </div>
        </>
    );
}
