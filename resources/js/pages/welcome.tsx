import { Head, Link, usePage } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState, useMemo, type ReactNode } from 'react';
import { dashboard, login, register } from '@/routes';
import type { FeedItem, FeedItemDishRating, FeedItemRecipe, FeedItemRestaurant, FeedItemWantToTry, FeedStats } from '@/types/portal';

// ── Utility ──────────────────────────────────────────────────────────

function timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days >= 30) return `${Math.floor(days / 30)}mo ago`;
    if (days >= 1) return `${days}d ago`;
    if (hours >= 1) return `${hours}h ago`;
    return 'just now';
}

function formatVisitDate(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name: string | null | undefined): string {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

// ── Scroll-based Word Reveal ─────────────────────────────────────────

function ScrollRevealText({ children, progress }: { children: string; progress: number }) {
    const words = (children ?? '').split(' ');

    return (
        <span style={{ display: 'inline' }}>
            {words.map((word, i) => {
                const wordProgress = i / words.length;
                const opacity = Math.max(0, Math.min(1, (progress - wordProgress * 0.6) * 4));
                const y = (1 - opacity) * 20;

                return (
                    <motion.span
                        key={i}
                        style={{ marginRight: '0.25em', display: 'inline-block', opacity, y }}
                    >
                        {word}
                    </motion.span>
                );
            })}
        </span>
    );
}

// ── Interactive Star Field (cosmos.so style) ─────────────────────────

function StarField() {
    const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

    const stars = useMemo(() => {
        return Array.from({ length: 150 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 0.5,
            baseOpacity: Math.random() * 0.4 + 0.1,
            depth: Math.random() * 3 + 1,
            color: Math.random() > 0.8 ? ['var(--wlc-p)', 'var(--wlc-teal)', 'var(--wlc-gold)'][Math.floor(Math.random() * 3)] : '#DDE0F0',
            animDuration: `${(Math.random() * 3 + 2).toFixed(1)}s`,
            animDelay: `${(Math.random() * 3).toFixed(1)}s`,
            driftX: ((Math.random() - 0.5) * 20).toFixed(1),
            driftY: ((Math.random() - 0.5) * 15).toFixed(1),
            driftDuration: `${(Math.random() * 4 + 3).toFixed(1)}s`,
        }));
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
        };
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            {stars.map((s) => (
                <motion.div
                    key={s.id}
                    style={{
                        position: 'absolute',
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        x: (mouse.x - 0.5) * s.depth * 30,
                        y: (mouse.y - 0.5) * s.depth * 30,
                    }}
                    transition={{ type: 'tween', duration: 1.2, ease: 'easeOut' }}
                >
                    <div
                        className="wlc-star"
                        style={{
                            width: s.size,
                            height: s.size,
                            borderRadius: '50%',
                            background: s.color,
                            ['--base-opacity' as string]: s.baseOpacity,
                            ['--twinkle-duration' as string]: s.animDuration,
                            ['--twinkle-delay' as string]: s.animDelay,
                            ['--drift-x' as string]: `${s.driftX}px`,
                            ['--drift-y' as string]: `${s.driftY}px`,
                            ['--drift-duration' as string]: s.driftDuration,
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
}

// ── Grain Overlay (cosmos.so style) ──────────────────────────────────

function GrainOverlay() {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1,
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: '128px 128px',
            }}
        />
    );
}

// ── Floating Shapes (artistic scattered elements) ────────────────────

function FloatingShapes() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 3000], [0, -600]);
    const y2 = useTransform(scrollY, [0, 3000], [0, -300]);
    const r1 = useTransform(scrollY, [0, 3000], [0, 360]);

    const shapes = [
        { x: '8%', y: '15%', size: 80, blur: 60, color: 'var(--wlc-p)', yOff: y1, opacity: 0.08 },
        { x: '85%', y: '40%', size: 120, blur: 80, color: 'var(--wlc-teal)', yOff: y2, opacity: 0.06 },
        { x: '20%', y: '70%', size: 60, blur: 40, color: 'var(--wlc-gold)', yOff: y1, opacity: 0.07 },
        { x: '70%', y: '85%', size: 100, blur: 70, color: 'var(--wlc-purp)', yOff: y2, opacity: 0.05 },
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            {shapes.map((s, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: s.x,
                        top: s.y,
                        width: s.size,
                        height: s.size,
                        borderRadius: '50%',
                        background: s.color,
                        filter: `blur(${s.blur}px)`,
                        opacity: s.opacity,
                        y: s.yOff,
                    }}
                />
            ))}
            <motion.div style={{ position: 'absolute', right: '12%', top: '25%', fontSize: 48, opacity: 0.06, y: y1, rotate: r1 }}>🍜</motion.div>
            <motion.div style={{ position: 'absolute', left: '15%', top: '60%', fontSize: 36, opacity: 0.05, y: y2, rotate: r1 }}>🥢</motion.div>
        </div>
    );
}

