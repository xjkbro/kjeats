import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as NutritionController from '@/actions/App/Http/Controllers/NutritionController';
import * as RecipeController from '@/actions/App/Http/Controllers/RecipeController';
import RecipeImportController from '@/actions/App/Http/Controllers/RecipeImportController';
import TagInput from '@/components/tag-input';
import PortalLayout from '@/layouts/portal/portal-layout';

interface Props {
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

export default function RecipeCreate({ all_tags }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormValues>({
        emoji: '📋',
        name: '',
        category: 'Dinner',
        difficulty: 'Medium',
        description: '',
        prep_time: '15',
        cook_time: '30',
        rest_time: '0',
        servings: '4',
        tags: [],
        recipe_photo: null,
        ingredients: [],
        steps: [],
        has_nutrition: true,
        serving_size: '',
        servings_per_container: '',
        calories: '',
        total_fat_g: '',
        saturated_fat_g: '',
        trans_fat_g: '',
        cholesterol_mg: '',
        sodium_mg: '',
        total_carbohydrate_g: '',
        dietary_fiber_g: '',
        total_sugars_g: '',
        added_sugars_g: '',
        protein_g: '',
        vitamin_d_mcg: '',
        calcium_mg: '',
        iron_mg: '',
        potassium_mg: '',
    });

    const photoRef = useRef<HTMLInputElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [importOpen, setImportOpen] = useState(false);
    const [importUrl, setImportUrl] = useState('');
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState('');

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

    async function importFromUrl() {
        if (!importUrl.trim()) {
return;
}

        setImportLoading(true);
        setImportError('');

        try {
            const xsrfToken = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];
            const response = await fetch(RecipeImportController.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
                body: JSON.stringify({ url: importUrl }),
            });
            const json = await response.json();

            if (!response.ok) {
                setImportError(json.error ?? 'Failed to import recipe.');

                return;
            }

            setImportOpen(false);
            setImportUrl('');
            setImportLoading(false);
            setData((prev) => ({
                ...prev,
                emoji: json.emoji || '📋',
                name: json.name || prev.name,
                category: json.category || prev.category,
                difficulty: json.difficulty || prev.difficulty,
                description: json.description || prev.description,
                prep_time: json.prep_time != null ? String(json.prep_time) : prev.prep_time,
                cook_time: json.cook_time != null ? String(json.cook_time) : prev.cook_time,
                rest_time: json.rest_time != null ? String(json.rest_time) : prev.rest_time,
                servings: json.servings != null ? String(json.servings) : prev.servings,
                tags: Array.isArray(json.tags) ? json.tags : prev.tags,
                ingredients: json.ingredients ?? prev.ingredients,
                steps: json.steps ?? prev.steps,
            }));
        } catch {
            setImportError('Network error. Please try again.');
            setImportLoading(false);
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(RecipeController.store().url);
    }

    return (
        <>
        <form id="recipe-create-form" className="p-4 lg:p-7 kj-anim-viewin" onSubmit={submit}>
            <div className="mb-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Basic Information</h3>
                    <button type="button" className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-none whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] active:bg-[var(--fl-s2)] active:scale-[.97]" onClick={() => setImportOpen(true)}>
                        📥 Import URL
                    </button>
                </div>

