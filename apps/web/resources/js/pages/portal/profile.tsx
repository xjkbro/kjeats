import { Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as GroupController from '@/actions/App/Http/Controllers/GroupController';
import PortalLayout from '@/layouts/portal/portal-layout';
import type { Restaurant, Recipe } from '@/types/portal';
import { home } from '@/routes';

interface Props {
    user: {
        id: number;
        first_name: string;
        last_name: string | null;
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

function getInitials(firstName: string, lastName?: string | null) {
    const first = (firstName || '')[0] || '';
    const last = (lastName || '')[0] || '';
    return (first + last || first || '?').toUpperCase();
}

export default function Profile({
    user,
    stats,
    // recent_restaurants,
    // recent_recipes
}: Props) {
    const memberSince = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <div className="bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-[26px] p-7 text-center mb-5">
                <div className="w-[72px] h-[72px] rounded-[16px] bg-gradient-to-br from-[var(--fl-p)] to-[var(--fl-gold)] flex items-center justify-center text-[26px] font-black text-white mx-auto mb-[14px]">{getInitials(user.first_name, user.last_name)}</div>
                <h1 className="text-xl font-extrabold text-[var(--fl-tx)] tracking-[-.4px] mb-1">{user.first_name}</h1>
                <p className="text-sm text-[var(--fl-tx2)]">{user.email}</p>
                <p className="text-xs text-[var(--fl-tx3)] mt-1">Member since {memberSince}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] mb-6">
                <div className="bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-[16px] p-4 relative overflow-hidden cursor-pointer transition-all duration-100 active:scale-[.96] active:border-[var(--fl-bdr)] fl-s-org">
                    <div className="text-[30px] font-black text-[var(--fl-tx)] leading-none tracking-[-1.5px] mb-[3px]">{stats.restaurant_count}</div>
                    <div className="text-xs font-medium text-[var(--fl-tx2)]">Restaurants</div>
                </div>
                <div className="bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-[16px] p-4 relative overflow-hidden cursor-pointer transition-all duration-100 active:scale-[.96] active:border-[var(--fl-bdr)] fl-s-gold">
                    <div className="text-[30px] font-black text-[var(--fl-tx)] leading-none tracking-[-1.5px] mb-[3px]">{stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : '—'}</div>
                    <div className="text-xs font-medium text-[var(--fl-tx2)]">Avg Rating</div>
                </div>
                <div className="bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-[16px] p-4 relative overflow-hidden cursor-pointer transition-all duration-100 active:scale-[.96] active:border-[var(--fl-bdr)] fl-s-teal">
                    <div className="text-[30px] font-black text-[var(--fl-tx)] leading-none tracking-[-1.5px] mb-[3px]">{stats.recipe_count}</div>
                    <div className="text-xs font-medium text-[var(--fl-tx2)]">Recipes</div>
                </div>
                <div className="bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-[16px] p-4 relative overflow-hidden cursor-pointer transition-all duration-100 active:scale-[.96] active:border-[var(--fl-bdr)] fl-s-purp">
                    <div className="text-[30px] font-black text-[var(--fl-tx)] leading-none tracking-[-1.5px] mb-[3px]">{stats.total_dishes}</div>
                    <div className="text-xs font-medium text-[var(--fl-tx2)]">Dishes</div>
                </div>
            </div>

            {(stats.top_cuisine || Object.keys(stats.difficulty_breakdown).length > 0) && (
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[15px] font-bold text-[var(--fl-tx)] tracking-[-.2px]">Food Insights</h3>
                    </div>
                    <div className="flex flex-col gap-[10px]">
                        {stats.top_cuisine && (
                            <div className="flex items-start gap-3 bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-xl p-[14px]">
                                <span className="text-2xl shrink-0">🍽️</span>
                                <div>
                                    <div className="text-xs font-semibold text-[var(--fl-tx3)] uppercase tracking-[.5px] mb-1">Favorite Cuisine</div>
                                    <div className="text-[15px] font-bold text-[var(--fl-tx)]">{stats.top_cuisine}</div>
                                </div>
                            </div>
                        )}
                        {Object.keys(stats.difficulty_breakdown).length > 0 && (
                            <div className="flex items-start gap-3 bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-xl p-[14px]">
                                <span className="text-2xl shrink-0">📊</span>
                                <div>
                                    <div className="text-xs font-semibold text-[var(--fl-tx3)] uppercase tracking-[.5px] mb-1">Recipes by Difficulty</div>
                                    <div className="flex gap-[6px] flex-wrap mt-[6px]">
                                        {Object.entries(stats.difficulty_breakdown).map(([diff, count]) => (
                                            <span key={diff} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${diff === 'Easy' ? 'bg-[var(--fl-grn-d)] text-[var(--fl-grn)]' : diff === 'Hard' ? 'bg-[var(--fl-red-d)] text-[var(--fl-red)]' : 'bg-[var(--fl-gld-d)] text-[var(--fl-gold)]'}`}>
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

            <section className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[15px] font-bold text-[var(--fl-tx)] tracking-[-.2px]">Links</h3>
                </div>
                <div className="bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-[16px] overflow-hidden mb-4">
                    <Link href={home()} className="flex items-center px-4 py-[14px] border-b border-[var(--fl-bdr-s)] last:border-b-0 cursor-pointer transition-colors duration-100 text-[var(--fl-tx)] text-sm active:bg-[var(--fl-s2)]">
                        <span className="text-lg mr-3 shrink-0"></span>
                        <span>Home</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[var(--fl-tx3)] shrink-0 ml-auto">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                </div>
            </section>

            <section className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[15px] font-bold text-[var(--fl-tx)] tracking-[-.2px]">Settings</h3>
                </div>
                <div className="bg-[var(--fl-s1)] border border-[var(--fl-bdr-s)] rounded-[16px] overflow-hidden mb-4">
                    <Link href={GroupController.index().url} className="flex items-center px-4 py-[14px] border-b border-[var(--fl-bdr-s)] last:border-b-0 cursor-pointer transition-colors duration-100 text-[var(--fl-tx)] text-sm active:bg-[var(--fl-s2)]">
                        <span className="text-lg mr-3 shrink-0">👥</span>
                        <span>Groups</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[var(--fl-tx3)] shrink-0 ml-auto">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                    <Link href="/app/user/cuisines" className="flex items-center px-4 py-[14px] border-b border-[var(--fl-bdr-s)] last:border-b-0 cursor-pointer transition-colors duration-100 text-[var(--fl-tx)] text-sm active:bg-[var(--fl-s2)]">
                        <span className="text-lg mr-3 shrink-0">🍜</span>
                        <span>Cuisines</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[var(--fl-tx3)] shrink-0 ml-auto">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                    <Link href="/app/user/locations" className="flex items-center px-4 py-[14px] border-b border-[var(--fl-bdr-s)] last:border-b-0 cursor-pointer transition-colors duration-100 text-[var(--fl-tx)] text-sm active:bg-[var(--fl-s2)]">
                        <span className="text-lg mr-3 shrink-0">📍</span>
                        <span>Locations</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[var(--fl-tx3)] shrink-0 ml-auto">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                    <Link href="/app/user/profile" className="flex items-center px-4 py-[14px] border-b border-[var(--fl-bdr-s)] last:border-b-0 cursor-pointer transition-colors duration-100 text-[var(--fl-tx)] text-sm active:bg-[var(--fl-s2)]">
                        <span className="text-lg mr-3 shrink-0">👤</span>
                        <span>Edit Profile</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[var(--fl-tx3)] shrink-0 ml-auto">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                    <Link href="/app/user/password" className="flex items-center px-4 py-[14px] border-b border-[var(--fl-bdr-s)] last:border-b-0 cursor-pointer transition-colors duration-100 text-[var(--fl-tx)] text-sm active:bg-[var(--fl-s2)]">
                        <span className="text-lg mr-3 shrink-0">🔒</span>
                        <span>Change Password</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[var(--fl-tx3)] shrink-0 ml-auto">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                    <button
                        type="button"
                        className="flex items-center px-4 py-[14px] border-b border-[var(--fl-bdr-s)] last:border-b-0 cursor-pointer transition-colors duration-100 text-[var(--fl-red)] text-sm active:bg-[var(--fl-s2)] w-full text-left"
                        onClick={() => {
                            router.post('/logout');
                        }}
                    >
                        <span className="text-lg mr-3 shrink-0">🚪</span>
                        <span>Sign Out</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[var(--fl-tx3)] shrink-0 ml-auto">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>
            </section>
        </div>
    );
}

Profile.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
