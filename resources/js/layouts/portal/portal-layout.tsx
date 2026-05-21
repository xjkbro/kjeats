import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import * as RecipeController from '@/actions/App/Http/Controllers/RecipeController';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import * as WantToTryController from '@/actions/App/Http/Controllers/WantToTryController';
import SearchPalette from '@/components/search-palette';
import { dashboard, home } from '@/routes';

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
    const auth = props.auth as { user: { name: string; email: string; avatar_url?: string | null } };
    const flash = props.flash as { type?: string; message?: string } | undefined;

    const [searchOpen, setSearchOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        try {
            return localStorage.getItem('sidebar-collapsed') === '1';
        } catch {
            return false;
        }
    });
    const [toasts, setToasts] = useState<Array<{ id: number; type: string; message: string }>>([])
    const searchRef = useRef<HTMLInputElement>(null);
    const toastId = useRef(0);

    function toggleSidebar() {
        setSidebarCollapsed((v) => {
            const next = !v;

            try {
                localStorage.setItem('sidebar-collapsed', next ? '1' : '0');
            } catch {
                // ignore
            }

            return next;
        });
    }

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

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen((v) => !v);
            }

            if (e.key === 'Escape') {
                setSearchOpen(false);
            }
        }
        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className={`portal-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
            {/* HEADER */}
            <header className="fl-hdr">
                <div className="fl-hdr-row">
                    {showBack ? (
                        <>
                            <button className="fl-back-btn" onClick={() => window.history.back()}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            {title && <h1 className="fl-page-ttl" style={{ flex: 1, minWidth: 0 }}>{title}</h1>}
                        </>
                    ) : (
                        <>
                            <button className="fl-hdr-bell" aria-label="Notifications">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                            </button>
                            <button className="fl-hdr-search" onClick={() => setSearchOpen((v) => !v)}>
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <span>Search</span>
                            </button>
                            <button className="fl-hdr-add" onClick={() => setAddOpen(true)} aria-label="Add">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </header>

            <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

            {/* MAIN */}
            <main className="fl-main">
                {/* Desktop top bar (hidden on mobile) */}
                <div className="fl-desk-bar">
                    <button className="fl-desk-search" onClick={() => setSearchOpen((v) => !v)}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <span>Search</span>
                        <kbd>⌘K</kbd>
                    </button>
                    <div className="fl-desk-bar-r">
                        <button className="fl-desk-bell" aria-label="Notifications">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </button>
                        <Link href="/app/profile" className="fl-desk-user">
                            <div className="fl-desk-user-info">
                                <span className="fl-desk-user-name">{auth.user.name.split(' ')[0]}</span>
                                <span className="fl-desk-user-email">{auth.user.email}</span>
                            </div>
                            <div className="fl-desk-avatar">
                                {auth.user.avatar_url ? (
                                    <img src={auth.user.avatar_url} alt={auth.user.name} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    getInitials(auth.user.name)
                                )}
                            </div>
                        </Link>
                    </div>
                </div>
                {/* Desktop back nav — shows above page content, hidden on mobile */}
                <div className="fl-main-body">
                    {showBack && (
                        <div className="fl-view-nav">
                            <button className="fl-back-btn" onClick={() => window.history.back()}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            {title && <h1 className="fl-desk-page-ttl">{title}</h1>}
                        </div>
                    )}
                    {children}
                </div>
            </main>

            {/* BOTTOM NAV / SIDEBAR */}
            <nav className="fl-nav">
                {/* Logo area (desktop only) */}
                <div className="fl-nav-logo">
                    <Link href={home()} className="fl-brand">
                        <img src="/kjeats-logo.png" alt="kjeats" style={{ height: '22px', objectFit: 'contain' }} />
                    </Link>
                </div>

                <Link href={dashboard()} className={`fl-nav-btn${isActive('/dashboard') ? ' active' : ''}`}>
                    <div className="fl-nav-ico">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="7" height="9" rx="1" />
                            <rect x="14" y="3" width="7" height="5" rx="1" />
                            <rect x="14" y="12" width="7" height="9" rx="1" />
                            <rect x="3" y="16" width="7" height="5" rx="1" />
                        </svg>
                    </div>
                    <span className="fl-nav-label">Home</span>
                </Link>

                <Link href={RestaurantController.index().url} className={`fl-nav-btn${isActive('/restaurants') ? ' active' : ''}`}>
                    <div className="fl-nav-ico">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                            <path d="M7 2v20" />
                            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                        </svg>
                    </div>
                    <span className="fl-nav-label">Reviews</span>
                </Link>

                <Link href={RecipeController.index().url} className={`fl-nav-btn${isActive('/recipes') ? ' active' : ''}`}>
                    <div className="fl-nav-ico">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                            <line x1="9" y1="17" x2="15" y2="17" />
                        </svg>
                    </div>
                    <span className="fl-nav-label">Recipes</span>
                </Link>

                <Link href={WantToTryController.index().url} className={`fl-nav-btn${isActive('/want-to-try') ? ' active' : ''}`}>
                    <div className="fl-nav-ico">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <span className="fl-nav-label">Saved</span>
                </Link>

                {/* + Add button (desktop sidebar only) */}
                <button className="fl-nav-btn fl-nav-add" onClick={() => setAddOpen(true)} aria-label="Add">
                    <div className="fl-nav-ico">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </div>
                    <span className="fl-nav-label">Add New</span>
                </button>
                <button className="fl-nav-collapse" onClick={toggleSidebar} aria-label="Toggle sidebar">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                        {sidebarCollapsed
                            ? <polyline points="9 18 15 12 9 6" />
                            : <polyline points="15 18 9 12 15 6" />}
                    </svg>
                </button>
            </nav>

            {/* Avatar — mobile bottom-right, outside pill */}
            <Link href="/app/profile" className="fl-nav-avatar" aria-label="Profile">
                {auth.user.avatar_url ? (
                    <img src={auth.user.avatar_url} alt={auth.user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                    getInitials(auth.user.name)
                )}
            </Link>

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
                            href={WantToTryController.create().url}
                            className="fl-sheet-opt fl-opt-want"
                            onClick={() => setAddOpen(false)}
                        >
                            <span className="fl-opt-ico">🔖</span>
                            <div>
                                <div className="fl-opt-label">Want to Try</div>
                                <div className="fl-opt-desc">Quick save a restaurant to try later</div>
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
                            href={RestaurantController.index().url + '?revisit=1'}
                            className="fl-sheet-opt"
                            style={{ background: 'var(--fl-s3)', borderColor: 'var(--fl-bdr)' }}
                            onClick={() => setAddOpen(false)}
                        >
                            <span className="fl-opt-ico">🔁</span>
                            <div>
                                <div className="fl-opt-label">Revisit a Restaurant</div>
                                <div className="fl-opt-desc">Add a new visit date, dishes or update your review</div>
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
