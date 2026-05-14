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

    function handleRemoveMember(member: GroupMember & { user: { id: number; name: string; email: string } }) {
        if (!confirm(`Remove ${member.user.name} from the group?`)) {
            return;
        }

        router.delete(GroupController.removeMember({ group: group.id, userId: member.user_id }).url);
    }

    return (
        <div className="fl-view">
            <div className="fl-hero">
                <div className="fl-hero-emoji">👥</div>
                <h1 className="fl-hero-name">{group.name}</h1>
                {group.description && <p className="fl-hero-sub">{group.description}</p>}
                <div className="fl-hero-meta">
                    <span className="fl-badge fl-badge-def">
                        {group.group_members.length}/{maxMembers} members
                    </span>
                </div>
            </div>

            <div className="fl-info-grid">
                <div className="fl-info-item">
                    <div className="fl-info-ico">🔑</div>
                    <div className="fl-info-body">
                        <div className="fl-info-lbl">Invite Code</div>
                        <div className="fl-info-val">
                            <code style={{ letterSpacing: '0.15em', fontFamily: 'monospace', background: 'var(--surface-alt)', padding: '2px 6px', borderRadius: '4px' }}>
                                {group.invite_code}
                            </code>
                        </div>
                    </div>
                </div>
                <div className="fl-info-item">
                    <div className="fl-info-ico">📍</div>
                    <div className="fl-info-body">
                        <div className="fl-info-lbl">Reviews</div>
                        <div className="fl-info-val">{group.restaurants.length}</div>
                    </div>
                </div>
                <div className="fl-info-item">
                    <div className="fl-info-ico">📋</div>
                    <div className="fl-info-body">
                        <div className="fl-info-lbl">Recipes</div>
                        <div className="fl-info-val">{group.recipes.length}</div>
                    </div>
                </div>
            </div>

            <section className="fl-section">
                <h3 className="fl-section-ttl">Members</h3>
                <div className="fl-member-list">
                    {group.group_members.map((member) => (
                        <div key={member.id} className="fl-member-row">
                            <div className="fl-avatar fl-avatar-sm">{getInitials(member.user.name)}</div>
                            <div className="fl-member-body">
                                <div className="fl-member-name">{member.user.name}</div>
                                <div className="fl-member-email">{member.user.email}</div>
                            </div>
                            <span className={`fl-badge ${member.role === 'owner' ? 'fl-badge-org' : 'fl-badge-def'}`}>
                                {member.role}
                            </span>
                            {isOwner && member.role !== 'owner' && (
                                <button
                                    className="fl-btn fl-btn-ghost fl-btn-sm"
                                    style={{ color: 'var(--text-muted)' }}
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
                <section className="fl-section">
                    <h3 className="fl-section-ttl">Restaurant Reviews ({group.restaurants.length})</h3>
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
                <section className="fl-section">
                    <h3 className="fl-section-ttl">Recipes ({group.recipes.length})</h3>
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

            <div className="fl-actions">
                <button className="fl-btn fl-btn-danger" onClick={handleLeave}>
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