// ── Avatar ───────────────────────────────────────────────────────────

function Avatar({ user, size = 24 }: { user: { name: string; avatar_url: string | null }; size?: number }) {
    if (user.avatar_url) {
        return <img src={user.avatar_url} alt={user.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
    }
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--wlc-p), var(--wlc-gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.35, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
            {getInitials(user.name)}
        </div>
    );
}

// ── Stars ────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: string }) {
    const r = parseFloat(rating);
    return (
        <span style={{ color: 'var(--wlc-gold)', letterSpacing: '3px', fontSize: 12 }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{ opacity: i <= Math.round(r) ? 1 : 0.15 }}>{'★'}</span>
            ))}
        </span>
    );
}

// ── Full-Viewport Scene Wrapper ──────────────────────────────────────

function Scene({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
    return (
        <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', position: 'relative' }}>
            <div style={{ width: '100%', maxWidth: 680, marginLeft: align === 'right' ? 'auto' : 0, marginRight: align === 'left' ? 'auto' : 0, textAlign: align === 'right' ? 'right' : undefined }}>
                {children}
            </div>
        </div>
    );
}

// ── Feed Scenes (scrollytelling, one item per viewport) ──────────────

function FeedMeta({ user, action, time, progress, align = 'left' }: { user: { name: string; avatar_url: string | null }; action: string; time: string; progress: number; align?: 'left' | 'right' }) {
    const y = (1 - progress) * 15;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, opacity: progress, y, justifyContent: align === 'right' ? 'flex-end' : undefined }}>
            <Avatar user={user} />
            <span style={{ fontSize: 13, color: 'var(--wlc-tx3)', fontWeight: 500 }}>
                <span style={{ color: 'var(--wlc-tx)', fontWeight: 600 }}>{user.name}</span>{' '}
                {action}{' '}
                <span style={{ color: 'var(--wlc-tx3)' }}>{time}</span>
            </span>
        </div>
    );
}