                <div className="mb-3 relative flex flex-wrap items-center gap-3">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px] w-full">Icon</label>
                    <button type="button" className="w-[44px] h-[44px] rounded-xl bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] text-xl flex items-center justify-center cursor-pointer hover:border-[var(--fl-p)] transition-colors" onClick={() => setShowEmojiPicker((v) => !v)}>
                        {data.emoji}
                    </button>
                    {showEmojiPicker && (
                        <div className="flex gap-1 p-2 bg-[var(--fl-s2)] rounded-xl border border-[var(--fl-bdr-s)]">
                            {EMOJIS.map((e) => (
                                <button
                                    key={e}
                                    type="button"
                                    className="w-[36px] h-[36px] rounded-lg text-lg flex items-center justify-center hover:bg-[var(--fl-s3)] cursor-pointer border-none"
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

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="name">Recipe Name <span className="text-[var(--fl-red)] ml-[2px]">*</span></label>
                    <input
                        id="name"
                        className={`w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none${errors.name ? ' border-[var(--fl-red)] shadow-[0_0_0_3px_var(--fl-red-d)]' : ''}`}
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Margherita Pizza"
                        required
                    />
                    {errors.name && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.name}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="category">Category</label>
                        <select id="category" className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Difficulty</label>
                        <div className="fl-seg">
                            {DIFFICULTIES.map((d) => (
                                <button key={d} type="button" className={`fl-seg-btn${data.difficulty === d ? ' active' : ''}`} onClick={() => setData('difficulty', d)}>
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none resize-vertical min-h-[80px]"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="A short description of the recipe…"
                        rows={3}
                    />
                </div>

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Tags</label>
                    <TagInput
                        value={data.tags}
                        onChange={(tags) => setData('tags', tags)}
                        suggestions={all_tags}
                        placeholder="e.g. Vegetarian, Quick, Comfort Food"
                    />
                </div>

                <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Photo</label>
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
                            className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-none whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] active:bg-[var(--fl-s2)] active:scale-[.97]"
                            onClick={() => photoRef.current?.click()}
                        >
                            {data.recipe_photo ? '📷 Change Photo' : '📷 Add Photo'}
                        </button>
                        {data.recipe_photo && (
                            <>
                                <span style={{ fontSize: '13px', color: 'var(--fl-tx2)' }}>{data.recipe_photo.name}</span>
                                <button
                                    type="button"
                                    className="w-[22px] h-[22px] rounded-full bg-[var(--fl-s3)] border-none text-[var(--fl-tx2)] text-[10px] cursor-pointer flex items-center justify-center hover:bg-[var(--fl-red-d)] hover:text-[var(--fl-red)] shrink-0"
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

            <div className="mb-6">
                <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Timing &amp; Servings</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { id: 'prep_time', label: 'Prep (min)', field: 'prep_time' as const },
                        { id: 'cook_time', label: 'Cook (min)', field: 'cook_time' as const },
                        { id: 'rest_time', label: 'Rest (min)', field: 'rest_time' as const },
                        { id: 'servings', label: 'Servings', field: 'servings' as const },
                    ].map(({ id, label, field }) => (
                        <div key={id} className="mb-3 relative">
                            <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor={id}>{label}</label>
                            <input
                                id={id}
                                className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none"
                                type="number"
                                min="0"
                                value={data[field]}
                                onChange={(e) => setData(field, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Ingredients</h3>
                    <button type="button" className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-none whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] active:bg-[var(--fl-s2)] active:scale-[.97]" onClick={addIngredient}>
                        + Add
                    </button>
                </div>
                {data.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2 items-end mb-2">
                        <div className="mb-3 relative" style={{ flex: '0 0 70px' }}>
                            <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Amount</label>
                            <input className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none" type="text" value={ing.amount} onChange={(e) => updateIngredient(idx, 'amount', e.target.value)} placeholder="1" />
                        </div>
                        <div className="mb-3 relative" style={{ flex: '0 0 80px' }}>
                            <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Unit</label>
                            <input className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none" type="text" value={ing.unit} onChange={(e) => updateIngredient(idx, 'unit', e.target.value)} placeholder="cup" />
                        </div>
                        <div className="mb-3 relative" style={{ flex: 1 }}>
                            <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Ingredient</label>
                            <input className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none" type="text" value={ing.name} onChange={(e) => updateIngredient(idx, 'name', e.target.value)} placeholder="Flour" />
                        </div>
                        <button type="button" className="w-[30px] h-[30px] min-w-[30px] rounded-lg bg-transparent border-none text-[var(--fl-tx3)] text-sm cursor-pointer flex items-center justify-center hover:bg-[var(--fl-red-d)] hover:text-[var(--fl-red)] mt-[26px]" onClick={() => removeIngredient(idx)}>✕</button>
                    </div>
                ))}
                {data.ingredients.length === 0 && <p className="text-xs text-[var(--fl-tx3)] italic px-1">No ingredients added yet.</p>}
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Instructions</h3>
                    <button type="button" className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-none whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] active:bg-[var(--fl-s2)] active:scale-[.97]" onClick={addStep}>
                        + Add Step
                    </button>
                </div>
                {data.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-start mb-3">
                        <div className="w-[28px] h-[28px] min-w-[28px] rounded-full bg-[var(--fl-p-dim)] text-[var(--fl-p)] text-xs font-bold flex items-center justify-center mt-[10px]">{idx + 1}</div>
                        <div className="mb-3 relative" style={{ flex: 1 }}>
                            <textarea
                                className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none resize-vertical min-h-[80px]"
                                value={step.instruction}
                                onChange={(e) => updateStep(idx, e.target.value)}
                                placeholder={`Describe step ${idx + 1}…`}
                                rows={2}
                            />
                        </div>
                        <button type="button" className="w-[30px] h-[30px] min-w-[30px] rounded-lg bg-transparent border-none text-[var(--fl-tx3)] text-sm cursor-pointer flex items-center justify-center hover:bg-[var(--fl-red-d)] hover:text-[var(--fl-red)] mt-[26px]" onClick={() => removeStep(idx)}>✕</button>
                    </div>
                ))}
                {data.steps.length === 0 && <p className="text-xs text-[var(--fl-tx3)] italic px-1">No steps added yet.</p>}
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Nutrition Facts</h3>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-[var(--fl-s2)] text-[var(--fl-tx)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s3)] active:scale-[.97]"
                        disabled={aiLoading || data.ingredients.length === 0}
                        onClick={calculateNutrition}
                        title={data.ingredients.length === 0 ? 'Add ingredients first' : 'Calculate nutrition with AI'}
                    >
                        {aiLoading ? 'Calculating…' : '✨ Calculate'}
                    </button>
                </div>
                {aiError && <p style={{ color: 'var(--fl-red)', fontSize: '13px', marginBottom: '8px' }}>{aiError}</p>}
                <div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="mb-3 relative">
                            <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Serving Size</label>
                            <input className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none" type="text" value={data.serving_size} onChange={(e) => setData('serving_size', e.target.value)} placeholder="e.g. 1 slice (85g)" />
                        </div>
                        <div className="mb-3 relative">
                            <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]">Servings / Container</label>
                            <input className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none" type="number" value={data.servings_per_container} onChange={(e) => setData('servings_per_container', e.target.value)} max={99999} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between gap-3 py-[6px] px-0 border-b border-[var(--fl-bdr-s)] text-sm">
                            <span>Calories</span>
                            <input type="number" step="any" max={99999} value={data.calories} onChange={(e) => setData('calories', e.target.value)} />
                        </div>
                        {([
                            ['Total Fat (g)', 'total_fat_g'],
                            ['Saturated Fat (g)', 'saturated_fat_g'],
                            ['Trans Fat (g)', 'trans_fat_g'],
                            ['Cholesterol (mg)', 'cholesterol_mg'],
                            ['Sodium (mg)', 'sodium_mg'],
                            ['Total Carbohydrate (g)', 'total_carbohydrate_g'],
                            ['Dietary Fiber (g)', 'dietary_fiber_g'],
                            ['Total Sugars (g)', 'total_sugars_g'],
                            ['Added Sugars (g)', 'added_sugars_g'],
                            ['Protein (g)', 'protein_g'],
                            ['Vitamin D (mcg)', 'vitamin_d_mcg'],
                            ['Calcium (mg)', 'calcium_mg'],
                            ['Iron (mg)', 'iron_mg'],
                            ['Potassium (mg)', 'potassium_mg'],
                        ] as [string, keyof FormValues][]).map(([label, field]) => (
                            <div key={field} className="flex items-center justify-between gap-3 py-[6px] px-0 border-b border-[var(--fl-bdr-s)] text-sm">
                                <span>{label}</span>
                                <input
                                    type="number"
                                    step="any"
                                    max={99999}
                                    value={data[field] as string}
                                    onChange={(e) => setData(field, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {importOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => {
 setImportOpen(false); setImportError('');
}}>
                    <div className="bg-[var(--fl-s1)] rounded-t-2xl w-full max-w-lg p-6 flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="w-10 h-1 bg-[var(--fl-tx3)] rounded-full mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-[var(--fl-tx)] mb-4">Import Recipe from URL</h2>
                        <p style={{ fontSize: '13px', color: 'var(--fl-tx2)', marginBottom: '14px', lineHeight: '1.5' }}>
                            Paste a link to a recipe from any cooking website. Our AI will extract the ingredients, steps, and details.
                        </p>
                        <div className="mb-3 relative">
                            <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="import-url">Recipe URL</label>
                            <input
                                id="import-url"
                                className="w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none"
                                type="url"
                                value={importUrl}
                                onChange={(e) => setImportUrl(e.target.value)}
                                placeholder="https://example.com/recipe"
                                autoFocus
                            />
                        </div>
                        {importError && <p style={{ color: 'var(--fl-red)', fontSize: '13px', marginBottom: '10px' }}>{importError}</p>}
                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)] w-full"
                            disabled={importLoading || !importUrl.trim()}
                            onClick={importFromUrl}
                        >
                            {importLoading ? 'Importing…' : '✨ Import Recipe'}
                        </button>
                        <button type="button" className="text-sm text-[var(--fl-tx2)] text-center mt-3 bg-transparent border-none cursor-pointer hover:text-[var(--fl-tx)]" onClick={() => {
 setImportOpen(false); setImportError('');
}}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </form>
        <div className="fl-form-footer">
            <button type="submit" form="recipe-create-form" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]" disabled={processing}>
                {processing ? 'Saving…' : 'Save Recipe'}
            </button>
        </div>
        </>
    );
}

RecipeCreate.layout = (page: ReactNode) => <PortalLayout showBack title="Add Recipe">{page}</PortalLayout>;
