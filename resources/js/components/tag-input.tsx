import { useRef, useState } from 'react';

interface Props {
    value: string[];
    onChange: (tags: string[]) => void;
    suggestions?: string[];
    placeholder?: string;
}

export default function TagInput({ value, onChange, suggestions = [], placeholder = 'Add a tag…' }: Props) {
    const [input, setInput] = useState('');
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = suggestions
        .filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s))
        .slice(0, 8);

    function addTag(tag: string) {
        const t = tag.trim();
        if (t && !value.includes(t)) {
            onChange([...value, t]);
        }
        setInput('');
        setOpen(false);
        inputRef.current?.focus();
    }

    function removeTag(tag: string) {
        onChange(value.filter((t) => t !== tag));
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim()) {
                addTag(input);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
        } else if (e.key === 'Backspace' && !input && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    }

    return (
        <div className="fl-tag-input">
            {value.length > 0 && (
                <div className="fl-tag-chips">
                    {value.map((tag) => (
                        <span key={tag} className="fl-visit-chip">
                            {tag}
                            <button type="button" className="fl-visit-chip-rm" onClick={() => removeTag(tag)}>
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <div className="fl-tag-row">
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        ref={inputRef}
                        className="fl-fi"
                        style={{ flex: 1 }}
                        type="text"
                        value={input}
                        placeholder={value.length === 0 ? placeholder : 'Add another…'}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setOpen(e.target.value.length > 0);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (input) setOpen(true);
                        }}
                        onBlur={() => setTimeout(() => setOpen(false), 150)}
                    />
                    <button
                        type="button"
                        className="fl-btn fl-btn-sec fl-btn-sm"
                        disabled={!input.trim()}
                        onMouseDown={(e) => { e.preventDefault(); if (input.trim()) addTag(input); }}
                    >
                        Add
                    </button>
                </div>
                {open && filtered.length > 0 && (
                    <ul className="fl-tag-suggestions">
                        {filtered.map((s) => (
                            <li key={s} className="fl-tag-suggestion-item" onMouseDown={() => addTag(s)}>
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
