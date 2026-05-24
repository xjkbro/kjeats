import { useForm, router } from '@inertiajs/react';
import React from 'react';
import type { ReactNode } from 'react';
import * as MediaController from '@/actions/App/Http/Controllers/MediaController';
import * as RecipeController from '@/actions/App/Http/Controllers/RecipeController';
import * as RevisionController from '@/actions/App/Http/Controllers/RevisionController';
import PortalLayout from '@/layouts/portal/portal-layout';
import type { MediaItem, Recipe, RecipeNutrition, Revision } from '@/types/portal';

type DiffEntry = { label: string; before: string; after: string };

function parseRaw(v: unknown): unknown {
    if (typeof v === 'string') {
        try {
            return JSON.parse(v);
        } catch {
            return v;
        }
    }

    return v;
}

const COUNT_KEYS = new Set(['ingredients', 'steps']);

function cmpVal(key: string, raw: unknown): string {
    const v = parseRaw(raw);

    if (COUNT_KEYS.has(key)) {
        return String(Array.isArray(v) ? v.length : Number(v));
    }

    if (Array.isArray(v)) {
        return JSON.stringify(v);
    }

    return String(v ?? '');
}

function fmtVal(key: string, raw: unknown): string {
    const v = parseRaw(raw);

    if (v === null || v === undefined || v === '') {
        return '—';
    }

    if (COUNT_KEYS.has(key)) {
        const n = Array.isArray(v) ? v.length : Number(v);

        return `${n}`;
    }

    if (Array.isArray(v)) {
        return v.length === 0 ? '(none)' : v.map(String).join(', ');
    }

    const s = String(v);

    return s.length > 80 ? s.slice(0, 80) + '…' : s;
}

function diffSnapshots(
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    fields: { key: string; label: string }[],
): DiffEntry[] {
    return fields.flatMap(({ key, label }) => {
        if (cmpVal(key, before[key]) === cmpVal(key, after[key])) {
            return [];
        }

        return [{ label, before: fmtVal(key, before[key]), after: fmtVal(key, after[key]) }];
    });
}

const RECIPE_FIELDS = [
    { key: 'name', label: 'Name' },
    { key: 'emoji', label: 'Emoji' },
    { key: 'category', label: 'Category' },
    { key: 'difficulty', label: 'Difficulty' },
    { key: 'description', label: 'Description' },
    { key: 'prep_time', label: 'Prep time' },
    { key: 'cook_time', label: 'Cook time' },
    { key: 'rest_time', label: 'Rest time' },
    { key: 'servings', label: 'Servings' },
    { key: 'tags', label: 'Tags' },
    { key: 'ingredients', label: 'Ingredients' },
    { key: 'steps', label: 'Steps' },
];

interface Props {
    recipe: Recipe;
    current_user_id: number;
}

