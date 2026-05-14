import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import * as GroupController from '@/actions/App/Http/Controllers/GroupController';
import * as RecipeController from '@/actions/App/Http/Controllers/RecipeController';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import { dashboard } from '@/routes';

interface Props {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
}

function getGreeting() {
    const h = new Date().getHours();

    return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function PortalLayout({ children, title, showBack = false }: Props) {
    const { url, props } = usePage();
    const auth = props.auth as { user: { name: string; email: string } };
    const flash = props.flash as { type?: string; message?: string } | undefined;

    const [searchOpen, setSearchOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [toasts, setToasts] = useState<Array<{ id: number; type: string; message: string }>>([]);
    const searchRef = useRef<HTMLInputElement>(null);
    const toastId = useRef(0);

    const isActive = (path: string) => url.startsWith(path);

    const addToast = (message: string, type = 'inf') => {
        const id = ++toastId.current;
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
    };

    useEffect(() => {
        if (flash?.message) {
            addToast(flash.message, flash.type ?? 'inf');
        }
    }, [flash]);

    useEffect(() => {
        if (searchOpen) {
            searchRef.current?.focus();
        }
    }, [searchOpen]);

    return (
        <div className="portal-shell">
            {/* HEADER */}
            <header className="fl-hdr">
                <div className="fl-hdr-row">
                    <div className="fl-hdr-l">
                        {showBack ? (
                            <button className="fl-back-btn" onClick={() => window.history.back()}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                        ) : (
                            <Link href={dashboard()} className="fl-brand">
                                <img src="/kjeats-logo.png" alt="kjeats" style={{ height: '22px', objectFit: 'contain' }} />
                            </Link>
                        )}
                        {title && !showBack && null}
                        {title && showBack && <h1 className="fl-page-ttl">{title}</h1>}
                    </div>
                    <div className="fl-hdr-r">
                        {!showBack && (
                            <button className="fl-hdr-btn" onClick={() => setSearchOpen((v) => !v)}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </button>
                        )}
                        <Link href="/profile" className="fl-avatar">
                            {getInitials(auth.user.name)}
                        </Link>
                    </div>
                </div>
                {searchOpen && (
                    <div className="fl-srch-bar">
                        <div className="fl-srch-inner">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input ref={searchRef} type="text" placeholder="Search restaurants or recipes…" />
                            <button onClick={() => setSearchOpen(false)}>
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* MAIN */}
            <main className="fl-main">{children}</main>

            {/* BOTTOM NAV */}
            <nav className="fl-nav">
                <Link href={dashboard()} className={`fl-nav-btn${isActive('/dashboard') ? ' active' : ''}`}>
                    <div className="fl-nav-ico">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="7" height="9" rx="1" />
                            <rect x="14" y="3" width="7" height="5" rx="1" />
                            <rect x="14" y="12" width="7" height="9" rx="1" />
                            <rect x="3" y="16" width="7" height="5" rx="1" />
                        </svg>
                    </div>
                    <span>Home</span>
                </Link>

                <Link href={RestaurantController.index().url} className={`fl-nav-btn${isActive('/restaurants') ? ' active' : ''}`}>
                    <div className="fl-nav-ico">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                            <path d="M7 2v20" />
                            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                        </svg>
                    </div>
                    <span>Reviews</span>
                </Link>

                <button className="fl-nav-btn fl-nav-add" onClick={() => setAddOpen(true)}>
                    <div className="fl-nav-add-ring">
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </div>
                    <span>Add</span>
                </button>

                <Link href={RecipeController.index().url} className={`fl-nav-btn${isActive('/recipes') ? ' active' : ''}`}>
                    <div className="fl-nav-ico">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                            <line x1="9" y1="17" x2="15" y2="17" />
                        </svg>
                    </div>
                    <span>Recipes</span>
                </Link>

                <Link href={GroupController.index().url} className={`fl-nav-btn${isActive('/groups') ? ' active' : ''}`}>
                    <div className="fl-nav-ico">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <span>Groups</span>
                </Link>
            </nav>

            {/* ADD MENU OVERLAY */}
            {addOpen && (
                <div className="fl-overlay" onClick={() => setAddOpen(false)}>
                    <div className="fl-sheet" onClick={(e) => e.stopPropagation()}>
                        <div className="fl-sheet-grip" />
                        <h2 className="fl-sheet-ttl">What are you adding?</h2>
                        <Link
                            href={RestaurantController.create().url}
                            className="fl-sheet-opt fl-opt-rest"
                            onClick={() => setAddOpen(false)}
                        >
                            <span className="fl-opt-ico">📍</span>
                            <div>
                                <div className="fl-opt-label">Restaurant Review</div>
                                <div className="fl-opt-desc">Rate dishes &amp; document your experience</div>
                            </div>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                        <Link
                            href={RecipeController.create().url}
                            className="fl-sheet-opt fl-opt-recipe"
                            onClick={() => setAddOpen(false)}
                        >
                            <span className="fl-opt-ico">📋</span>
                            <div>
                                <div className="fl-opt-label">Recipe</div>
                                <div className="fl-opt-desc">Ingredients, steps &amp; nutrition info</div>
                            </div>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                        <Link
                            href={GroupController.create().url}
                            className="fl-sheet-opt"
                            onClick={() => setAddOpen(false)}
                        >
                            <span className="fl-opt-ico">👥</span>
                            <div>
                                <div className="fl-opt-label">New Group</div>
                                <div className="fl-opt-desc">Collaborate with friends &amp; family</div>
                            </div>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                        <button className="fl-sheet-cancel" onClick={() => setAddOpen(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* TOASTS */}
            <div className="fl-toasts">
                {toasts.map((t) => (
                    <div key={t.id} className={`fl-toast ${t.type}`}>
                        <span>{t.type === 'ok' ? '✓' : t.type === 'err' ? '✕' : 'ℹ'}</span>
                        {t.message}
                    </div>
                ))}
            </div>
        </div>
    );
}

export { getGreeting };
