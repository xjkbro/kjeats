import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as GroupController from '@/actions/App/Http/Controllers/GroupController';
import * as RecipeController from '@/actions/App/Http/Controllers/RecipeController';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import * as WantToTryController from '@/actions/App/Http/Controllers/WantToTryController';
import PortalLayout, { getGreeting } from '@/layouts/portal/portal-layout';

interface Props {
    group: { id: number; name: string } | null;
    feed: Array<{
        type: string;
        id: number;
        emoji?: string;
        name: string;
        cuisine?: string;
        date_visited?: string;
        overall_rating?: string;
        price_range?: string;
        category?: string;
        difficulty?: string;
        total_time?: number;
        rating?: string;
        restaurant_id?: number;
        restaurant_name?: string;
        restaurant_emoji?: string;
        restaurant_owner?: string;
        user: { name: string };
        created_at: string;
    }> | null;
    stats: {
        restaurant_count: number;
        avg_rating: string | null;
        recipe_count: number;
        total_dishes: number;
        top_cuisine: string | null;
    };
    recent_restaurants: Array<{
        id: number;
        emoji: string;
        name: string;
        cuisine: string;
        date_visited: string;
        overall_rating: string;
    }>;
    recent_recipes: Array<{
        id: number;
        emoji: string;
        name: string;
        category: string;
        difficulty: string;
        total_time: number;
    }>;
    want_to_tries: Array<{
        id: number;
        emoji: string;
        name: string;
        cuisine: string | null;
        location: string | null;
    }>;
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

function StarDisplay({ rating }: { rating: number | string }) {
    const r = parseFloat(String(rating));

    return (
        <div className="fl-stars">
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= Math.round(r) ? 'filled' : ''}>
                    ★
                </span>
            ))}
        </div>
    );
}

function RestaurantFeedItem({ item }: { item: Props['feed'][number] }) {
    return (
        <Link href={RestaurantController.show(item.id).url} className="fl-feed-item">
            <div className="fl-feed-ico">{item.emoji}</div>
            <div className="fl-feed-body">
                <div className="fl-feed-actor">
                    <span className="fl-feed-user">{item.user.name}</span>
                    <span>·</span>
                    <span>restaurant visit</span>
                </div>
                <div className="fl-feed-name">{item.name}</div>
                <div className="fl-feed-meta">
                    <StarDisplay rating={item.overall_rating ?? '0'} />
                    <span className="fl-badge fl-badge-org">{item.cuisine}</span>
                    <span className="fl-badge fl-badge-def">{item.price_range}</span>
                </div>
                <div className="fl-feed-time">Visited {formatVisitDate(item.date_visited!)} · {timeAgo(item.created_at)}</div>
            </div>
            <svg className="fl-feed-chev" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </Link>
    );
}

function RecipeFeedItem({ item }: { item: Props['feed'][number] }) {
    const diffColor = item.difficulty === 'Easy' ? 'grn' : item.difficulty === 'Hard' ? 'red' : 'gold';

    return (
        <Link href={RecipeController.show(item.id).url} className="fl-feed-item">
            <div className="fl-feed-ico">{item.emoji}</div>
            <div className="fl-feed-body">
                <div className="fl-feed-actor">
                    <span className="fl-feed-user">{item.user.name}</span>
                    <span>·</span>
                    <span>new recipe</span>
                </div>
                <div className="fl-feed-name">{item.name}</div>
                <div className="fl-feed-meta">
                    <span className={`fl-badge fl-badge-${diffColor}`}>{item.difficulty}</span>
                    <span className="fl-badge fl-badge-def">{item.category}</span>
                    <span className="fl-badge fl-badge-def">{item.total_time} min</span>
                </div>
                <div className="fl-feed-time">{timeAgo(item.created_at)}</div>
            </div>
            <svg className="fl-feed-chev" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </Link>
    );
}