function NutritionLabel({ nutrition }: { nutrition: RecipeNutrition }) {
    return (
        <div className="fl-nf">
            <div className="fl-nf-title">Nutrition Facts</div>
            {nutrition.servings_per_container && (
                <div className="fl-nf-servings">{nutrition.servings_per_container} servings per container</div>
            )}
            {nutrition.serving_size && (
                <div className="fl-nf-serving-size">
                    <span>Serving size</span>
                    <span>{nutrition.serving_size}</span>
                </div>
            )}
            <div className="fl-nf-calories-bar">
                <div>
                    <div className="fl-nf-cal-label">Amount Per Serving</div>
                    <div className="fl-nf-cal-heading">Calories</div>
                </div>
                <div className="fl-nf-cal-val">{nutrition.calories}</div>
            </div>
            <div className="fl-nf-dv-header">% Daily Value*</div>
            {nutrition.total_fat_g && (
                <div className="fl-nf-row">
                    <span><strong>Total Fat</strong> {nutrition.total_fat_g}g</span>
                    {nutrition.total_fat_pct && <span>{nutrition.total_fat_pct}%</span>}
                </div>
            )}
            {nutrition.saturated_fat_g && (
                <div className="fl-nf-row fl-nf-indent">
                    <span>Saturated Fat {nutrition.saturated_fat_g}g</span>
                    {nutrition.saturated_fat_pct && <span>{nutrition.saturated_fat_pct}%</span>}
                </div>
            )}
            {nutrition.trans_fat_g && (
                <div className="fl-nf-row fl-nf-indent">
                    <span><em>Trans</em> Fat {nutrition.trans_fat_g}g</span>
                </div>
            )}
            {nutrition.cholesterol_mg && (
                <div className="fl-nf-row">
                    <span><strong>Cholesterol</strong> {nutrition.cholesterol_mg}mg</span>
                    {nutrition.cholesterol_pct && <span>{nutrition.cholesterol_pct}%</span>}
                </div>
            )}
            {nutrition.sodium_mg && (
                <div className="fl-nf-row">
                    <span><strong>Sodium</strong> {nutrition.sodium_mg}mg</span>
                    {nutrition.sodium_pct && <span>{nutrition.sodium_pct}%</span>}
                </div>
            )}
            {nutrition.total_carbohydrate_g && (
                <div className="fl-nf-row">
                    <span><strong>Total Carbohydrate</strong> {nutrition.total_carbohydrate_g}g</span>
                    {nutrition.total_carbohydrate_pct && <span>{nutrition.total_carbohydrate_pct}%</span>}
                </div>
            )}
            {nutrition.dietary_fiber_g && (
                <div className="fl-nf-row fl-nf-indent">
                    <span>Dietary Fiber {nutrition.dietary_fiber_g}g</span>
                    {nutrition.dietary_fiber_pct && <span>{nutrition.dietary_fiber_pct}%</span>}
                </div>
            )}
            {nutrition.total_sugars_g && (
                <div className="fl-nf-row fl-nf-indent">
                    <span>Total Sugars {nutrition.total_sugars_g}g</span>
                </div>
            )}
            {nutrition.added_sugars_g && (
                <div className="fl-nf-row fl-nf-indent2">
                    <span>Includes {nutrition.added_sugars_g}g Added Sugars</span>
                    {nutrition.added_sugars_pct && <span>{nutrition.added_sugars_pct}%</span>}
                </div>
            )}
            {nutrition.protein_g && (
                <div className="fl-nf-row fl-nf-thick">
                    <span><strong>Protein</strong> {nutrition.protein_g}g</span>
                </div>
            )}
            <div className="fl-nf-divider-thick" />
            {nutrition.vitamin_d_mcg && (
                <div className="fl-nf-row fl-nf-micro">
                    <span>Vitamin D {nutrition.vitamin_d_mcg}mcg</span>
                    {nutrition.vitamin_d_pct && <span>{nutrition.vitamin_d_pct}%</span>}
                </div>
            )}
            {nutrition.calcium_mg && (
                <div className="fl-nf-row fl-nf-micro">
                    <span>Calcium {nutrition.calcium_mg}mg</span>
                    {nutrition.calcium_pct && <span>{nutrition.calcium_pct}%</span>}
                </div>
            )}
            {nutrition.iron_mg && (
                <div className="fl-nf-row fl-nf-micro">
                    <span>Iron {nutrition.iron_mg}mg</span>
                    {nutrition.iron_pct && <span>{nutrition.iron_pct}%</span>}
                </div>
            )}
            {nutrition.potassium_mg && (
                <div className="fl-nf-row fl-nf-micro">
                    <span>Potassium {nutrition.potassium_mg}mg</span>
                    {nutrition.potassium_pct && <span>{nutrition.potassium_pct}%</span>}
                </div>
            )}
            <div className="fl-nf-footnote">
                * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
            </div>
        </div>
    );
}

function ImageGallery({ images }: { images: MediaItem[] }) {
    if (images.length === 0) {
        return null;
    }

    return (
        <div className="fl-img-gallery">
            {images.map((img) => (
                <a key={img.id} href={img.url} target="_blank" rel="noreferrer" className="fl-img-thumb">
                    <img src={img.url} alt={img.original_name} />
                </a>
            ))}
        </div>
    );
}

