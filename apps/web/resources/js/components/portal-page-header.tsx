import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

interface PortalPageHeaderProps {
    title: ReactNode;
    addHref?: string;
    groups?: { id: number; name: string }[];
    scope?: string;
    onScopeChange?: (scope: string) => void;
}

export default function PortalPageHeader({ title, addHref, groups = [], scope, onScopeChange }: PortalPageHeaderProps) {
    return (
        <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-[22px] font-black text-[var(--fl-tx)] tracking-[-.5px] leading-[1.2] shrink-0">{title}</h1>
                {groups.length > 0 && onScopeChange && (
                    <select
                        value={scope ?? 'mine'}
                        onChange={(e) => onScopeChange(e.target.value)}
                        className="text-xs font-semibold text-[var(--fl-tx2)] bg-[var(--fl-s2)] border border-[var(--fl-bdr)] rounded-full px-3 py-1.5 pr-6 cursor-pointer focus:outline-none focus:border-[var(--fl-p)] transition-colors duration-100"
                    >
                        <option value="mine">Mine</option>
                        {groups.map((g) => (
                            <option key={g.id} value={String(g.id)}>{g.name}</option>
                        ))}
                    </select>
                )}
            </div>
            {addHref && (
                <Link
                    href={addHref}
                    className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)] shrink-0"
                >
                    + Add
                </Link>
            )}
        </div>
    );
}
