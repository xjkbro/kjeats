import { Link, useForm, router } from '@inertiajs/react';
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
                className="fl-btn fl-btn-ghost fl-btn-sm"
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
        <div className="fl-view">
            <div className="fl-hero">
                <div className="fl-hero-emoji">{recipe.emoji}</div>
                <h1 className="fl-hero-name">{recipe.name}</h1>
                <div className="fl-hero-meta">
                    <span className={`fl-badge fl-badge-${recipe.difficulty === 'Easy' ? 'grn' : recipe.difficulty === 'Hard' ? 'red' : 'gold'}`}>
                        {recipe.difficulty}
                    </span>
                    <span className="fl-badge fl-badge-teal">{recipe.category}</span>
                    {recipe.tags.map((t) => (
                        <span key={t} className="fl-badge fl-badge-def">{t}</span>
                    ))}
                </div>

            </div>

            <div className="fl-info-grid fl-recipe-grid">
                <div className="fl-info-item">
                    <div className="fl-info-ico">⏱️</div>
                    <div className="fl-info-body">
                        <div className="fl-info-lbl">Prep</div>
                        <div className="fl-info-val">{recipe.prep_time} min</div>
                    </div>
                </div>
                <div className="fl-info-item">
                    <div className="fl-info-ico">🔥</div>
                    <div className="fl-info-body">
                        <div className="fl-info-lbl">Cook</div>
                        <div className="fl-info-val">{recipe.cook_time} min</div>
                    </div>
                </div>
                {recipe.rest_time > 0 && (
                    <div className="fl-info-item">
                        <div className="fl-info-ico">💤</div>
                        <div className="fl-info-body">
                            <div className="fl-info-lbl">Rest</div>
                            <div className="fl-info-val">{recipe.rest_time} min</div>
                        </div>
                    </div>
                )}
                <div className="fl-info-item">
                    <div className="fl-info-ico">⏰</div>
                    <div className="fl-info-body">
                        <div className="fl-info-lbl">Total</div>
                        <div className="fl-info-val">{totalTime} min</div>
                    </div>
                </div>
                <div className="fl-info-item">
                    <div className="fl-info-ico">🍽️</div>
                    <div className="fl-info-body">
                        <div className="fl-info-lbl">Servings</div>
                        <div className="fl-info-val">{recipe.servings}</div>
                    </div>
                </div>
            </div>

            {recipe.description && (
                <div className="fl-quote">
                    <div className="fl-quote-mark">"</div>
                    <p>{recipe.description}</p>
                </div>
            )}

            {(recipe.images.length > 0 || recipe.user_id === current_user_id) && (
                <section className="fl-section">
                    <div className="fl-section-hdr">
                        <h3 className="fl-section-ttl">Photos</h3>
                        {recipe.user_id === current_user_id && (
                            <ImageUploadForm action={MediaController.storeRecipe(recipe.id).url} />
                        )}
                    </div>
                    <ImageGallery images={recipe.images} />
                </section>
            )}

            {recipe.ingredients.length > 0 && (
                <section className="fl-section">
                    <div className="fl-section-hdr">
                        <h3 className="fl-section-ttl">Ingredients ({recipe.ingredients.length})</h3>
                    </div>
                    <div className="fl-ing-disp">
                        {recipe.ingredients.map((ing) => (
                            <div key={ing.id} className="fl-ing-item">
                                <div className="fl-ing-dot" />
                                <span className="fl-ing-amount">{ing.amount} {ing.unit}</span>
                                <span className="fl-ing-name">{ing.name}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {recipe.steps.length > 0 && (
                <section className="fl-section">
                    <div className="fl-section-hdr">
                        <h3 className="fl-section-ttl">Instructions</h3>
                    </div>
                    <div className="fl-steps">
                        {recipe.steps.map((step) => (
                            <div key={step.id} className="fl-step">
                                <div className="fl-step-num">{step.step_number}</div>
                                <p className="fl-step-txt">{step.instruction}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {recipe.nutrition && (
                <section className="fl-section">
                    <div className="fl-section-hdr">
                        <h3 className="fl-section-ttl">Nutrition Facts</h3>
                    </div>
                    <NutritionLabel nutrition={recipe.nutrition} />
                </section>
            )}

            <div className="fl-actions">
                <Link href={RecipeController.edit(recipe.id).url} className="fl-btn fl-btn-sec">
                    Edit Recipe
                </Link>
                <button className="fl-btn fl-btn-danger" onClick={handleDelete}>
                    Delete
                </button>
            </div>

            {recipe.revisions && recipe.revisions.length > 0 && (
                <section className="fl-section">
                    <div className="fl-section-hdr">
                        <h3 className="fl-section-ttl">History ({recipe.revisions.length})</h3>
                    </div>
                    <div className="fl-revision-list">
                        {recipe.revisions.map((revision: Revision, i: number) => {
                            const afterSnap: Record<string, unknown> = i === 0
                                ? { name: recipe.name, emoji: recipe.emoji, category: recipe.category, difficulty: recipe.difficulty, description: recipe.description, prep_time: recipe.prep_time, cook_time: recipe.cook_time, rest_time: recipe.rest_time, servings: recipe.servings, tags: recipe.tags, ingredients: recipe.ingredients, steps: recipe.steps }
                                : (recipe.revisions![i - 1].snapshot as Record<string, unknown>);
                            const changes = diffSnapshots(revision.snapshot as Record<string, unknown>, afterSnap, RECIPE_FIELDS);

                            return (
                                <div key={revision.id} className="fl-revision-row">
                                    <div className="fl-revision-meta">
                                        <span className="fl-revision-user">{revision.user.name}</span>
                                        <span className="fl-revision-time">
                                            {new Date(revision.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    {changes.length > 0 ? (
                                        <div className="fl-revision-changes">
                                            {changes.map((c) => (
                                                <div key={c.label} className="fl-revision-change">
                                                    <span className="fl-revision-field">{c.label}</span>
                                                    <span className="fl-revision-old">{c.before}</span>
                                                    <span className="fl-revision-arrow">&rarr;</span>
                                                    <span className="fl-revision-new">{c.after}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="fl-revision-summary">{revision.summary}</div>
                                    )}
                                    <button
                                        className="fl-btn fl-btn-ghost fl-btn-sm"
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
