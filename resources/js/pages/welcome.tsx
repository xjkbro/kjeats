import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type { FeedItem, FeedItemDishRating, FeedItemRecipe, FeedItemRestaurant } from '@/types/portal';

interface Props {
    canRegister?: boolean;
    feed: FeedItem[] | null;
    group: { id: number; name: string } | null;
}

function timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (days >= 30) {
        return `${Math.floor(days / 30)}mo ago`;
    }

    if (days >= 1) {
        return `${days}d ago`;
    }

    if (hours >= 1) {
        return `${hours}h ago`;
    }

    if (minutes >= 1) {
        return `${minutes}m ago`;
    }

    return 'just now';
}

function formatVisitDate(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Stars({ rating }: { rating: string }) {
    const r = parseFloat(rating);

    return (
        <span style={{ color: '#FFB400', letterSpacing: '1px', fontSize: '12px' }}>
            {[1,2,3,4,5].map((i) => (
                <span key={i} style={{ opacity: i <= Math.round(r) ? 1 : 0.25 }}>★</span>
            ))}
        </span>
    );
}

function RestaurantItem({ item }: { item: FeedItemRestaurant }) {
    return (
        <div className="wlc-feed-item">
            <div className="wlc-feed-ico">{item.emoji}</div>
            <div className="wlc-feed-body">
                <div className="wlc-feed-actor">
                    <span className="wlc-feed-user">{item.user.name}</span>
                    <span className="wlc-feed-dot">·</span>
                    <span>restaurant visit</span>
                </div>
                <div className="wlc-feed-name">{item.name}</div>
                <div className="wlc-feed-meta">
                    <Stars rating={item.overall_rating} />
                    <span className="wlc-badge wlc-badge-org">{item.cuisine}</span>
                    <span className="wlc-badge wlc-badge-def">{item.price_range}</span>
                </div>
                <div className="wlc-feed-time">Visited {formatVisitDate(item.date_visited)} · {timeAgo(item.created_at)}</div>
            </div>
        </div>
    );
}

function RecipeItem({ item }: { item: FeedItemRecipe }) {
    const diffColor = item.difficulty === 'Easy' ? 'grn' : item.difficulty === 'Hard' ? 'red' : 'gold';

    return (
        <div className="wlc-feed-item">
            <div className="wlc-feed-ico">{item.emoji}</div>
            <div className="wlc-feed-body">
                <div className="wlc-feed-actor">
                    <span className="wlc-feed-user">{item.user.name}</span>
                    <span className="wlc-feed-dot">·</span>
                    <span>new recipe</span>
                </div>
                <div className="wlc-feed-name">{item.name}</div>
                <div className="wlc-feed-meta">
                    <span className={`wlc-badge wlc-badge-${diffColor}`}>{item.difficulty}</span>
                    <span className="wlc-badge wlc-badge-def">{item.category}</span>
                    <span className="wlc-badge wlc-badge-def">{item.total_time} min</span>
                </div>
                <div className="wlc-feed-time">{timeAgo(item.created_at)}</div>
            </div>
        </div>
    );
}

function DishRatingItem({ item }: { item: FeedItemDishRating }) {
    return (
        <div className="wlc-feed-item">
            <div className="wlc-feed-ico">{item.restaurant_emoji}</div>
            <div className="wlc-feed-body">
                <div className="wlc-feed-actor">
                    <span className="wlc-feed-user">{item.user.name}</span>
                    <span className="wlc-feed-dot">·</span>
                    <span>rated a dish</span>
                </div>
                <div className="wlc-feed-name">{item.name}</div>
                <div className="wlc-feed-meta">
                    <Stars rating={item.rating} />
                    <span className="wlc-badge wlc-badge-def">at {item.restaurant_name}</span>
                </div>
                <div className="wlc-feed-time">in {item.restaurant_owner}'s review · {timeAgo(item.created_at)}</div>
            </div>
        </div>
    );
}

export default function Welcome({ canRegister = true, feed, group }: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="kjeats — a food journey" />

            <div className="wlc-root">
                <header className="wlc-header">
                    <div className="wlc-header-inner">
                        <div className="wlc-brand">
                            <img src="/kjeats-logo.png" alt="kjeats" className="wlc-logo" />
                            {group && <span className="wlc-group-tag">{group.name}</span>}
                        </div>
                        <nav className="wlc-nav">
                            {auth.user ? (
                                <Link href={dashboard()} className="wlc-btn wlc-btn-p">
                                    Open App
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className="wlc-btn wlc-btn-ghost">
                                        Sign in
                                    </Link>
                                    {canRegister && (
                                        <Link href={register()} className="wlc-btn wlc-btn-p">
                                            Join
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="wlc-main">
                    {feed !== null ? (
                        <section className="wlc-feed-section">
                            <h2 className="wlc-section-ttl">Recent Activity</h2>
                            {feed.length > 0 ? (
                                <div className="wlc-feed">
                                    {feed.map((item) =>
                                        item.type === 'restaurant' ? (
                                            <RestaurantItem key={`r-${item.id}`} item={item} />
                                        ) : item.type === 'recipe' ? (
                                            <RecipeItem key={`rec-${item.id}`} item={item} />
                                        ) : (
                                            <DishRatingItem key={`d-${item.id}`} item={item} />
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="wlc-empty">
                                    <span>🍽️</span>
                                    <p>No activity yet</p>
                                </div>
                            )}
                        </section>
                    ) : (
                        <div className="wlc-hero">
                            <img src="/kjeats-logo.png" alt="kjeats" className="wlc-hero-logo" />
                            <p className="wlc-hero-sub">Track restaurants, log recipes, share with friends.</p>
                            <div className="wlc-hero-actions">
                                {auth.user ? (
                                    <Link href={dashboard()} className="wlc-btn wlc-btn-p wlc-btn-lg">
                                        Open App
                                    </Link>
                                ) : (
                                    <>
                                        {canRegister && (
                                            <Link href={register()} className="wlc-btn wlc-btn-p wlc-btn-lg">
                                                Get Started
                                            </Link>
                                        )}
                                        <Link href={login()} className="wlc-btn wlc-btn-ghost wlc-btn-lg">
                                            Sign in
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <style>{`
                :root {
                    --wlc-bg:   #0C0D14;
                    --wlc-s1:   #13141E;
                    --wlc-s2:   #1B1D2A;
                    --wlc-bdr:  #272A40;
                    --wlc-bdr-s:#1C1E30;
                    --wlc-tx:   #DDE0F0;
                    --wlc-tx2:  #8890AF;
                    --wlc-tx3:  #52566E;
                    --wlc-p:    #FF6040;
                    --wlc-p-lt: #FF7D62;
                    --wlc-gold: #FFB400;
                    --wlc-teal: #00CDB4;
                    --wlc-grn:  #4ECF78;
                    --wlc-red:  #FF4560;
                    --wlc-r:    12px;
                }
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                .wlc-root  { min-height: 100svh; background: var(--wlc-bg); color: var(--wlc-tx); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }

                /* header */
                .wlc-header       { position: sticky; top: 0; z-index: 10; background: var(--wlc-bg); border-bottom: 1px solid var(--wlc-bdr-s); }
                .wlc-header-inner { max-width: 540px; margin: 0 auto; padding: 0 16px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
                .wlc-brand        { display: flex; align-items: center; gap: 10px; }
                .wlc-logo         { height: 24px; width: auto; object-fit: contain; }
                .wlc-group-tag    { font-size: 11px; font-weight: 700; color: var(--wlc-tx3); background: var(--wlc-s2); border: 1px solid var(--wlc-bdr); border-radius: 99px; padding: 2px 8px; }
                .wlc-nav          { display: flex; align-items: center; gap: 8px; }

                /* buttons */
                .wlc-btn        { display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: none; transition: all .15s; padding: 7px 16px; border: none; }
                .wlc-btn-p      { background: var(--wlc-p); color: #fff; }
                .wlc-btn-p:hover { background: var(--wlc-p-lt); }
                .wlc-btn-ghost  { background: transparent; color: var(--wlc-tx2); border: 1px solid var(--wlc-bdr); }
                .wlc-btn-ghost:hover { background: var(--wlc-s2); color: var(--wlc-tx); }
                .wlc-btn-lg     { padding: 12px 28px; font-size: 15px; }

                /* main */
                .wlc-main { max-width: 540px; margin: 0 auto; padding: 20px 16px 80px; }

                /* hero (no group) */
                .wlc-hero         { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 64px 0 48px; gap: 20px; }
                .wlc-hero-logo    { height: 52px; width: auto; object-fit: contain; }
                .wlc-hero-sub     { font-size: 15px; color: var(--wlc-tx2); max-width: 280px; line-height: 1.5; }
                .wlc-hero-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

                /* feed */
                .wlc-section-ttl  { font-size: 12px; font-weight: 700; color: var(--wlc-tx3); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 12px; }
                .wlc-feed         { display: flex; flex-direction: column; gap: 10px; }
                .wlc-feed-item    { background: var(--wlc-s1); border: 1px solid var(--wlc-bdr-s); border-radius: var(--wlc-r); padding: 14px 16px; display: flex; gap: 14px; align-items: flex-start; }
                .wlc-feed-ico     { font-size: 20px; flex-shrink: 0; width: 42px; height: 42px; border-radius: 10px; background: var(--wlc-s2); border: 1px solid var(--wlc-bdr-s); display: flex; align-items: center; justify-content: center; }
                .wlc-feed-body    { flex: 1; min-width: 0; }
                .wlc-feed-actor   { font-size: 11px; font-weight: 600; color: var(--wlc-tx3); text-transform: uppercase; letter-spacing: .4px; margin-bottom: 3px; display: flex; align-items: center; gap: 5px; }
                .wlc-feed-user    { color: var(--wlc-tx2); font-weight: 700; }
                .wlc-feed-dot     { color: var(--wlc-tx3); }
                .wlc-feed-name    { font-size: 15px; font-weight: 800; color: var(--wlc-tx); letter-spacing: -.2px; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .wlc-feed-meta    { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
                .wlc-feed-time    { font-size: 11px; color: var(--wlc-tx3); }
                .wlc-empty        { text-align: center; padding: 40px 0; color: var(--wlc-tx3); font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
                .wlc-empty span   { font-size: 32px; }

                /* badges */
                .wlc-badge        { font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 99px; display: inline-block; }
                .wlc-badge-def    { background: rgba(255,255,255,.06); color: var(--wlc-tx2); }
                .wlc-badge-org    { background: rgba(255,96,64,.12); color: #FF7D62; }
                .wlc-badge-gold   { background: rgba(255,180,0,.14); color: #FFB400; }
                .wlc-badge-grn    { background: rgba(78,207,120,.12); color: #4ECF78; }
                .wlc-badge-teal   { background: rgba(0,205,180,.12); color: #00CDB4; }
                .wlc-badge-red    { background: rgba(255,69,96,.12); color: #FF4560; }
            `}</style>
        </>
    );
}
