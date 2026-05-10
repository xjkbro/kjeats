import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as RecipeController from '@/actions/App/Http/Controllers/RecipeController';
import * as RestaurantController from '@/actions/App/Http/Controllers/RestaurantController';
import PortalLayout, { getGreeting } from '@/layouts/portal/portal-layout';
import type { Restaurant, Recipe } from '@/types/portal';

interface Props {
    restaurants: Restaurant[];
    recipes: Recipe[];
    stats: {
        restaurant_count: number;
        avg_rating: string | null;
        recipe_count: number;
        total_dishes: number;
    };
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

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
    return (
        <Link href={RestaurantController.show(restaurant.id).url} className="fl-card">
            <div className="fl-card-emoji">{restaurant.emoji}</div>
            <div className="fl-card-body">
                <div className="fl-card-name">{restaurant.name}</div>
                <div className="fl-card-meta">
                    <StarDisplay rating={restaurant.overall_rating} />
                    <span className="fl-badge fl-badge-org">{restaurant.cuisine}</span>
                </div>
                <div className="fl-card-sub">{restaurant.location}</div>
            </div>
            <svg className="fl-card-chev" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </Link>
    );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
    const totalTime = recipe.prep_time + recipe.cook_time + recipe.rest_time;

    return (
        <Link href={RecipeController.show(recipe.id).url} className="fl-card">
            <div className="fl-card-emoji">{recipe.emoji}</div>
            <div className="fl-card-body">
                <div className="fl-card-name">{recipe.name}</div>
                <div className="fl-card-meta">
                    <span className="fl-badge fl-badge-teal">{recipe.difficulty}</span>
                    <span className="fl-badge fl-badge-def">{totalTime} min</span>
                </div>
                <div className="fl-card-sub">{recipe.category}</div>
            </div>
            <svg className="fl-card-chev" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </Link>
    );
}

export default function Home({ restaurants, recipes, stats }: Props) {
    const recentRestaurants = restaurants.slice(0, 2);
    const recentRecipes = recipes.slice(0, 2);

    return (
        <div className="fl-view">
            <div className="fl-greeting">
                <h2 className="fl-greeting-text">Good {getGreeting()} 👋</h2>
                <p className="fl-greeting-sub">Your Food Journal</p>
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

            <section className="fl-section">
                <div className="fl-section-hdr">
                    <h3 className="fl-section-ttl">Recent Reviews</h3>
                    <Link href={RestaurantController.index().url} className="fl-see-all">
                        See all →
                    </Link>
                </div>
                {recentRestaurants.length > 0 ? (
                    <div className="fl-card-list">
                        {recentRestaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
                    </div>
                ) : (
                    <div className="fl-empty">
                        <span>🍽️</span>
                        <p>No restaurants yet</p>
                        <Link href={RestaurantController.create().url} className="fl-btn fl-btn-p">
                            Add your first review
                        </Link>
                    </div>
                )}
            </section>

            <section className="fl-section">
                <div className="fl-section-hdr">
                    <h3 className="fl-section-ttl">Recent Recipes</h3>
                    <Link href={RecipeController.index().url} className="fl-see-all">
                        See all →
                    </Link>
                </div>
                {recentRecipes.length > 0 ? (
                    <div className="fl-card-list">
                        {recentRecipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
                    </div>
                ) : (
                    <div className="fl-empty">
                        <span>📋</span>
                        <p>No recipes yet</p>
                        <Link href={RecipeController.create().url} className="fl-btn fl-btn-p">
                            Add your first recipe
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}

Home.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
