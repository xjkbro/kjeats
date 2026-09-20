import { router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as GroupController from '@/actions/App/Http/Controllers/GroupController';
import PortalLayout from '@/layouts/portal/portal-layout';
import type { Group, GroupMember, Restaurant, Recipe } from '@/types/portal';

interface Props {
    group: Group & {
        group_members: (GroupMember & { user: { id: number; name: string; email: string } })[];
        restaurants: Restaurant[];
        recipes: Recipe[];
    };
    isOwner: boolean;
    maxMembers: number;
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function GroupsShow({ group, isOwner, maxMembers }: Props) {
    function handleLeave() {
        if (!confirm(`Leave "${group.name}"? You will lose access to the group's shared content.`)) {
            return;
        }

        router.delete(GroupController.leave(group.id).url);
    }

    function handleRemoveMember(member: GroupMember & { user: { id: number; first_name: string; email: string } }) {
        if (!confirm(`Remove ${member.user.first_name} from the group?`)) {
            return;
        }

        router.delete(GroupController.removeMember({ group: group.id, userId: member.user_id }).url);
    }

    return (
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="text-5xl leading-none mb-2">👥</div>
                <h1 className="text-2xl font-bold text-[var(--fl-tx)] tracking-tight mb-2">{group.name}</h1>
                {group.description && <p className="text-sm text-[var(--fl-tx2)] mb-2 max-w-md">{group.description}</p>}
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="fl-badge fl-badge-def">
                        {group.group_members.length}/{maxMembers} members
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="flex items-center gap-3 bg-[var(--fl-s2)] rounded-xl p-4">
                    <div className="text-2xl leading-none">🔑</div>
                    <div>
                        <div className="text-xs text-[var(--fl-tx2)]">Invite Code</div>
                        <div className="text-sm font-semibold text-[var(--fl-tx)]">
                            <code style={{ letterSpacing: '0.15em', fontFamily: 'monospace', background: 'var(--fl-s3)', padding: '2px 6px', borderRadius: '4px' }}>
                                {group.invite_code}
                            </code>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-[var(--fl-s2)] rounded-xl p-4">
                    <div className="text-2xl leading-none">📍</div>
                    <div>
                        <div className="text-xs text-[var(--fl-tx2)]">Reviews</div>
                        <div className="text-sm font-semibold text-[var(--fl-tx)]">{group.restaurants.length}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-[var(--fl-s2)] rounded-xl p-4">
                    <div className="text-2xl leading-none">📋</div>
                    <div>
                        <div className="text-xs text-[var(--fl-tx2)]">Recipes</div>
                        <div className="text-sm font-semibold text-[var(--fl-tx)]">{group.recipes.length}</div>
                    </div>
                </div>
            </div>

            <section className="mb-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Members ({group.group_members.length})</h3>
                </div>
                <div className="space-y-[2px]">
                    {group.group_members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 px-3 py-3 bg-[var(--fl-s2)] rounded-xl">
                            <div className="w-[34px] h-[34px] min-w-[34px] rounded-full bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white text-xs font-bold flex items-center justify-center">
                                {getInitials(member.user.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[var(--fl-tx)] truncate">{member.user.name}</div>
                                <div className="text-xs text-[var(--fl-tx2)] truncate">{member.user.email}</div>
                            </div>
                            <span className={`fl-badge ${member.role === 'owner' ? 'fl-badge-org' : 'fl-badge-def'}`}>
                                {member.role}
                            </span>
                            {isOwner && member.role !== 'owner' && (
                                <button
                                    className="inline-flex items-center justify-center gap-[7px] px-[14px] py-2 rounded-xl text-sm font-semibold tracking-[-.2px] cursor-pointer border-none whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] hover:bg-[var(--fl-red-d)] hover:text-[var(--fl-red)] active:scale-[.97]"
                                    onClick={() => handleRemoveMember(member)}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {group.restaurants.length > 0 && (
                <section className="mb-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Restaurant Reviews ({group.restaurants.length})</h3>
                    </div>
                    <div className="fl-card-list">
                        {group.restaurants.map((r) => (
                            <a key={r.id} href={`/app/restaurants/${r.id}`} className="fl-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="fl-card-emoji">{r.emoji}</div>
                                <div className="fl-card-body">
                                    <div className="fl-card-name">{r.name}</div>
                                    <div className="fl-card-sub">{r.cuisine} · {r.location}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {group.recipes.length > 0 && (
                <section className="mb-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Recipes ({group.recipes.length})</h3>
                    </div>
                    <div className="fl-card-list">
                        {group.recipes.map((recipe) => (
                            <a key={recipe.id} href={`/app/recipes/${recipe.id}`} className="fl-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="fl-card-emoji">{recipe.emoji}</div>
                                <div className="fl-card-body">
                                    <div className="fl-card-name">{recipe.name}</div>
                                    <div className="fl-card-sub">{recipe.category} · {recipe.difficulty}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            <div className="flex gap-[10px] mt-8 pt-6 border-t border-[var(--fl-bdr-s)]">
                <button className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-[var(--fl-red-d)] text-[var(--fl-red)] border-[rgba(255,69,96,.3)] active:bg-[rgba(255,69,96,.25)] active:scale-[.97]" onClick={handleLeave}>
                    Leave Group
                </button>
            </div>
        </div>
    );
}

GroupsShow.layout = (page: ReactNode) => (
    <PortalLayout title="Group" showBack>
        {page}
    </PortalLayout>
);
