import { Link, router } from '@inertiajs/react';
import * as GroupController from '@/actions/App/Http/Controllers/GroupController';
import type { ReactNode } from 'react';
import PortalLayout from '@/layouts/portal/portal-layout';
import type { Restaurant, Recipe } from '@/types/portal';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        created_at: string;
    };
    stats: {
        restaurant_count: number;
        recipe_count: number;
        avg_rating: string | null;
        total_dishes: number;
        top_cuisine: string | null;
        difficulty_breakdown: Record<string, number>;
    };
    recent_restaurants: Restaurant[];
    recent_recipes: Recipe[];
}

function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function Profile({
    user,
    stats,
    // recent_restaurants,
    // recent_recipes
}: Props) {
    const memberSince = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="fl-view">
            <div className="fl-profile-hero">
                <div className="fl-profile-avatar">{getInitials(user.name)}</div>
                <h1 className="fl-profile-name">{user.name}</h1>
                <p className="fl-profile-email">{user.email}</p>
                <p className="fl-profile-since">Member since {memberSince}</p>
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

            {(stats.top_cuisine || Object.keys(stats.difficulty_breakdown).length > 0) && (
                <section className="fl-section">
                    <h3 className="fl-section-ttl">Food Insights</h3>
                    <div className="fl-insights">
                        {stats.top_cuisine && (
                            <div className="fl-insight-item">
                                <span className="fl-insight-ico">🍽️</span>
                                <div>
                                    <div className="fl-insight-lbl">Favorite Cuisine</div>
                                    <div className="fl-insight-val">{stats.top_cuisine}</div>
                                </div>
                            </div>
                        )}
                        {Object.keys(stats.difficulty_breakdown).length > 0 && (
                            <div className="fl-insight-item">
                                <span className="fl-insight-ico">📊</span>
                                <div>
                                    <div className="fl-insight-lbl">Recipes by Difficulty</div>
                                    <div className="fl-difficulty-breakdown">
                                        {Object.entries(stats.difficulty_breakdown).map(([diff, count]) => (
                                            <span key={diff} className={`fl-badge fl-badge-${diff === 'Easy' ? 'grn' : diff === 'Hard' ? 'red' : 'gold'}`}>
                                                {diff}: {count}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <section className="fl-section">
                <h3 className="fl-section-ttl">Settings</h3>
                <div className="fl-settings-list">
                    <Link href={GroupController.index().url} className="fl-settings-item">
                        <span className="fl-settings-ico">👥</span>
                        <span>Groups</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                    <Link href="/app/user/profile" className="fl-settings-item">
                        <span className="fl-settings-ico">👤</span>
                        <span>Edit Profile</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                    <Link href="/app/user/password" className="fl-settings-item">
                        <span className="fl-settings-ico">🔒</span>
                        <span>Change Password</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                    <button
                        type="button"
                        className="fl-settings-item fl-settings-danger"
                        onClick={() => {
                            router.post('/logout');
                        }}
                    >
                        <span className="fl-settings-ico">🚪</span>
                        <span>Sign Out</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>
            </section>
        </div>
    );
}

Profile.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
