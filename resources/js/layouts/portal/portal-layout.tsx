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

function getInitials(firstName: string, lastName?: string | null) {
    const first = (firstName || '')[0] || '';
    const last = (lastName || '')[0] || '';
    return (first + last || first || '?').toUpperCase();
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
        <div className={`fixed inset-0 flex flex-col h-dvh overflow-hidden antialiased kj-overscroll-none bg-[var(--fl-bg)] text-[var(--fl-tx)] font-sans portal-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
            {/* HEADER */}
            <header className="sticky top-0 z-50 shrink-0 backdrop-blur-xl border-b border-[var(--fl-bdr-s)] bg-[var(--fl-bg)]/95 fl-hdr">
                <div className="flex items-center px-3 h-[60px] gap-2">
                    {showBack ? (
                        <>
                            <button className="flex items-center justify-center w-[34px] h-[34px] bg-[var(--fl-s2)] rounded-xl text-[var(--fl-tx)] shrink-0 transition-all duration-100 active:bg-[var(--fl-s3)] active:scale-[.92]" onClick={() => window.history.back()}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            {title && <h1 className="text-[17px] font-bold text-[var(--fl-tx)] tracking-[-.3px] truncate flex-1 min-w-0">{title}</h1>}
                        </>
                    ) : (
                        <>
                            <button className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 bg-[var(--fl-s2)] text-[var(--fl-tx2)] transition-colors duration-100 active:bg-[var(--fl-s3)]" aria-label="Notifications">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                            </button>
                            <button className="flex items-center gap-2 flex-1 h-10 rounded-full bg-[var(--fl-s2)] border border-[var(--fl-bdr-s)] px-3.5 text-sm text-[var(--fl-tx3)] transition-colors duration-100 hover:bg-[var(--fl-s3)] hover:border-[var(--fl-p-lt)] hover:text-[var(--fl-tx)]" onClick={() => setSearchOpen((v) => !v)}>
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <span>Search</span>
                            </button>
                            <button className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 bg-[var(--fl-s2)] text-[var(--fl-tx2)] transition-colors duration-100 active:bg-[var(--fl-s3)]" onClick={() => setAddOpen(true)} aria-label="Add">
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
                                <span className="fl-desk-user-name">{auth.user.first_name}</span>
                                <span className="fl-desk-user-email">{auth.user.email}</span>
                            </div>
                            <div className="fl-desk-avatar">
                                {auth.user.avatar_url ? (
                                    <img src={auth.user.avatar_url} alt={auth.user.first_name} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    getInitials(auth.user.first_name, auth.user.last_name)
                                )}
                            </div>
                        </Link>
                    </div>
                </div>
                {/* Desktop back nav — shows above page content, hidden on mobile */}
                <div className="fl-main-body">
                    {showBack && (
                        <div className="fl-view-nav">
                            <button className="flex items-center justify-center w-[34px] h-[34px] bg-[var(--fl-s2)] rounded-xl text-[var(--fl-tx)] shrink-0 transition-all duration-100 active:bg-[var(--fl-s3)] active:scale-[.92]" onClick={() => window.history.back()}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            {title && <h1 className="text-[17px] font-bold text-[var(--fl-tx)] tracking-[-.3px] truncate fl-desk-page-ttl">{title}</h1>}
                        </div>
                    )}
                    {children}
                </div>
            </main>

            {/* BOTTOM NAV / SIDEBAR */}
            <nav className="fl-nav">
                {/* Logo area (desktop only) */}
                <div className="fl-nav-logo">
                    <Link href={home()} className="flex items-center gap-[7px] fl-brand">
                        <img src="/kjeats-logo.png" alt="kjeats" className="h-[22px] object-contain" />
                    </Link>
                    <span className="hover:cursor-pointer fl-nav-btn inline-block !w-auto" onClick={toggleSidebar} aria-label="Toggle sidebar">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                            {sidebarCollapsed
                                ? <polyline points="9 18 15 12 9 6" />
                                : <polyline points="15 18 9 12 15 6" />}
                        </svg>
                    </span>
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
                <span className="hover:cursor-pointer fl-nav-add fl-nav-btn" onClick={() => setAddOpen(true)} aria-label="Add">
                    <div className="fl-nav-ico">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </div>
                    <span className="fl-nav-label">Add New</span>
                </span>

            </nav>

            {/* Avatar — mobile bottom-right, outside pill */}
            <Link href="/app/profile" className="fl-nav-avatar" aria-label="Profile">
                {auth.user.avatar_url ? (
                    <img src={auth.user.avatar_url} alt={auth.user.first_name} className="h-full w-full rounded-full object-cover" />
                ) : (
                    getInitials(auth.user.first_name, auth.user.last_name)
                )}
            </Link>

            {/* ADD MENU OVERLAY */}
            {addOpen && (
                <div className="fixed inset-0 z-[100] bg-black/68 backdrop-blur-sm flex items-end lg:items-center lg:justify-center kj-anim-fadein" onClick={() => setAddOpen(false)}>
                    <div className="bg-[var(--fl-s2)] border border-[var(--fl-bdr)] rounded-[26px] rounded-b-none lg:rounded-[26px] p-3 pb-7 w-full lg:w-[420px] kj-anim-slideup" onClick={(e) => e.stopPropagation()}>
                        <div className="w-9 h-1 bg-[var(--fl-bdr)] rounded-full mx-auto mb-[18px]" />
                        <h2 className="text-[17px] font-extrabold text-[var(--fl-tx)] mb-4 tracking-[-.3px]">What are you adding?</h2>
                        <Link
                            href={RestaurantController.create().url}
                            className="w-full flex items-center gap-[14px] p-[15px] rounded-[16px] mb-[10px] cursor-pointer text-left border-[1.5px] border-solid border-[var(--fl-p)] bg-[var(--fl-p-dim)] transition-opacity duration-100 active:opacity-75"
                            onClick={() => setAddOpen(false)}
                        >
                            <span className="text-[32px] shrink-0">📍</span>
                            <div className="flex-1">
                                <div className="text-[15px] font-bold text-[var(--fl-tx)]">Restaurant Review</div>
                                <div className="text-xs text-[var(--fl-tx2)] mt-[3px]">Rate dishes &amp; document your experience</div>
                            </div>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="text-[var(--fl-tx3)] shrink-0">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                        <Link
                            href={WantToTryController.create().url}
                            className="w-full flex items-center gap-[14px] p-[15px] rounded-[16px] mb-[10px] cursor-pointer text-left border-[1.5px] border-solid border-[var(--fl-blue)] bg-[var(--fl-blu-d)] transition-opacity duration-100 active:opacity-75"
                            onClick={() => setAddOpen(false)}
                        >
                            <span className="text-[32px] shrink-0">🔖</span>
                            <div className="flex-1">
                                <div className="text-[15px] font-bold text-[var(--fl-tx)]">Want to Try</div>
                                <div className="text-xs text-[var(--fl-tx2)] mt-[3px]">Quick save a restaurant to try later</div>
                            </div>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="text-[var(--fl-tx3)] shrink-0">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                        <Link
                            href={RecipeController.create().url}
                            className="w-full flex items-center gap-[14px] p-[15px] rounded-[16px] mb-[10px] cursor-pointer text-left border-[1.5px] border-solid border-[var(--fl-teal)] bg-[var(--fl-tel-d)] transition-opacity duration-100 active:opacity-75"
                            onClick={() => setAddOpen(false)}
                        >
                            <span className="text-[32px] shrink-0">📋</span>
                            <div className="flex-1">
                                <div className="text-[15px] font-bold text-[var(--fl-tx)]">Recipe</div>
                                <div className="text-xs text-[var(--fl-tx2)] mt-[3px]">Ingredients, steps &amp; nutrition info</div>
                            </div>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="text-[var(--fl-tx3)] shrink-0">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                        <Link
                            href={RestaurantController.index().url + '?revisit=1'}
                            className="w-full flex items-center gap-[14px] p-[15px] rounded-[16px] mb-[10px] cursor-pointer text-left border-[1.5px] border-solid bg-[var(--fl-s3)] border-[var(--fl-bdr)] transition-opacity duration-100 active:opacity-75"
                            onClick={() => setAddOpen(false)}
                        >
                            <span className="text-[32px] shrink-0">🔁</span>
                            <div className="flex-1">
                                <div className="text-[15px] font-bold text-[var(--fl-tx)]">Revisit a Restaurant</div>
                                <div className="text-xs text-[var(--fl-tx2)] mt-[3px]">Add a new visit date, dishes or update your review</div>
                            </div>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="text-[var(--fl-tx3)] shrink-0">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>

                        <button className="w-full p-[13px] bg-[var(--fl-s3)] rounded-xl text-[var(--fl-tx2)] text-sm font-semibold mt-[6px] cursor-pointer active:bg-[var(--fl-s4)]" onClick={() => setAddOpen(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* TOASTS */}
            <div className="fixed bottom-[calc(var(--fl-nav-h)+var(--fl-safe)+10px)] lg:bottom-6 left-3 right-3 lg:left-unset lg:right-6 z-[200] flex flex-col gap-2 pointer-events-none lg:w-[320px]">
                {toasts.map((t) => (
                    <div key={t.id} className={`bg-[var(--fl-s3)] border border-[var(--fl-bdr)] rounded-xl px-[15px] py-[11px] text-sm font-medium text-[var(--fl-tx)] shadow-[var(--fl-sh2)] flex items-center gap-[9px] pointer-events-auto kj-anim-toastin ${t.type === 'ok' ? 'border-l-[3px] border-l-[var(--fl-grn)]' : t.type === 'err' ? 'border-l-[3px] border-l-[var(--fl-red)]' : 'border-l-[3px] border-l-[var(--fl-blue)]'}`}>
                        <span>{t.type === 'ok' ? '✓' : t.type === 'err' ? '✕' : 'ℹ'}</span>
                        {t.message}
                    </div>
                ))}
            </div>
        </div>
    );
}

export { getGreeting };