function RestaurantScene({ item, progress, align }: { item: FeedItemRestaurant; progress: number; align: 'left' | 'right' }) {
    const metaOpacity = Math.max(0, Math.min(1, progress * 4));
    const titleProgress = Math.max(0, Math.min(1, (progress - 0.05) * 3));
    const metaProgress = Math.max(0, Math.min(1, (progress - 0.15) * 4));
    const reviewProgress = Math.max(0, Math.min(1, (progress - 0.2) * 3));
    const imageProgress = Math.max(0, Math.min(1, (progress - 0.25) * 2.5));
    const dishesProgress = Math.max(0, Math.min(1, (progress - 0.35) * 2));
    const visitProgress = Math.max(0, Math.min(1, (progress - 0.4) * 2.5));

    return (
        <Scene align={align}>
            <FeedMeta user={item.user} action="reviewed" time={timeAgo(item.created_at)} progress={metaOpacity} align={align} />

            <h2 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 800, color: 'var(--wlc-tx)', letterSpacing: '-2px', marginBottom: 16, lineHeight: 1.05, opacity: titleProgress, y: (1 - titleProgress) * 30 }}>
                <ScrollRevealText progress={titleProgress}>{item.name}</ScrollRevealText>
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap', opacity: metaProgress, y: (1 - metaProgress) * 15, justifyContent: align === 'right' ? 'flex-end' : undefined }}>
                <Stars rating={item.overall_rating} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--wlc-tx3)' }}>{item.price_range}</span>
                <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'rgba(255,96,64,0.1)', color: 'var(--wlc-p)' }}>{item.cuisine}</span>
            </div>

            {item.review && (
                <p style={{ fontSize: 20, color: 'var(--wlc-tx2)', lineHeight: 1.65, marginBottom: 32, maxWidth: 540, fontStyle: 'italic', opacity: reviewProgress, y: (1 - reviewProgress) * 20, textAlign: align === 'right' ? 'right' : undefined }}>
                    "{item.review}"
                </p>
            )}

            <div style={{ display: 'grid', gap: 24, gridTemplateColumns: item.dishes.length > 0 ? '1fr 220px' : '1fr' }}>
                {item.image_url && (
                    <div style={{ opacity: imageProgress, scale: 0.9 + imageProgress * 0.1, y: (1 - imageProgress) * 40, borderRadius: 16, overflow: 'hidden' }}>
                        <img src={item.image_url} alt={item.name} style={{ width: '100%', display: 'block', filter: 'brightness(0.95) contrast(1.05)' }} />
                    </div>
                )}
                {item.dishes.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, opacity: dishesProgress, y: (1 - dishesProgress) * 25, textAlign: align === 'right' ? 'right' : undefined }}>
                        {item.dishes.slice(0, 2).map((d) => (
                            <div key={d.name}>
                                {d.image_url && <img src={d.image_url} alt={d.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }} />}
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--wlc-tx)', marginBottom: 4 }}>{d.name}</div>
                                <Stars rating={d.rating} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ fontSize: 12, color: 'var(--wlc-tx3)', marginTop: 20, opacity: visitProgress, textAlign: align === 'right' ? 'right' : undefined }}>Visited {formatVisitDate(item.date_visited)}</div>
        </Scene>
    );
}

function RecipeScene({ item, progress, align }: { item: FeedItemRecipe; progress: number; align: 'left' | 'right' }) {
    const diffColor = item.difficulty === 'Easy' ? 'var(--wlc-grn)' : item.difficulty === 'Hard' ? 'var(--wlc-red)' : 'var(--wlc-gold)';
    const titleProgress = Math.max(0, Math.min(1, (progress - 0.05) * 3));
    const metaProgress = Math.max(0, Math.min(1, (progress - 0.15) * 4));
    const descProgress = Math.max(0, Math.min(1, (progress - 0.2) * 3));
    const imageProgress = Math.max(0, Math.min(1, (progress - 0.3) * 2.5));
    const ingredientsProgress = Math.max(0, Math.min(1, (progress - 0.4) * 2));

    return (
        <Scene align={align}>
            <FeedMeta user={item.user} action="cooked" time={timeAgo(item.created_at)} progress={metaProgress} align={align} />

            <h2 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 800, color: 'var(--wlc-tx)', letterSpacing: '-2px', marginBottom: 16, lineHeight: 1.05, opacity: titleProgress, y: (1 - titleProgress) * 30 }}>
                <ScrollRevealText progress={titleProgress}>{item.name}</ScrollRevealText>
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap', opacity: metaProgress, y: (1 - metaProgress) * 15, justifyContent: align === 'right' ? 'flex-end' : undefined }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: diffColor }}>{item.difficulty}</span>
                <span style={{ fontSize: 13, color: 'var(--wlc-tx3)' }}>{item.total_time} min</span>
                <span style={{ fontSize: 13, color: 'var(--wlc-tx3)' }}>{item.category}</span>
            </div>

            {item.description && (
                <p style={{ fontSize: 20, color: 'var(--wlc-tx2)', lineHeight: 1.65, marginBottom: 32, maxWidth: 540, fontStyle: 'italic', opacity: descProgress, y: (1 - descProgress) * 20, textAlign: align === 'right' ? 'right' : undefined }}>
                    "{item.description}"
                </p>
            )}

            {item.image_url && (
                <div style={{ opacity: imageProgress, scale: 0.9 + imageProgress * 0.1, y: (1 - imageProgress) * 40, borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', display: 'block', filter: 'brightness(0.95) contrast(1.05)' }} />
                </div>
            )}

            {item.ingredients.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', opacity: ingredientsProgress, y: (1 - ingredientsProgress) * 15, justifyContent: align === 'right' ? 'flex-end' : undefined }}>
                    {item.ingredients.slice(0, 5).map((ing) => (
                        <span key={ing} style={{ fontSize: 14, fontWeight: 500, color: 'var(--wlc-teal)', opacity: 0.8 }}>{ing}</span>
                    ))}
                </div>
            )}
        </Scene>
    );
}