function DishRatingFeedItem({ item }: { item: Props['feed'][number] }) {
    return (
        <Link href={RestaurantController.show(item.restaurant_id!).url} className="fl-feed-item">
            <div className="fl-feed-ico">{item.restaurant_emoji}</div>
            <div className="fl-feed-body">
                <div className="fl-feed-actor">
                    <span className="fl-feed-user">{item.user.name}</span>
                    <span>·</span>
                    <span>rated a dish</span>
                </div>
                <div className="fl-feed-name">{item.name}</div>
                <div className="fl-feed-meta">
                    <StarDisplay rating={item.rating ?? '0'} />
                    <span className="fl-badge fl-badge-def">at {item.restaurant_name}</span>
                </div>
                <div className="fl-feed-time">in {item.restaurant_owner}'s review · {timeAgo(item.created_at)}</div>
            </div>
            <svg className="fl-feed-chev" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </Link>
    );
}

function WantToTryFeedItem({ item }: { item: Props['feed'][number] }) {
    return (
        <Link href={WantToTryController.show(item.id).url} className="fl-feed-item">
            <div className="fl-feed-ico">{item.emoji}</div>
            <div className="fl-feed-body">
                <div className="fl-feed-actor">
                    <span className="fl-feed-user">{item.user.name}</span>
                    <span>·</span>
                    <span>wants to try</span>
                </div>
                <div className="fl-feed-name">{item.name}</div>
                <div className="fl-feed-meta">
                    {item.cuisine && <span className="fl-badge fl-badge-org">{item.cuisine}</span>}
                    {item.location && <span className="fl-badge fl-badge-def">{item.location}</span>}
                </div>
                <div className="fl-feed-time">{timeAgo(item.created_at)}</div>
            </div>
            <svg className="fl-feed-chev" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </Link>
    );
}

function RestaurantCard({ restaurant }: { restaurant: Props['recent_restaurants'][number] }) {
    return (
        <Link href={RestaurantController.show(restaurant.id).url} className="fl-card">
            <div className="fl-card-emoji">{restaurant.emoji}</div>
            <div className="fl-card-body">
                <div className="fl-card-name">{restaurant.name}</div>
                <div className="fl-card-meta">
                    <StarDisplay rating={restaurant.overall_rating} />
                    <span className="fl-badge fl-badge-org">{restaurant.cuisine}</span>
                </div>
                <div className="fl-card-sub">Visited {formatVisitDate(restaurant.date_visited)}</div>
            </div>
            <svg className="fl-card-chev" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </Link>
    );
}

function RecipeCard({ recipe }: { recipe: Props['recent_recipes'][number] }) {
    return (
        <Link href={RecipeController.show(recipe.id).url} className="fl-card">
            <div className="fl-card-emoji">{recipe.emoji}</div>
            <div className="fl-card-body">
                <div className="fl-card-name">{recipe.name}</div>
                <div className="fl-card-meta">
                    <span className={`fl-badge fl-badge-${recipe.difficulty === 'Easy' ? 'grn' : recipe.difficulty === 'Hard' ? 'red' : 'gold'}`}>
                        {recipe.difficulty}
                    </span>
                    <span className="fl-badge fl-badge-def">{recipe.total_time} min</span>
                </div>
                <div className="fl-card-sub">{recipe.category}</div>
            </div>
            <svg className="fl-card-chev" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </Link>
    );
}

