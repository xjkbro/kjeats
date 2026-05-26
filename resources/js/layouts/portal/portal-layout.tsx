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

type NavLink = {
    href: string | object;
    label: string;
    path: string;
    icon: string;
};

const navLinks: NavLink[] = [
    { href: dashboard(), label: 'Home', path: '/dashboard', icon: 'grid' },
    { href: RestaurantController.index().url, label: 'Reviews', path: '/restaurants', icon: 'utensils' },
    { href: RecipeController.index().url, label: 'Recipes', path: '/recipes', icon: 'file' },
    { href: WantToTryController.index().url, label: 'Saved', path: '/want-to-try', icon: 'bookmark' },
];

export default function PortalLayout({ children, title, showBack = false }: Props) {
    const { url, props } = usePage();
    const auth = props.auth as { user: {
        first_name: ReactNode;
        last_name(first_name: any, last_name: any): import("react").ReactNode; name: string; email: string; avatar_url?: string | null
} };
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
        <div className="fixed inset-0 flex flex-col h-dvh overflow-hidden overscroll-none antialiased bg-[var(--fl-bg)] text-[var(--fl-tx)] font-sans">
            {/* HEADER — mobile only */}
            <header className="lg:hidden sticky top-0 z-50 shrink-0 backdrop-blur-xl border-b border-[var(--fl-bdr-s)] bg-[var(--fl-bg)]/95">
                <div className="flex items-center px-3 h-[60px] gap-2">
                    {showBack ? (
                        <>
                            <button className="flex items-center justify-center w-[34px] h-[34px] bg-[var(--fl-s2)] rounded-xl text-[var(--fl-tx)] shrink-0 transition-all duration-100 active:scale-[.92]" onClick={() => window.history.back()}>
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

            {/* Grid wrapper: sidebar + main — nav first, main second */}
            <div className={`flex flex-col flex-1 min-h-0 lg:grid lg:grid-rows-1 lg:p-[var(--fl-desk-gap)] lg:gap-[var(--fl-desk-gap)] lg:transition-[grid-template-columns] lg:duration-200 lg:ease-in-out${sidebarCollapsed ? ' lg:grid-cols-[var(--fl-sidebar-collapsed-w)_1fr]' : ' lg:grid-cols-[var(--fl-sidebar-w)_1fr]'}`}>

            {/* SIDEBAR / NAV */}
            <nav className="
                fixed bottom-[calc(var(--fl-safe)+16px)] left-4 right-16 w-auto p-1
                bg-[rgba(13,14,22,.9)] backdrop-blur-[24px]
                border border-[rgba(255,255,255,.08)] rounded-full
                flex items-center justify-around z-50
                shadow-[0_4px_24px_rgba(0,0,0,.5)]
                lg:static lg:flex-col lg:justify-start lg:items-stretch
                lg:w-full lg:h-full lg:p-0 lg:pb-3
                lg:bg-[rgba(19,20,30,.85)] lg:backdrop-blur-[24px]
                lg:border lg:border-[rgba(255,255,255,.06)] lg:rounded-[var(--fl-r6)]
                lg:shadow-[0_8px_32px_rgba(0,0,0,.45)]
                lg:overflow-y-auto lg:overflow-x-hidden lg:gap-0.5
                lg:[scrollbar-width:none]
            ">
                {/* Logo area (desktop only) */}
                <div className={`hidden lg:flex lg:items-center lg:h-16 lg:mb-1.5 lg:shrink-0 lg:overflow-hidden lg:border-b lg:border-[rgba(255,255,255,.05)]${sidebarCollapsed ? ' lg:justify-center lg:px-0' : ' lg:justify-between lg:px-3'}`}>
                    <Link href={home()} className={`flex items-center gap-[7px]${sidebarCollapsed ? ' lg:hidden' : ''}`}>
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--fl-p)] to-[var(--fl-gold)] flex items-center justify-center shrink-0">
                            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <img src="/kjeats-logo.png" alt="kjeats" className={`h-[22px] object-contain shrink-0${sidebarCollapsed ? ' lg:hidden' : ''}`} />
                    </Link>
                    <span className="hover:cursor-pointer flex flex-col items-center justify-center flex-none w-[52px] h-11 text-[rgba(255,255,255,.4)] rounded-full p-0 transition-colors duration-100 lg:flex lg:flex-row lg:justify-start lg:items-center lg:gap-[11px] lg:w-auto lg:h-auto lg:px-4 lg:py-3 lg:rounded-[var(--fl-r3)] lg:text-xs lg:font-semibold lg:text-[var(--fl-tx3)] lg:overflow-hidden lg:hover:bg-[rgba(255,255,255,.05)] lg:hover:text-[var(--fl-tx)]" onClick={toggleSidebar} aria-label="Toggle sidebar">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                            {sidebarCollapsed
                                ? <polyline points="9 18 15 12 9 6" />
                                : <polyline points="15 18 9 12 15 6" />}
                        </svg>
                    </span>
                </div>

                {navLinks.map(({ href, label, path, icon }) => {
                    const active = isActive(path);

                    return (
                        <Link key={path} href={href} className={[
                            'text-[rgba(255,255,255,.4)]',
                            'flex flex-col items-center justify-center flex-none w-[52px] h-11 rounded-full p-0 transition-all duration-150',
                            'lg:flex lg:flex-row lg:justify-start lg:items-center lg:gap-3 lg:w-full lg:h-auto lg:px-4 lg:py-2.5 lg:rounded-[var(--fl-r3)] lg:text-xs lg:font-semibold lg:overflow-hidden lg:transition-all lg:duration-150',
                            active
                                ? 'text-[var(--fl-p-lt)] lg:bg-[var(--fl-p-dim)] lg:text-[var(--fl-p-lt)] lg:shadow-[inset_3px_0_0_var(--fl-p),inset_0_0_0_1px_rgba(255,96,64,.15)]'
                                : 'lg:text-[var(--fl-tx3)] lg:hover:bg-[rgba(255,255,255,.05)] lg:hover:text-[var(--fl-tx)]',
                        ].join(' ')}>
                            <div className={[
                                'w-11 h-11 flex items-center justify-center rounded-full transition-all duration-150 shrink-0',
                                active ? 'bg-[rgba(255,96,64,.22)] shadow-[inset_0_0_0_1.5px_rgba(255,96,64,.25)]' : '',
                                'lg:w-5 lg:h-5 lg:rounded-none lg:bg-none lg:shadow-none',
                            ].join(' ')}>
                                {icon === 'grid' && (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="lg:w-[18px] lg:h-[18px]">
                                        <rect x="3" y="3" width="7" height="9" rx="1" />
                                        <rect x="14" y="3" width="7" height="5" rx="1" />
                                        <rect x="14" y="12" width="7" height="9" rx="1" />
                                        <rect x="3" y="16" width="7" height="5" rx="1" />
                                    </svg>
                                )}
                                {icon === 'utensils' && (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="lg:w-[18px] lg:h-[18px]">
                                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                                        <path d="M7 2v20" />
                                        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                                    </svg>
                                )}
                                {icon === 'file' && (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="lg:w-[18px] lg:h-[18px]">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="9" y1="13" x2="15" y2="13" />
                                        <line x1="9" y1="17" x2="15" y2="17" />
                                    </svg>
                                )}
                                {icon === 'bookmark' && (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="lg:w-[18px] lg:h-[18px]">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                    </svg>
                                )}
                            </div>
                            <span className={`hidden lg:block lg:whitespace-nowrap lg:overflow-hidden lg:transition-[opacity,width] lg:duration-200 lg:ease-in-out${sidebarCollapsed ? ' lg:opacity-0 lg:w-0' : ''}`}>{label}</span>
                        </Link>
                    );
                })}

                {/* + Add button (desktop sidebar only) */}
                <span className="hover:cursor-pointer flex flex-col items-center justify-center flex-none w-[52px] h-11 rounded-full p-0 transition-colors duration-100 lg:flex lg:flex-row lg:justify-start lg:items-center lg:gap-3 lg:w-full lg:h-auto lg:px-4 lg:py-2.5 lg:rounded-[var(--fl-r3)] lg:text-xs lg:font-semibold lg:overflow-hidden lg:text-[var(--fl-p-lt)] lg:bg-[var(--fl-p-dim)] lg:border-[1.5px] lg:border-dashed lg:border-[rgba(255,96,64,.35)] lg:mt-2 lg:hover:bg-[var(--fl-p-dmh)]" onClick={() => setAddOpen(true)} aria-label="Add">
                    <div className="w-11 h-11 flex items-center justify-center rounded-full transition-colors duration-100 shrink-0 lg:w-5 lg:h-5 lg:rounded-none lg:bg-none lg:shadow-none">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" className="lg:w-[18px] lg:h-[18px]">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </div>
                    <span className="hidden lg:block lg:whitespace-nowrap lg:overflow-hidden">Add New</span>
                </span>
            </nav>

            {/* MAIN */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[calc(var(--fl-nav-h)+var(--fl-safe)+20px)] [-webkit-overflow-scrolling:touch] lg:flex lg:flex-col lg:overflow-hidden lg:h-full lg:pb-0 lg:bg-[rgba(19,20,30,.75)] lg:backdrop-blur-[20px] lg:border lg:border-[rgba(255,255,255,.05)] lg:rounded-[var(--fl-r6)] lg:shadow-[0_8px_32px_rgba(0,0,0,.35)]">
                {/* Desktop top bar */}
                <div className="hidden lg:flex lg:items-center lg:gap-3 lg:px-5 lg:h-16 lg:shrink-0 lg:border-b lg:border-[rgba(255,255,255,.05)]">
                    <button className="flex-1 h-[38px] rounded-full bg-[#2a2d42] border-[1.5px] border-[#4a4e70] flex items-center gap-[9px] px-4 text-[var(--fl-tx2)] text-xs transition-all duration-150 hover:bg-[#363a55] hover:border-[var(--fl-p-lt)] hover:text-[var(--fl-tx)] hover:shadow-[0_0_20px_rgba(255,96,64,.12)] max-w-[420px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.02)]" onClick={() => setSearchOpen((v) => !v)}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="shrink-0">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <span>Search restaurants, recipes...</span>
                        <kbd className="text-[10px] text-[var(--fl-tx3)] bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.1)] rounded-[5px] px-[5px] py-[1px] shrink-0 ml-auto">⌘K</kbd>
                    </button>
                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                        <button className="flex items-center justify-center w-9 h-9 rounded-full bg-[rgba(255,255,255,.04)] text-[var(--fl-tx2)] border border-[rgba(255,255,255,.06)] transition-all duration-150 hover:bg-[rgba(255,255,255,.08)] hover:text-[var(--fl-tx)] hover:border-[rgba(255,255,255,.1)] active:scale-[.92]" aria-label="Notifications">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </button>
                        <Link href="/app/profile" className="flex items-center gap-[10px] pl-[14px] pr-[10px] py-[5px] rounded-full bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.06)] transition-all duration-150 hover:bg-[rgba(255,255,255,.08)] hover:border-[rgba(255,255,255,.1)] active:scale-[.97] no-underline">
                            <div className="flex flex-col items-end gap-px">
                                <span className="text-xs font-semibold text-[var(--fl-tx)] leading-[1.2]">{auth.user.first_name}</span>
                                <span className="text-[11px] text-[var(--fl-tx3)] leading-[1.2]">{auth.user.email}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full shrink-0 bg-gradient-to-br from-[var(--fl-p)] to-[var(--fl-gold)] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-[rgba(255,255,255,.08)]">
                                {auth.user.avatar_url ? (
                                    <img src={auth.user.avatar_url} alt={auth.user.first_name} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    getInitials(auth.user.first_name, auth.user.last_name)
                                )}
                            </div>
                        </Link>
                    </div>
                </div>
                {/* Scrollable content */}
                <div className="lg:overflow-y-auto lg:flex-1 lg:min-h-0">
                    {showBack && (
                        <div className="hidden lg:flex lg:items-center lg:gap-[10px] lg:pt-5 lg:px-7">
                            <button className="flex items-center justify-center w-[34px] h-[34px] bg-[var(--fl-s2)] rounded-xl text-[var(--fl-tx)] shrink-0 transition-all duration-100 active:scale-[.92]" onClick={() => window.history.back()}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            {title && <h1 className="text-[17px] font-bold text-[var(--fl-tx)] tracking-[-.3px] truncate">{title}</h1>}
                        </div>
                    )}
                    {children}
                </div>
            </main>

            </div>

            {/* Avatar — mobile only */}
            <Link href="/app/profile" className="lg:hidden fixed bottom-[calc(var(--fl-safe)+16px)] right-4 w-[52px] h-[52px] rounded-full shrink-0 bg-gradient-to-br from-[var(--fl-p)] to-[var(--fl-gold)] text-white text-[13px] font-bold flex items-center justify-center border-2 border-[rgba(255,255,255,.12)] z-50 transition-transform duration-100 active:scale-[.92]" aria-label="Profile">
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
                            className="w-full flex items-center gap-[14px] p-[15px] rounded-[16px] mb-[10px] cursor-pointer text-left border-[1.5px] border-solid border-[var(--fl-p)] bg-[var(--fl-p-dim)] transition-all duration-100 active:scale-[.98] active:opacity-75"
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
                            className="w-full flex items-center gap-[14px] p-[15px] rounded-[16px] mb-[10px] cursor-pointer text-left border-[1.5px] border-solid border-[var(--fl-blue)] bg-[var(--fl-blu-d)] transition-all duration-100 active:scale-[.98] active:opacity-75"
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
                            className="w-full flex items-center gap-[14px] p-[15px] rounded-[16px] mb-[10px] cursor-pointer text-left border-[1.5px] border-solid border-[var(--fl-teal)] bg-[var(--fl-tel-d)] transition-all duration-100 active:scale-[.98] active:opacity-75"
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
                            className="w-full flex items-center gap-[14px] p-[15px] rounded-[16px] mb-[10px] cursor-pointer text-left border-[1.5px] border-solid bg-[var(--fl-s3)] border-[var(--fl-bdr)] transition-all duration-100 active:scale-[.98] active:opacity-75"
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

                        <button className="w-full p-[13px] bg-[var(--fl-s3)] rounded-xl text-[var(--fl-tx2)] text-sm font-semibold mt-[6px] cursor-pointer transition-all duration-100 active:scale-[.97] active:bg-[var(--fl-s4)]" onClick={() => setAddOpen(false)}>
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