function WantToTryScene({ item, progress, align }: { item: FeedItemWantToTry; progress: number; align: 'left' | 'right' }) {
    const titleProgress = Math.max(0, Math.min(1, (progress - 0.05) * 3));
    const metaProgress = Math.max(0, Math.min(1, (progress - 0.15) * 4));
    const notesProgress = Math.max(0, Math.min(1, (progress - 0.25) * 3));

    return (
        <Scene align={align}>
            <FeedMeta user={item.user} action="saved" time={timeAgo(item.created_at)} progress={metaProgress} align={align} />

            <h2 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 800, color: 'var(--wlc-tx)', letterSpacing: '-2px', marginBottom: 16, lineHeight: 1.05, opacity: titleProgress, y: (1 - titleProgress) * 30 }}>
                <ScrollRevealText progress={titleProgress}>{`${item.emoji ?? ''} ${item.name ?? ''}`.trim()}</ScrollRevealText>
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap', opacity: metaProgress, y: (1 - metaProgress) * 15, justifyContent: align === 'right' ? 'flex-end' : undefined }}>
                {item.cuisine && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--wlc-purp)', opacity: 0.8 }}>{item.cuisine}</span>}
                {item.location && <span style={{ fontSize: 13, color: 'var(--wlc-tx3)' }}>{item.location}</span>}
            </div>

            {item.notes && (
                <p style={{ fontSize: 20, color: 'var(--wlc-tx2)', lineHeight: 1.65, maxWidth: 540, fontStyle: 'italic', opacity: notesProgress, y: (1 - notesProgress) * 20, textAlign: align === 'right' ? 'right' : undefined }}>
                    "{item.notes}"
                </p>
            )}
        </Scene>
    );
}

function DishRatingScene({ item, progress, align }: { item: FeedItemDishRating; progress: number; align: 'left' | 'right' }) {
    const titleProgress = Math.max(0, Math.min(1, (progress - 0.05) * 3));
    const metaProgress = Math.max(0, Math.min(1, (progress - 0.15) * 4));
    const notesProgress = Math.max(0, Math.min(1, (progress - 0.25) * 3));
    const imageProgress = Math.max(0, Math.min(1, (progress - 0.35) * 2.5));

    return (
        <Scene align={align}>
            <FeedMeta user={item.user} action="rated" time={timeAgo(item.created_at)} progress={metaProgress} align={align} />

            <h2 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 800, color: 'var(--wlc-tx)', letterSpacing: '-2px', marginBottom: 16, lineHeight: 1.05, opacity: titleProgress, y: (1 - titleProgress) * 30 }}>
                <ScrollRevealText progress={titleProgress}>{item.name}</ScrollRevealText>
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, opacity: metaProgress, y: (1 - metaProgress) * 15, justifyContent: align === 'right' ? 'flex-end' : undefined }}>
                <Stars rating={item.rating} />
                <span style={{ fontSize: 14, color: 'var(--wlc-tx3)' }}>at {item.restaurant_emoji} {item.restaurant_name}</span>
            </div>

            {item.notes && (
                <p style={{ fontSize: 20, color: 'var(--wlc-tx2)', lineHeight: 1.65, marginBottom: 28, maxWidth: 540, fontStyle: 'italic', opacity: notesProgress, y: (1 - notesProgress) * 20, textAlign: align === 'right' ? 'right' : undefined }}>
                    "{item.notes}"
                </p>
            )}

            {item.image_url && (
                <div style={{ opacity: imageProgress, scale: 0.9 + imageProgress * 0.1, y: (1 - imageProgress) * 40, borderRadius: 16, overflow: 'hidden', width: 300 }}>
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', display: 'block', filter: 'brightness(0.95) contrast(1.05)' }} />
                </div>
            )}
        </Scene>
    );
}

// ── Hero ─────────────────────────────────────────────────────────────

