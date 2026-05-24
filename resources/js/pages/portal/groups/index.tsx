import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import * as GroupController from '@/actions/App/Http/Controllers/GroupController';
import PortalLayout from '@/layouts/portal/portal-layout';
import type { Group } from '@/types/portal';

interface Props {
    groups: (Group & { group_members_count: number; restaurants_count: number; recipes_count: number })[];
}

export default function GroupsIndex({ groups }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({ invite_code: '' });
    const [showJoin, setShowJoin] = useState(false);

    function submitJoin(e: React.FormEvent) {
        e.preventDefault();
        post(GroupController.join().url, {
            onSuccess: () => {
                reset();
                setShowJoin(false);
            },
        });
    }

    function handleLeave(group: Group) {
        if (!confirm(`Leave "${group.name}"?`)) {
            return;
        }

        router.delete(GroupController.leave(group.id).url);
    }

    return (
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <div className="flex items-center justify-between gap-3 mb-5">
                <h2 className="text-[22px] font-black text-[var(--fl-tx)] tracking-[-.5px] leading-[1.2]">Groups</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-[var(--fl-s2)] text-[var(--fl-tx)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s3)] active:scale-[.97]" onClick={() => setShowJoin((v) => !v)}>
                        Join
                    </button>
                    <Link href={GroupController.create().url} className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]">
                        + New
                    </Link>
                </div>
            </div>

            {showJoin && (
                <form onSubmit={submitJoin} className="mb-4">
                    <p className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" style={{ marginBottom: '8px' }}>Join with invite code</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            className={`w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none${errors.invite_code ? ' border-[var(--fl-red)] shadow-[0_0_0_3px_var(--fl-red-d)]' : ''}`}
                            type="text"
                            value={data.invite_code}
                            onChange={(e) => setData('invite_code', e.target.value.toUpperCase())}
                            placeholder="XXXXXXXX"
                            maxLength={10}
                            style={{ flex: 1, letterSpacing: '0.15em', fontFamily: 'monospace' }}
                            autoFocus
                        />
                        <button type="submit" className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]" disabled={processing || !data.invite_code.trim()}>
                            {processing ? '…' : 'Join'}
                        </button>
                    </div>
                    {errors.invite_code && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.invite_code}</span>}
                </form>
            )}

            {groups.length > 0 ? (
                <div className="fl-card-list">
                    {groups.map((group) => (
                        <div key={group.id} className="fl-card" style={{ cursor: 'default' }}>
                            <Link
                                href={GroupController.show(group.id).url}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="fl-card-emoji">👥</div>
                                <div className="fl-card-body">
                                    <div className="fl-card-name">{group.name}</div>
                                    {group.description && <div className="fl-card-sub" style={{ marginBottom: '5px' }}>{group.description}</div>}
                                    <div className="fl-card-meta">
                                        <span className="fl-badge fl-badge-def">{group.group_members_count} member{group.group_members_count !== 1 ? 's' : ''}</span>
                                        <span className="fl-badge fl-badge-org">{group.restaurants_count} review{group.restaurants_count !== 1 ? 's' : ''}</span>
                                        <span className="fl-badge fl-badge-teal">{group.recipes_count} recipe{group.recipes_count !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </Link>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-none whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] active:bg-[var(--fl-s2)] active:scale-[.97]"
                                onClick={() => handleLeave(group)}
                            >
                                Leave
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-[40px] text-[var(--fl-tx3)]">
                    <div className="text-3xl mb-2">👥</div>
                    <p className="text-sm font-semibold text-[var(--fl-tx2)] mb-1">No groups yet</p>
                    <p className="text-xs text-[var(--fl-tx3)] mb-4">Create a group to share restaurant reviews and recipes with friends or family.</p>
                    <Link href={GroupController.create().url} className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]">
                        Create a Group
                    </Link>
                </div>
            )}
        </div>
    );
}

GroupsIndex.layout = (page: ReactNode) => <PortalLayout title="Groups">{page}</PortalLayout>;