export default function Dashboard({ group, feed, stats, recent_restaurants = [], recent_recipes = [], want_to_tries = [] }: Props) {
    return (
        <div className="fl-view">
            <div className="fl-greeting">
                <h2 className="fl-greeting-text">Good {getGreeting()} 👋</h2>
                <p className="fl-greeting-sub">{group ? group.name : 'Your Food Journal'}</p>
            </div>

            <div className="fl-stats-grid">
                <div className="fl-stat fl-s-org">
                    <div className="fl-stat-val">{stats.restaurant_count}</div>
                    <div className="fl-stat-lbl">Restaurants</div>
                </div>
                <div className="fl-stat fl-s-gold">
                    <div className="fl-stat-val">{stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : '—'}</div>
                    <div className="fl-stat-lbl">Avg Rating</div>
                </div>
                <div className="fl-stat fl-s-teal">
                    <div className="fl-stat-val">{stats.recipe_count}</div>
                    <div className="fl-stat-lbl">Recipes</div>
                </div>
                <div className="fl-stat fl-s-purp">
                    <div className="fl-stat-val">{stats.total_dishes}</div>
                    <div className="fl-stat-lbl">Dishes</div>
                </div>
            </div>

            {want_to_tries.length > 0 && (
                <section className="fl-section fl-mb-6">
                    <div className="fl-section-hdr">
                        <h3 className="fl-section-ttl">Want to Try</h3>
                        <Link href={WantToTryController.index().url} className="fl-see-all">
                            See all →
                        </Link>
                    </div>
                    <div className="fl-wtt-scroll">
                        {want_to_tries.map((w) => (
                            <Link key={w.id} href={WantToTryController.show(w.id).url} className="fl-wtt-chip">
                                <span className="fl-wtt-chip-emoji">{w.emoji}</span>
                                <span className="fl-wtt-chip-name">{w.name}</span>
                            </Link>
                        ))}
                        <Link href={WantToTryController.create().url} className="fl-wtt-chip fl-wtt-chip-add">
                            + Add
                        </Link>
                    </div>
                </section>
            )}

            <section className="fl-section fl-mb-6">
                <div className="fl-section-hdr">
                    <h3 className="fl-section-ttl">Quick Actions</h3>
                </div>
                <div className="fl-quick-actions">
                    <Link href={RestaurantController.create().url} className="fl-quick-action fl-qa-rest">
                        <span className="fl-qa-ico">📍</span>
                        <span className="fl-qa-label">Add Review</span>
                    </Link>
                    <Link href={RecipeController.create().url} className="fl-quick-action fl-qa-recipe">
                        <span className="fl-qa-ico">📋</span>
                        <span className="fl-qa-label">Add Recipe</span>
                    </Link>
                    <Link href={RestaurantController.index().url + '?revisit=1'} className="fl-quick-action fl-qa-revisit">
                        <span className="fl-qa-ico">🔁</span>
                        <span className="fl-qa-label">Revisit</span>
                    </Link>
                    <Link href={GroupController.index().url} className="fl-quick-action fl-qa-group">
                        <span className="fl-qa-ico">👥</span>
                        <span className="fl-qa-label">Groups</span>
                    </Link>
                </div>
            </section>

            {feed !== null && (
                <section className="fl-section">
                    <div className="fl-section-hdr">
                        <h3 className="fl-section-ttl">Recent Activity</h3>
                    </div>
                    {feed.length > 0 ? (
                        <div className="fl-feed">
                            {feed.slice(0, 10).map((item) =>
                                item.type === 'restaurant' ? (
                                    <RestaurantFeedItem key={`r-${item.id}`} item={item} />
                                ) : item.type === 'recipe' ? (
                                    <RecipeFeedItem key={`rec-${item.id}`} item={item} />
                                ) : item.type === 'want_to_try' ? (
                                    <WantToTryFeedItem key={`w-${item.id}`} item={item} />
                                ) : (
                                    <DishRatingFeedItem key={`d-${item.id}`} item={item} />
                                ),
                            )}
                        </div>
                    ) : (
                        <div className="fl-empty">
                            <span>🍽️</span>
                            <p className="fl-empty-ttl">No activity yet</p>
                            <p className="fl-empty-desc">Start by adding a restaurant review or recipe</p>
                        </div>
                    )}
                </section>
            )}

            {feed === null && (
                <>
                    {recent_restaurants.length > 0 && (
                        <section className="fl-section">
                            <div className="fl-section-hdr">
                                <h3 className="fl-section-ttl">Recent Reviews</h3>
                                <Link href={RestaurantController.index().url} className="fl-see-all">
                                    See all →
                                </Link>
                            </div>
                            <div className="fl-card-list">
                                {recent_restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
                            </div>
                        </section>
                    )}

                    {recent_recipes.length > 0 && (
                        <section className="fl-section">
                            <div className="fl-section-hdr">
                                <h3 className="fl-section-ttl">Recent Recipes</h3>
                                <Link href={RecipeController.index().url} className="fl-see-all">
                                    See all →
                                </Link>
                            </div>
                            <div className="fl-card-list">
                                {recent_recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
                            </div>
                        </section>
                    )}

                    {recent_restaurants.length === 0 && recent_recipes.length === 0 && (
                        <div className="fl-empty">
                            <span>🍽️</span>
                            <p className="fl-empty-ttl">Welcome to your dashboard</p>
                            <p className="fl-empty-desc">Start tracking your restaurant visits and recipes</p>
                            <div className="fl-quick-actions">
                                <Link href={RestaurantController.create().url} className="fl-btn fl-btn-p">
                                    Add your first review
                                </Link>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

Dashboard.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