function HeroSection({ group, hasFeed, auth }: { group: { id: number; name: string } | null; hasFeed: boolean; auth: { user: { name: string } | null; canLogin: boolean; canRegister: boolean } }) {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 800], [0, 300]);
    const y2 = useTransform(scrollY, [0, 800], [0, -180]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);
    const scale = useTransform(scrollY, [0, 500], [1, 0.95]);

    return (
        <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', padding: '0 20px' }}>
            <motion.div style={{ position: 'absolute', top: '10%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,96,64,0.08), transparent 70%)', filter: 'blur(100px)', y: y1 }} />
            <motion.div style={{ position: 'absolute', bottom: '5%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,205,180,0.06), transparent 70%)', filter: 'blur(100px)', y: y2 }} />

            <motion.div style={{ opacity, scale, zIndex: 2, maxWidth: 700 }}>
                {/* {group && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} style={{ fontSize: 11, fontWeight: 600, color: 'var(--wlc-tx3)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 32, display: 'block' }}>
                        {group.name}
                    </motion.span>
                )} */}

                <motion.img
                    src="/kjeats-logo.png"
                    alt="kjeats"
                    style={{ height: 52, width: 'auto', objectFit: 'contain', marginBottom: 48 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />

                <h1 style={{ fontSize: 'clamp(40px, 9vw, 80px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.02, marginBottom: 28 }}>
                    <span className="wlc-reveal" style={{ display: 'inline-block', opacity: 0, animation: 'wlcReveal 0.8s 0.3s ease-out forwards' }}>A food</span>{' '}
                    <span className="wlc-reveal" style={{ display: 'inline-block', opacity: 0, animation: 'wlcReveal 0.8s 0.5s ease-out forwards' }}>journey</span>
                    <br />
                    <span className="wlc-reveal" style={{ display: 'inline-block', opacity: 0, animation: 'wlcReveal 0.8s 0.7s ease-out forwards', color: 'var(--wlc-p)' }}>worth sharing</span>
                    <span className="wlc-reveal" style={{ display: 'inline-block', opacity: 0, animation: 'wlcReveal 0.8s 0.9s ease-out forwards' }}>.</span>
                </h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1, ease: 'easeOut' }} style={{ fontSize: 18, color: 'var(--wlc-tx2)', maxWidth: 420, lineHeight: 1.65, margin: '0 auto 48px' }}>
                    {hasFeed ? 'See what your group has been tasting, cooking, and saving.' : 'Track restaurants, log recipes, share with friends.'}
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.3, ease: 'easeOut' }} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {auth.user ? (
                        <Link href={dashboard()} className="wlc-btn wlc-btn-p wlc-btn-lg">Open App</Link>
                    ) : (
                        <>
                            {auth.canRegister && <Link href={register()} className="wlc-btn wlc-btn-p wlc-btn-lg">Get Started</Link>}
                            {auth.canLogin && <Link href={login()} className="wlc-btn wlc-btn-ghost wlc-btn-lg">Sign in</Link>}
                        </>
                    )}
                </motion.div>
            </motion.div>

            {hasFeed && (
                <motion.div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2 }} animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--wlc-tx3)', opacity: 0.4 }}>
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </motion.div>
            )}
        </div>
    );
}

// ── Stats ────────────────────────────────────────────────────────────

