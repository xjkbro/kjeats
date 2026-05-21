import { router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as NutritionController from '@/actions/App/Http/Controllers/NutritionController';
import * as RecipeController from '@/actions/App/Http/Controllers/RecipeController';
import TagInput from '@/components/tag-input';
import PortalLayout from '@/layouts/portal/portal-layout';
import type { Recipe } from '@/types/portal';

interface Props {
    recipe: Recipe;
    all_tags: string[];
}

interface IngredientInput {
    amount: string;
    unit: string;
    name: string;
}

interface StepInput {
    instruction: string;
}

interface FormValues {
    emoji: string;
    name: string;
    category: string;
    difficulty: string;
    description: string;
    prep_time: string;
    cook_time: string;
    rest_time: string;
    servings: string;
    tags: string[];
    recipe_photo: File | null;
    ingredients: IngredientInput[];
    steps: StepInput[];
    has_nutrition: boolean;
    serving_size: string;
    servings_per_container: string;
    calories: string;
    total_fat_g: string;
    saturated_fat_g: string;
    trans_fat_g: string;
    cholesterol_mg: string;
    sodium_mg: string;
    total_carbohydrate_g: string;
    dietary_fiber_g: string;
    total_sugars_g: string;
    added_sugars_g: string;
    protein_g: string;
    vitamin_d_mcg: string;
    calcium_mg: string;
    iron_mg: string;
    potassium_mg: string;
}

const EMOJIS = ['📋', '🍕', '🍣', '🌮', '🍜', '🥩', '🥗', '🍔', '🥐', '🍱', '🍛', '🍝', '🥧', '🧁', '🍰'];
const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Drink', 'Side', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function RecipeEdit({ recipe, all_tags }: Props) {
    const n = recipe.nutrition;

    const { data, setData, put, processing, errors } = useForm<FormValues>({
        emoji: recipe.emoji,
        name: recipe.name,
        category: recipe.category,
        difficulty: recipe.difficulty,
        description: recipe.description ?? '',
        prep_time: String(recipe.prep_time),
        cook_time: String(recipe.cook_time),
        rest_time: String(recipe.rest_time),
        servings: String(recipe.servings),
        tags: recipe.tags,
        recipe_photo: null,
        ingredients: recipe.ingredients.map((i) => ({ amount: i.amount, unit: i.unit, name: i.name })),
        steps: recipe.steps.map((s) => ({ instruction: s.instruction })),
        has_nutrition: true,
        serving_size: n?.serving_size ?? '',
        servings_per_container: n?.servings_per_container != null ? String(n.servings_per_container) : '',
        calories: n?.calories != null ? String(n.calories) : '',
        total_fat_g: n?.total_fat_g ?? '',
        saturated_fat_g: n?.saturated_fat_g ?? '',
        trans_fat_g: n?.trans_fat_g ?? '',
        cholesterol_mg: n?.cholesterol_mg ?? '',
        sodium_mg: n?.sodium_mg ?? '',
        total_carbohydrate_g: n?.total_carbohydrate_g ?? '',
        dietary_fiber_g: n?.dietary_fiber_g ?? '',
        total_sugars_g: n?.total_sugars_g ?? '',
        added_sugars_g: n?.added_sugars_g ?? '',
        protein_g: n?.protein_g ?? '',
        vitamin_d_mcg: n?.vitamin_d_mcg ?? '',
        calcium_mg: n?.calcium_mg ?? '',
        iron_mg: n?.iron_mg ?? '',
        potassium_mg: n?.potassium_mg ?? '',
    });

    const photoRef = useRef<HTMLInputElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    async function calculateNutrition() {
        if (data.ingredients.length === 0) {
return;
}

        setAiLoading(true);
        setAiError('');

        try {
            const xsrfToken = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];
            const response = await fetch(NutritionController.calculate().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
                body: JSON.stringify({
                    name: data.name,
                    servings: parseInt(data.servings) || 4,
                    ingredients: data.ingredients,
                }),
            });
            const json = await response.json();

            if (!response.ok) {
                setAiError(json.error ?? 'Failed to calculate nutrition.');

                return;
            }

            setData((prev) => ({
                ...prev,
                has_nutrition: true,
                serving_size: json.serving_size != null ? String(json.serving_size) : prev.serving_size,
                servings_per_container: json.servings_per_container != null ? String(json.servings_per_container) : prev.servings_per_container,
                calories: json.calories != null ? String(json.calories) : prev.calories,
                total_fat_g: json.total_fat_g != null ? String(json.total_fat_g) : prev.total_fat_g,
                saturated_fat_g: json.saturated_fat_g != null ? String(json.saturated_fat_g) : prev.saturated_fat_g,
                trans_fat_g: json.trans_fat_g != null ? String(json.trans_fat_g) : prev.trans_fat_g,
                cholesterol_mg: json.cholesterol_mg != null ? String(json.cholesterol_mg) : prev.cholesterol_mg,
                sodium_mg: json.sodium_mg != null ? String(json.sodium_mg) : prev.sodium_mg,
                total_carbohydrate_g: json.total_carbohydrate_g != null ? String(json.total_carbohydrate_g) : prev.total_carbohydrate_g,
                dietary_fiber_g: json.dietary_fiber_g != null ? String(json.dietary_fiber_g) : prev.dietary_fiber_g,
                total_sugars_g: json.total_sugars_g != null ? String(json.total_sugars_g) : prev.total_sugars_g,
                added_sugars_g: json.added_sugars_g != null ? String(json.added_sugars_g) : prev.added_sugars_g,
                protein_g: json.protein_g != null ? String(json.protein_g) : prev.protein_g,
                vitamin_d_mcg: json.vitamin_d_mcg != null ? String(json.vitamin_d_mcg) : prev.vitamin_d_mcg,
                calcium_mg: json.calcium_mg != null ? String(json.calcium_mg) : prev.calcium_mg,
                iron_mg: json.iron_mg != null ? String(json.iron_mg) : prev.iron_mg,
                potassium_mg: json.potassium_mg != null ? String(json.potassium_mg) : prev.potassium_mg,
            }));
        } catch {
            setAiError('Network error. Please try again.');
        } finally {
            setAiLoading(false);
        }
    }

    function addIngredient() {
        setData('ingredients', [...data.ingredients, { amount: '', unit: '', name: '' }]);
    }

    function updateIngredient(idx: number, field: keyof IngredientInput, value: string) {
        const ingredients = [...data.ingredients];
        ingredients[idx] = { ...ingredients[idx], [field]: value };
        setData('ingredients', ingredients);
    }

    function removeIngredient(idx: number) {
        setData('ingredients', data.ingredients.filter((_, i) => i !== idx));
    }

    function addStep() {
        setData('steps', [...data.steps, { instruction: '' }]);
    }

    function updateStep(idx: number, value: string) {
        const steps = [...data.steps];
        steps[idx] = { instruction: value };
        setData('steps', steps);
    }

    function removeStep(idx: number) {
        setData('steps', data.steps.filter((_, i) => i !== idx));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(RecipeController.update(recipe.id).url, { replace: true });
    }

    function handleDelete() {
        if (!confirm(`Delete "${recipe.name}"? This cannot be undone.`)) {
            return;
        }

        router.delete(RecipeController.destroy(recipe.id).url);
    }

    return (
        <>
        <form id="recipe-edit-form" className="fl-view fl-form" onSubmit={submit}>
            <div className="fl-fsec">
                <h3 className="fl-fsec-ttl">Basic Information</h3>

                <div className="fl-fgrp fl-emoji-grp">
                    <label className="fl-flbl">Icon</label>
                    <button type="button" className="fl-emoji-btn" onClick={() => setShowEmojiPicker((v) => !v)}>
                        {data.emoji}
                    </button>
                    {showEmojiPicker && (
                        <div className="fl-emoji-picker">
                            {EMOJIS.map((e) => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() => {
                                        setData('emoji', e);
                                        setShowEmojiPicker(false);
                                    }}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="fl-fgrp">
                    <label className="fl-flbl" htmlFor="name">Recipe Name *</label>
                    <input
                        id="name"
                        className={`fl-fi${errors.name ? ' error' : ''}`}
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && <span className="fl-ferr">{errors.name}</span>}
                </div>

                <div className="fl-frow">
                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="category">Category</label>
                        <select id="category" className="fl-fi" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="fl-fgrp">
                        <label className="fl-flbl">Difficulty</label>
                        <div className="fl-seg">
                            {DIFFICULTIES.map((d) => (
                                <button key={d} type="button" className={`fl-seg-btn${data.difficulty === d ? ' active' : ''}`} onClick={() => setData('difficulty', d)}>
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="fl-fgrp">
                    <label className="fl-flbl" htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        className="fl-fi fl-ftxt"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="A short description of the recipe…"
                        rows={3}
                    />
                </div>

                <div className="fl-fgrp">
                    <label className="fl-flbl">Tags</label>
                    <TagInput
                        value={data.tags}
                        onChange={(tags) => setData('tags', tags)}
                        suggestions={all_tags}
                        placeholder="e.g. Vegetarian, Quick, Comfort Food"
                    />
                </div>

                <div className="fl-fgrp">
                    <label className="fl-flbl">Photo</label>
                    {recipe.images && recipe.images.length > 0 && !data.recipe_photo && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                            {recipe.images.map((img) => (
                                <img
                                    key={img.id}
                                    src={img.url}
                                    alt="Recipe photo"
                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--fl-rp)', border: '1px solid var(--fl-bdr)' }}
                                />
                            ))}
                        </div>
                    )}
                    <input
                        ref={photoRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => setData('recipe_photo', e.target.files?.[0] ?? null)}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="fl-btn fl-btn-ghost fl-btn-sm"
                            onClick={() => photoRef.current?.click()}
                        >
                            {recipe.images && recipe.images.length > 0 ? '📷 Add Another Photo' : '📷 Add Photo'}
                        </button>
                        {data.recipe_photo && (
                            <>
                                <span style={{ fontSize: '13px', color: 'var(--fl-tx2)' }}>{data.recipe_photo.name}</span>
                                <button
                                    type="button"
                                    className="fl-visit-chip-rm"
                                    onClick={() => {
                                        setData('recipe_photo', null);

                                        if (photoRef.current) {
photoRef.current.value = '';
}
                                    }}
                                >
                                    ✕
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="fl-fsec">
                <h3 className="fl-fsec-ttl">Timing &amp; Servings</h3>
                <div className="fl-frow fl-frow-4">
                    {[
                        { id: 'prep_time', label: 'Prep (min)', field: 'prep_time' as const },
                        { id: 'cook_time', label: 'Cook (min)', field: 'cook_time' as const },
                        { id: 'rest_time', label: 'Rest (min)', field: 'rest_time' as const },
                        { id: 'servings', label: 'Servings', field: 'servings' as const },
                    ].map(({ id, label, field }) => (
                        <div key={id} className="fl-fgrp">
                            <label className="fl-flbl" htmlFor={id}>{label}</label>
                            <input
                                id={id}
                                className="fl-fi"
                                type="number"
                                min="0"
                                value={data[field]}
                                onChange={(e) => setData(field, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="fl-fsec">
                <div className="fl-fsec-hdr">
                    <h3 className="fl-fsec-ttl">Ingredients</h3>
                    <button type="button" className="fl-btn fl-btn-ghost fl-btn-sm" onClick={addIngredient}>
                        + Add
                    </button>
                </div>
                {data.ingredients.map((ing, idx) => (
                    <div key={idx} className="fl-ing-form">
                        <div className="fl-fgrp" style={{ flex: '0 0 70px' }}>
                            <label className="fl-flbl">Amount</label>
                            <input className="fl-fi" type="text" value={ing.amount} onChange={(e) => updateIngredient(idx, 'amount', e.target.value)} placeholder="1" />
                        </div>
                        <div className="fl-fgrp" style={{ flex: '0 0 80px' }}>
                            <label className="fl-flbl">Unit</label>
                            <input className="fl-fi" type="text" value={ing.unit} onChange={(e) => updateIngredient(idx, 'unit', e.target.value)} placeholder="cup" />
                        </div>
                        <div className="fl-fgrp" style={{ flex: 1 }}>
                            <label className="fl-flbl">Ingredient</label>
                            <input className="fl-fi" type="text" value={ing.name} onChange={(e) => updateIngredient(idx, 'name', e.target.value)} placeholder="Flour" />
                        </div>
                        <button type="button" className="fl-dish-remove" onClick={() => removeIngredient(idx)}>✕</button>
                    </div>
                ))}
                {data.ingredients.length === 0 && <p className="fl-empty-inline">No ingredients added yet.</p>}
            </div>

            <div className="fl-fsec">
                <div className="fl-fsec-hdr">
                    <h3 className="fl-fsec-ttl">Instructions</h3>
                    <button type="button" className="fl-btn fl-btn-ghost fl-btn-sm" onClick={addStep}>
                        + Add Step
                    </button>
                </div>
                {data.steps.map((step, idx) => (
                    <div key={idx} className="fl-step-form">
                        <div className="fl-step-num-badge">{idx + 1}</div>
                        <div className="fl-fgrp" style={{ flex: 1 }}>
                            <textarea
                                className="fl-fi fl-ftxt"
                                value={step.instruction}
                                onChange={(e) => updateStep(idx, e.target.value)}
                                placeholder={`Describe step ${idx + 1}…`}
                                rows={2}
                            />
                        </div>
                        <button type="button" className="fl-dish-remove" onClick={() => removeStep(idx)}>✕</button>
                    </div>
                ))}
                {data.steps.length === 0 && <p className="fl-empty-inline">No steps added yet.</p>}
            </div>

            <div className="fl-fsec">
                <div className="fl-fsec-hdr">
                    <h3 className="fl-fsec-ttl">Nutrition Facts</h3>
                    <button
                        type="button"
                        className="fl-btn fl-btn-sm fl-btn-sec"
                        disabled={aiLoading || data.ingredients.length === 0}
                        onClick={calculateNutrition}
                        title={data.ingredients.length === 0 ? 'Add ingredients first' : 'Calculate nutrition with AI'}
                    >
                        {aiLoading ? 'Calculating…' : '✨ Calculate'}
                    </button>
                </div>
                {aiError && <p style={{ color: 'var(--fl-red)', fontSize: '13px', marginBottom: '8px' }}>{aiError}</p>}
                <div className="fl-nutrition-form">
                    <div className="fl-nutr-serving-row">
                        <div className="fl-fgrp">
                            <label className="fl-flbl">Serving Size</label>
                            <input className="fl-fi" type="text" value={data.serving_size} onChange={(e) => setData('serving_size', e.target.value)} placeholder="e.g. 1 slice (85g)" />
                        </div>
                        <div className="fl-fgrp">
                            <label className="fl-flbl">Servings / Container</label>
                            <input className="fl-fi" type="number" value={data.servings_per_container} onChange={(e) => setData('servings_per_container', e.target.value)} max={99999} />
                        </div>
                    </div>
                    <div className="fl-nutr-label">
                        <div className="fl-nutr-label-hdr">Per serving</div>
                        <div className="fl-nutr-row fl-nutr-bold">
                            <span>Calories</span>
                            <input type="number" step="any" max={99999} value={data.calories} onChange={(e) => setData('calories', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row fl-nutr-bold">
                            <span>Total Fat (g)</span>
                            <input type="number" step="any" max={99999} value={data.total_fat_g} onChange={(e) => setData('total_fat_g', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row fl-nutr-sub">
                            <span>Saturated Fat (g)</span>
                            <input type="number" step="any" max={99999} value={data.saturated_fat_g} onChange={(e) => setData('saturated_fat_g', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row fl-nutr-sub">
                            <span>Trans Fat (g)</span>
                            <input type="number" step="any" max={99999} value={data.trans_fat_g} onChange={(e) => setData('trans_fat_g', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row fl-nutr-bold">
                            <span>Cholesterol (mg)</span>
                            <input type="number" step="any" max={99999} value={data.cholesterol_mg} onChange={(e) => setData('cholesterol_mg', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row fl-nutr-bold">
                            <span>Sodium (mg)</span>
                            <input type="number" step="any" max={99999} value={data.sodium_mg} onChange={(e) => setData('sodium_mg', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row fl-nutr-bold">
                            <span>Total Carbohydrate (g)</span>
                            <input type="number" step="any" max={99999} value={data.total_carbohydrate_g} onChange={(e) => setData('total_carbohydrate_g', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row fl-nutr-sub">
                            <span>Dietary Fiber (g)</span>
                            <input type="number" step="any" max={99999} value={data.dietary_fiber_g} onChange={(e) => setData('dietary_fiber_g', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row fl-nutr-sub">
                            <span>Total Sugars (g)</span>
                            <input type="number" step="any" max={99999} value={data.total_sugars_g} onChange={(e) => setData('total_sugars_g', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row fl-nutr-sub">
                            <span>Added Sugars (g)</span>
                            <input type="number" step="any" max={99999} value={data.added_sugars_g} onChange={(e) => setData('added_sugars_g', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row fl-nutr-bold">
                            <span>Protein (g)</span>
                            <input type="number" step="any" max={99999} value={data.protein_g} onChange={(e) => setData('protein_g', e.target.value)} />
                        </div>
                        <div className="fl-nutr-label-hdr" style={{ borderTop: '1px solid var(--fl-bdr-s)' }}>Micronutrients</div>
                        <div className="fl-nutr-row">
                            <span>Vitamin D (mcg)</span>
                            <input type="number" step="any" max={99999} value={data.vitamin_d_mcg} onChange={(e) => setData('vitamin_d_mcg', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row">
                            <span>Calcium (mg)</span>
                            <input type="number" step="any" max={99999} value={data.calcium_mg} onChange={(e) => setData('calcium_mg', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row">
                            <span>Iron (mg)</span>
                            <input type="number" step="any" max={99999} value={data.iron_mg} onChange={(e) => setData('iron_mg', e.target.value)} />
                        </div>
                        <div className="fl-nutr-row">
                            <span>Potassium (mg)</span>
                            <input type="number" step="any" max={99999} value={data.potassium_mg} onChange={(e) => setData('potassium_mg', e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

        </form>
        <div className="fl-form-footer">
            <button type="button" className="fl-btn fl-btn-danger" style={{ marginRight: 'auto' }} onClick={handleDelete}>
                Delete
            </button>
            <button type="button" className="fl-btn fl-btn-sec" onClick={() => router.visit(RecipeController.show(recipe.id).url)}>
                Discard
            </button>
            <button type="submit" form="recipe-edit-form" className="fl-btn fl-btn-p" disabled={processing}>
                {processing ? 'Saving…' : 'Save Changes'}
            </button>
        </div>
        </>
    );
}

RecipeEdit.layout = (page: ReactNode) => <PortalLayout showBack title="Edit Recipe">{page}</PortalLayout>;