function ImageUploadForm({ action }: { action: string }) {
    const form = useForm<{ image: File | null }>({ image: null });
    const inputRef = React.useRef<HTMLInputElement>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;

        if (!file) {
return;
}

        form.setData('image', file);
        form.post(action, { forceFormData: true, preserveScroll: true, onSuccess: () => {
            form.reset();

            if (inputRef.current) {
inputRef.current.value = '';
}
        }});
    }

    return (
        <>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
            <button
                type="button"
                className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-none whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] active:bg-[var(--fl-s2)] active:scale-[.97]"
                disabled={form.processing}
                onClick={() => inputRef.current?.click()}
            >
                {form.processing ? 'Uploading…' : '📷 Photo'}
            </button>
        </>
    );
}

export default function RecipeShow({ recipe, current_user_id }: Props) {
    const totalTime = recipe.prep_time + recipe.cook_time + recipe.rest_time;

    function handleDelete() {
        if (!confirm(`Delete "${recipe.name}"? This cannot be undone.`)) {
            return;
        }

        router.delete(RecipeController.destroy(recipe.id).url);
    }

    return (
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="text-5xl leading-none mb-2">{recipe.emoji}</div>
                <h1 className="text-2xl font-bold text-[var(--fl-tx)] tracking-tight mb-2">{recipe.name}</h1>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className={`fl-badge fl-badge-${recipe.difficulty === 'Easy' ? 'grn' : recipe.difficulty === 'Hard' ? 'red' : 'gold'}`}>
                        {recipe.difficulty}
                    </span>
                    <span className="fl-badge fl-badge-teal">{recipe.category}</span>
                    {recipe.tags.map((t) => (
                        <span key={t} className="fl-badge fl-badge-def">{t}</span>
                    ))}
                </div>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                <div className="flex items-center gap-3 bg-[var(--fl-s2)] rounded-xl p-4">
                    <div className="text-2xl leading-none">⏱️</div>
                    <div>
                        <div className="text-xs text-[var(--fl-tx2)]">Prep</div>
                        <div className="text-sm font-semibold text-[var(--fl-tx)]">{recipe.prep_time} min</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-[var(--fl-s2)] rounded-xl p-4">
                    <div className="text-2xl leading-none">🔥</div>
                    <div>
                        <div className="text-xs text-[var(--fl-tx2)]">Cook</div>
                        <div className="text-sm font-semibold text-[var(--fl-tx)]">{recipe.cook_time} min</div>
                    </div>
                </div>
                {recipe.rest_time > 0 && (
                    <div className="flex items-center gap-3 bg-[var(--fl-s2)] rounded-xl p-4">
                        <div className="text-2xl leading-none">💤</div>
                        <div>
                            <div className="text-xs text-[var(--fl-tx2)]">Rest</div>
                            <div className="text-sm font-semibold text-[var(--fl-tx)]">{recipe.rest_time} min</div>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-3 bg-[var(--fl-s2)] rounded-xl p-4">
                    <div className="text-2xl leading-none">⏰</div>
                    <div>
                        <div className="text-xs text-[var(--fl-tx2)]">Total</div>
                        <div className="text-sm font-semibold text-[var(--fl-tx)]">{totalTime} min</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-[var(--fl-s2)] rounded-xl p-4">
                    <div className="text-2xl leading-none">🍽️</div>
                    <div>
                        <div className="text-xs text-[var(--fl-tx2)]">Servings</div>
                        <div className="text-sm font-semibold text-[var(--fl-tx)]">{recipe.servings}</div>
                    </div>
                </div>
            </div>

            {recipe.description && (
                <div className="bg-[var(--fl-s2)] border-l-4 border-[var(--fl-bdr)] rounded-xl p-5 mb-6 italic text-[var(--fl-tx2)]">
                    <div className="text-4xl leading-none text-[var(--fl-bdr)] mb-2">"</div>
                    <p>{recipe.description}</p>
                </div>
            )}

            {(recipe.images.length > 0 || recipe.user_id === current_user_id) && (
                <section className="mb-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Photos</h3>
                        {recipe.user_id === current_user_id && (
                            <ImageUploadForm action={MediaController.storeRecipe(recipe.id).url} />
                        )}
                    </div>
                    <ImageGallery images={recipe.images} />
                </section>
            )}

            {recipe.ingredients.length > 0 && (
                <section className="mb-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Ingredients ({recipe.ingredients.length})</h3>
                    </div>
                    <div className="space-y-1">
                        {recipe.ingredients.map((ing) => (
                            <div key={ing.id} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--fl-bdr)] shrink-0" />
                                <span className="text-sm text-[var(--fl-tx2)]">{ing.amount} {ing.unit}</span>
                                <span className="text-sm font-medium text-[var(--fl-tx)]">{ing.name}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {recipe.steps.length > 0 && (
                <section className="mb-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Instructions</h3>
                    </div>
                    <div className="space-y-3">
                        {recipe.steps.map((step) => (
                            <div key={step.id} className="flex gap-3">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--fl-s3)] text-xs font-bold text-[var(--fl-tx2)] shrink-0 mt-0.5">{step.step_number}</div>
                                <p className="text-sm text-[var(--fl-tx)] leading-relaxed">{step.instruction}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {recipe.nutrition && (
                <section className="mb-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Nutrition Facts</h3>
                    </div>
                    <NutritionLabel nutrition={recipe.nutrition} />
                </section>
            )}

            <div className="flex gap-[10px] mt-8 pt-6 border-t border-[var(--fl-bdr-s)]">
                <button className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-[var(--fl-s2)] text-[var(--fl-tx)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s3)] active:scale-[.97]" onClick={() => router.visit(RecipeController.edit(recipe.id).url, { replace: true })}>
                    Edit Recipe
                </button>
                <button className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-[var(--fl-red-d)] text-[var(--fl-red)] border-[rgba(255,69,96,.3)] active:bg-[rgba(255,69,96,.25)] active:scale-[.97]" onClick={handleDelete}>
                    Delete
                </button>
            </div>

            {recipe.revisions && recipe.revisions.length > 0 && (
                <section className="mb-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">History ({recipe.revisions.length})</h3>
                    </div>
                    <div className="space-y-3">
                        {recipe.revisions.map((revision: Revision, i: number) => {
                            const afterSnap: Record<string, unknown> = i === 0
                                ? { name: recipe.name, emoji: recipe.emoji, category: recipe.category, difficulty: recipe.difficulty, description: recipe.description, prep_time: recipe.prep_time, cook_time: recipe.cook_time, rest_time: recipe.rest_time, servings: recipe.servings, tags: recipe.tags, ingredients: recipe.ingredients, steps: recipe.steps }
                                : (recipe.revisions![i - 1].snapshot as Record<string, unknown>);
                            const changes = diffSnapshots(revision.snapshot as Record<string, unknown>, afterSnap, RECIPE_FIELDS);

                            return (
                                <div key={revision.id} className="bg-[var(--fl-s2)] rounded-xl p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-[var(--fl-tx)]">{revision.user.first_name}</span>
                                        <span className="text-xs text-[var(--fl-tx2)]">
                                            {new Date(revision.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    {changes.length > 0 ? (
                                        <div className="space-y-1">
                                            {changes.map((c) => (
                                                <div key={c.label} className="flex items-center gap-2 text-sm flex-wrap">
                                                    <span className="font-semibold text-[var(--fl-tx)] min-w-[100px]">{c.label}</span>
                                                    <span className="text-[var(--fl-red)] line-through text-sm">{c.before}</span>
                                                    <span className="text-[var(--fl-tx3)] text-xs">&rarr;</span>
                                                    <span className="text-[var(--fl-grn)] text-sm">{c.after}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-[var(--fl-tx2)] italic">{revision.summary}</div>
                                    )}
                                    <button
                                        className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-none whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] active:bg-[var(--fl-s2)] active:scale-[.97]"
                                        onClick={() => {
                                            if (confirm('Revert to this version?')) {
                                                router.post(RevisionController.revert(revision.id).url);
                                            }
                                        }}
                                    >
                                        Revert
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}

RecipeShow.layout = (page: ReactNode) => <PortalLayout showBack title="Recipe">{page}</PortalLayout>;