function StatsSection({ stats }: { stats: FeedStats }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 1, 1, 0]);

    const items = [
        { label: 'Reviews', value: stats.restaurant_count },
        { label: 'Avg rating', value: stats.avg_rating, suffix: '★' },
        { label: 'Recipes', value: stats.recipe_count },
        { label: 'Dishes', value: stats.total_dishes },
    ];

    return (
        <div ref={ref} style={{ minHeight: '60svh', display: 'flex', alignItems: 'center' }}>
            <motion.div style={{ display: 'flex', gap: 'clamp(20px, 6vw, 48px)', margin: '0 auto', opacity, justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                {items.map((s, i) => (
                    <motion.div key={s.label} style={{ textAlign: 'center', minWidth: 80 }}>
                        <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--wlc-tx)', letterSpacing: '-1px' }}>
                            <StatCounter target={s.value} />{s.suffix}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--wlc-tx3)', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

function StatCounter({ target }: { target: number }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

    useEffect(() => {
        return scrollYProgress.on('change', (v) => {
            if (v > 0 && v < 1 && !started.current) {
                started.current = true;
                const steps = 25;
                const increment = target / steps;
                let current = 0;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        setDisplay(target);
                        clearInterval(timer);
                    } else {
                        setDisplay(Math.floor(current));
                    }
                }, 800 / steps);
            }
        });
    }, [scrollYProgress, target]);

    return <span ref={ref}>{display}</span>;
}

// ── CTA ──────────────────────────────────────────────────────────────

function CtaSection({ auth }: { auth: { user: { name: string } | null; canLogin: boolean; canRegister: boolean } }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
    const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 1, 1]);

    return (
        <div ref={ref} style={{ minHeight: '60svh', display: 'flex', alignItems: 'center' }}>
            <motion.div style={{ textAlign: 'center', margin: '0 auto', opacity, padding: '0 20px' }}>
                <h2 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 800, color: 'var(--wlc-tx)', letterSpacing: '-2px', marginBottom: 16, lineHeight: 1.05 }}>
                    Start your <span style={{ color: 'var(--wlc-p)' }}>food</span> journey
                </h2>
                <p style={{ fontSize: 18, color: 'var(--wlc-tx2)', marginBottom: 36 }}>Join your group and start sharing what you eat.</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {auth.user ? (
                        <Link href={dashboard()} className="wlc-btn wlc-btn-p wlc-btn-lg">Open App</Link>
                    ) : (
                        <>
                            {auth.canRegister && <Link href={register()} className="wlc-btn wlc-btn-p wlc-btn-lg">Get Started</Link>}
                            {auth.canLogin && <Link href={login()} className="wlc-btn wlc-btn-ghost wlc-btn-lg">Sign in</Link>}
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ── Single Feed Scene (handles its own scroll tracking) ──────────────

function FeedScene({ item, index }: { item: FeedItem; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const [p, setP] = useState(0);

    useEffect(() => {
        return progress.on('change', (v) => setP(v));
    }, [progress]);

    const align = index % 2 === 0 ? 'left' : 'right';
    const fadeStart = 0.65;
    const sceneOpacity = p < fadeStart ? 1 : Math.max(0, 1 - (p - fadeStart) / (1 - fadeStart));

    const renderScene = () => {
        switch (item.type) {
            case 'restaurant':
                return <RestaurantScene item={item} progress={p} align={align} />;
            case 'recipe':
                return <RecipeScene item={item} progress={p} align={align} />;
            case 'want_to_try':
                return <WantToTryScene item={item} progress={p} align={align} />;
            case 'dish_rating':
                return <DishRatingScene item={item} progress={p} align={align} />;
        }
    };

    return (
        <div ref={ref} style={{ opacity: sceneOpacity, position: 'relative' }}>
            {renderScene()}
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────

interface Props {
    canRegister?: boolean;
    canLogin?: boolean;
    feed: FeedItem[] | null;
    group: { id: number; name: string } | null;
    stats: FeedStats | null;
}

export default function Welcome({ canRegister = true, canLogin = true, feed, group, stats }: Props) {
    const { auth } = usePage().props;
    const user = auth.user as { name: string; email: string; avatar_url?: string | null } | null;

    return (
        <>
            <Head title="kjeats — a food journey" />

            <div className="wlc-root">
                <StarField />
                <GrainOverlay />
                <FloatingShapes />

                <header className="wlc-header">
                    <div className="wlc-header-inner">
                        <div className="wlc-brand">
                            <img src="/kjeats-logo.png" alt="kjeats" className="wlc-logo" />
                            {/* {group && <span className="wlc-group-tag">{group.name}</span>} */}
                        </div>
                        <nav className="wlc-nav">
                            {user ? (
                                <Link href={dashboard()} className="wlc-btn wlc-btn-p">Open App</Link>
                            ) : (
                                <>
                                    {canLogin && <Link href={login()} className="wlc-btn wlc-btn-ghost">Sign in</Link>}
                                    {canRegister && <Link href={register()} className="wlc-btn wlc-btn-p">Join</Link>}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="wlc-main">
                    <HeroSection group={group} hasFeed={feed !== null && feed.length > 0} auth={{ user: user ? { name: user.name } : null, canLogin, canRegister }} />

                    {feed !== null && feed.length > 0 && stats && (
                        <>
                            <StatsSection stats={stats} />

                            <div>
                                {feed.map((item, i) => (
                                    <FeedScene key={`${item.type}-${item.id}`} item={item} index={i} />
                                ))}
                            </div>
                        </>
                    )}

                    {feed !== null && feed.length === 0 && (
                        <div className="wlc-empty">
                            <span>🍽️</span>
                            <p>No activity yet</p>
                        </div>
                    )}

                    {feed !== null && feed.length > 0 && (
                        <CtaSection auth={{ user: user ? { name: user.name } : null, canLogin, canRegister }} />
                    )}
                </main>
            </div>

            <style>{`
                :root {
                    --wlc-bg:    #0C0D14;
                    --wlc-tx:    #DDE0F0;
                    --wlc-tx2:   #8890AF;
                    --wlc-tx3:   #52566E;
                    --wlc-p:     #FF6040;
                    --wlc-p-lt:  #FF7D62;
                    --wlc-gold:  #FFB400;
                    --wlc-teal:  #00CDB4;
                    --wlc-grn:   #4ECF78;
                    --wlc-red:   #FF4560;
                    --wlc-purp:  #8660F7;
                }
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                body { background: var(--wlc-bg); }
                .wlc-root  { min-height: 100svh; background: var(--wlc-bg); color: var(--wlc-tx); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; position: relative; overflow-x: hidden; }

                .wlc-header       { position: sticky; top: 0; z-index: 10; background: rgba(12,13,20,0.6); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.03); }
                .wlc-header-inner { max-width: 800px; margin: 0 auto; padding: 0 20px; height: 52px; display: flex; align-items: center; justify-content: space-between; }
                .wlc-brand        { display: flex; align-items: center; gap: 10px; }
                .wlc-logo         { height: 22px; width: auto; object-fit: contain; }
                .wlc-group-tag    { font-size: 11px; font-weight: 600, color: var(--wlc-tx3); letter-spacing: 1px; text-transform: uppercase; }
                .wlc-nav          { display: flex; align-items: center; gap: 8px; }

                .wlc-btn        { display: inline-flex; align-items: center; justify-content: center; border-radius: 99px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; transition: all .2s; padding: 8px 18px; border: none; }
                .wlc-btn-p      { background: var(--wlc-p); color: #fff; }
                .wlc-btn-p:hover { background: var(--wlc-p-lt); transform: scale(1.02); }
                .wlc-btn-ghost  { background: transparent; color: var(--wlc-tx2); }
                .wlc-btn-ghost:hover { color: var(--wlc-tx); }
                .wlc-btn-lg     { padding: 14px 32px; font-size: 15px; }

                .wlc-main { max-width: 800px; margin: 0 auto; padding: 0 20px; position: relative; z-index: 2; overflow-x: hidden; }
                .wlc-empty { text-align: center; padding: 60px 0; color: var(--wlc-tx3); font-size: 15px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
                .wlc-empty span { font-size: 36px; }

                @keyframes wlcReveal { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes wlcStarTwinkle { 0%, 100% { opacity: var(--base-opacity, 0.3); scale: 1; } 50% { opacity: calc(var(--base-opacity, 0.3) * 0.1); scale: 0.6; } }
                @keyframes wlcStarDrift { 0%, 100% { margin-left: 0; margin-top: 0; } 25% { margin-left: var(--drift-x, 5px); margin-top: var(--drift-y, -3px); } 50% { margin-left: calc(var(--drift-x, 5px) * -0.5); margin-top: calc(var(--drift-y, -3px) * 0.8); } 75% { margin-left: calc(var(--drift-x, 5px) * 0.3); margin-top: calc(var(--drift-y, -3px) * -0.6); } }
                .wlc-star { animation: wlcStarTwinkle var(--twinkle-duration, 3s) var(--twinkle-delay, 0s) ease-in-out infinite, wlcStarDrift var(--drift-duration, 4s) var(--drift-delay, 0s) ease-in-out infinite; will-change: opacity, scale, margin-left, margin-top; }
            `}</style>
        </>
    );
}
