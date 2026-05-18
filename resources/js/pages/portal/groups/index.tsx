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
        <div className="fl-view">
            <div className="fl-view-hdr">
                <h2 className="fl-view-ttl">Groups</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="fl-btn fl-btn-sec fl-btn-sm" onClick={() => setShowJoin((v) => !v)}>
                        Join
                    </button>
                    <Link href={GroupController.create().url} className="fl-btn fl-btn-p fl-btn-sm">
                        + New
                    </Link>
                </div>
            </div>

            {showJoin && (
                <form onSubmit={submitJoin} style={{ marginBottom: '16px' }}>
                    <p className="fl-flbl" style={{ marginBottom: '8px' }}>Join with invite code</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            className={`fl-fi${errors.invite_code ? ' error' : ''}`}
                            type="text"
                            value={data.invite_code}
                            onChange={(e) => setData('invite_code', e.target.value.toUpperCase())}
                            placeholder="XXXXXXXX"
                            maxLength={10}
                            style={{ flex: 1, letterSpacing: '0.15em', fontFamily: 'monospace' }}
                            autoFocus
                        />
                        <button type="submit" className="fl-btn fl-btn-p fl-btn-sm" disabled={processing || !data.invite_code.trim()}>
                            {processing ? '…' : 'Join'}
                        </button>
                    </div>
                    {errors.invite_code && <span className="fl-ferr">{errors.invite_code}</span>}
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
                                className="fl-btn fl-btn-ghost fl-btn-sm"
                                onClick={() => handleLeave(group)}
                            >
                                Leave
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="fl-empty">
                    <span className="fl-empty-ico">👥</span>
                    <p className="fl-empty-ttl">No groups yet</p>
                    <p className="fl-empty-desc">Create a group to share restaurant reviews and recipes with friends or family.</p>
                    <Link href={GroupController.create().url} className="fl-btn fl-btn-p">
                        Create a Group
                    </Link>
                </div>
            )}
        </div>
    );
}

GroupsIndex.layout = (page: ReactNode) => <PortalLayout title="Groups">{page}</PortalLayout>;

