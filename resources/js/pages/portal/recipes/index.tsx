import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import * as RecipeController from '@/actions/App/Http/Controllers/RecipeController';
import PortalLayout from '@/layouts/portal/portal-layout';
import { index as recipesIndexRoute } from '@/routes/recipes';
import type { Recipe } from '@/types/portal';

interface Props {
    recipes: Recipe[];
    groups: { id: number; name: string }[];
    scope: string;
}

const ALL = 'All';

export default function RecipesIndex({ recipes, groups, scope }: Props) {
    const categories = [ALL, ...Array.from(new Set(recipes.map((r) => r.category)))];
    const difficulties = ['Easy', 'Medium', 'Hard'];

    const [catFilter, setCatFilter] = useState(ALL);
    const [diffFilter, setDiffFilter] = useState('');

    const filtered = recipes.filter((r) => {
        if (catFilter !== ALL && r.category !== catFilter) {
            return false;
        }

        if (diffFilter && r.difficulty !== diffFilter) {
            return false;
        }

        return true;
    });

    function setScope(newScope: string) {
        router.get(
            recipesIndexRoute.url({ query: { scope: newScope } }),
            {},
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }

    return (
        <div className="fl-view">
            <div className="fl-view-hdr">
                <h2 className="fl-view-ttl">Recipes</h2>
                <Link href={RecipeController.create().url} className="fl-btn fl-btn-p fl-btn-sm">
                    + Add
                </Link>
            </div>

            {groups.length > 0 && (
                <div className="fl-scope-toggle">
                    <button
                        className={`fl-scope-btn${scope === 'mine' ? ' active' : ''}`}
                        onClick={() => setScope('mine')}
                    >
                        Mine
                    </button>
                    {groups.map((g) => (
                        <button
                            key={g.id}
                            className={`fl-scope-btn${scope === String(g.id) ? ' active' : ''}`}
                            onClick={() => setScope(String(g.id))}
                        >
                            {g.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="fl-filters">
                <select className="fl-filter-sel" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c === ALL ? 'All Categories' : c}</option>
                    ))}
                </select>
                <select className="fl-filter-sel" value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)}>
                    <option value="">Any Difficulty</option>
                    {difficulties.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {filtered.length > 0 ? (
                <div className="fl-card-list">
                    {filtered.map((recipe) => {
                        const totalTime = recipe.prep_time + recipe.cook_time + recipe.rest_time;

                        return (
                            <Link key={recipe.id} href={RecipeController.show(recipe.id).url} className="fl-card">
                                <div className="fl-card-emoji">{recipe.emoji}</div>
                                <div className="fl-card-body">
                                    <div className="fl-card-name">{recipe.name}</div>
                                    <div className="fl-card-meta">
                                        <span className={`fl-badge fl-badge-${recipe.difficulty === 'Easy' ? 'grn' : recipe.difficulty === 'Hard' ? 'red' : 'gold'}`}>
                                            {recipe.difficulty}
                                        </span>
                                        <span className="fl-badge fl-badge-teal">{totalTime} min</span>
                                        <span className="fl-badge fl-badge-def">{recipe.servings} servings</span>
                                    </div>
                                    <div className="fl-card-sub">
                                        {recipe.category} · {recipe.ingredients.length} ingredients
                                    </div>
                                    {recipe.tags.length > 0 && (
                                        <div className="fl-card-tags">
                                            {recipe.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="fl-badge fl-badge-def">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <svg className="fl-card-chev" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="fl-empty">
                    <span>📋</span>
                    <p>{catFilter !== ALL || diffFilter ? 'No matching recipes' : 'No recipes yet'}</p>
                    {catFilter === ALL && !diffFilter && (
                        <Link href={RecipeController.create().url} className="fl-btn fl-btn-p">
                            Add your first recipe
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}

RecipesIndex.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
