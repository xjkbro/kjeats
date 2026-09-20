import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import * as RecipeController from '@/actions/App/Http/Controllers/RecipeController';
import PortalLayout from '@/layouts/portal/portal-layout';
import PortalPageHeader from '@/components/portal-page-header';
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
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <PortalPageHeader
                title="Recipes"
                addHref={RecipeController.create().url}
                groups={groups}
                scope={scope}
                onScopeChange={setScope}
            />

            <div className="flex gap-2 mb-[14px]">
                <select className="flex-1 bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-full px-[13px] py-[7px] pr-[30px] text-sm font-semibold text-[var(--fl-tx2)] cursor-pointer whitespace-nowrap transition-colors duration-100 focus:outline-none focus:border-[var(--fl-p)]" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c === ALL ? 'All Categories' : c}</option>
                    ))}
                </select>
                <select className="flex-1 bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-full px-[13px] py-[7px] pr-[30px] text-sm font-semibold text-[var(--fl-tx2)] cursor-pointer whitespace-nowrap transition-colors duration-100 focus:outline-none focus:border-[var(--fl-p)]" value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)}>
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
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${recipe.difficulty === 'Easy' ? 'bg-[var(--fl-grn-d)] text-[var(--fl-grn)]' : recipe.difficulty === 'Hard' ? 'bg-[var(--fl-red-d)] text-[var(--fl-red)]' : 'bg-[var(--fl-gld-d)] text-[var(--fl-gold)]'}`}>
                                            {recipe.difficulty}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-[var(--fl-tel-d)] text-[var(--fl-teal)]">{totalTime} min</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-[var(--fl-s3)] text-[var(--fl-tx2)]">{recipe.servings} servings</span>
                                    </div>
                                    <div className="fl-card-sub">
                                        {recipe.category} · {recipe.ingredients.length} ingredients
                                    </div>
                                    {recipe.tags.length > 0 && (
                                        <div className="flex gap-[5px] flex-wrap mt-[6px]">
                                            {recipe.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-[var(--fl-s3)] text-[var(--fl-tx2)]">{tag}</span>
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
                <div className="flex flex-col items-center px-4 py-12 text-center">
                    <span>📋</span>
                    <p>{catFilter !== ALL || diffFilter ? 'No matching recipes' : 'No recipes yet'}</p>
                    {catFilter === ALL && !diffFilter && (
                        <Link href={RecipeController.create().url} className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]">
                            Add your first recipe
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}

RecipesIndex.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
