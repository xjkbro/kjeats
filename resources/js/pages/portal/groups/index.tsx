import { router, useForm } from '@inertiajs/react';
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
                    <a href={GroupController.create().url} className="fl-btn fl-btn-p fl-btn-sm">
                        + New
                    </a>
                </div>
            </div>

            {showJoin && (
                <form className="fl-fsec" onSubmit={submitJoin}>
                    <h3 className="fl-fsec-ttl">Join with Invite Code</h3>
                    <div className="fl-frow">
                        <div className="fl-fgrp" style={{ flex: 1 }}>
                            <input
                                className={`fl-fi${errors.invite_code ? ' error' : ''}`}
                                type="text"
                                value={data.invite_code}
                                onChange={(e) => setData('invite_code', e.target.value.toUpperCase())}
                                placeholder="XXXXXXXX"
                                maxLength={10}
                                style={{ letterSpacing: '0.15em', fontFamily: 'monospace' }}
                            />
                            {errors.invite_code && <span className="fl-ferr">{errors.invite_code}</span>}
                        </div>
                        <button type="submit" className="fl-btn fl-btn-p" disabled={processing} style={{ alignSelf: 'flex-end' }}>
                            Join
                        </button>
                    </div>
                </form>
            )}

            {groups.length > 0 ? (
                <div className="fl-card-list">
                    {groups.map((group) => (
                        <div key={group.id} className="fl-card" style={{ alignItems: 'flex-start' }}>
                            <div className="fl-card-emoji">👥</div>
                            <div className="fl-card-body" style={{ flex: 1 }}>
                                <a href={GroupController.show(group.id).url} className="fl-card-name" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                                    {group.name}
                                </a>
                                {group.description && <div className="fl-card-sub">{group.description}</div>}
                                <div className="fl-card-meta" style={{ marginTop: '6px' }}>
                                    <span className="fl-badge fl-badge-def">{group.group_members_count} members</span>
                                    <span className="fl-badge fl-badge-org">{group.restaurants_count} reviews</span>
                                    <span className="fl-badge fl-badge-teal">{group.recipes_count} recipes</span>
                                </div>
                                <div style={{ marginTop: '8px' }}>
                                    <code style={{ fontSize: '11px', background: 'var(--surface-alt)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.1em' }}>
                                        {group.invite_code}
                                    </code>
                                </div>
                            </div>
                            <button
                                className="fl-btn fl-btn-ghost fl-btn-sm"
                                style={{ color: 'var(--text-muted)', marginTop: '2px' }}
                                onClick={() => handleLeave(group)}
                            >
                                Leave
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="fl-empty">
                    <span>👥</span>
                    <p>No groups yet</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Create a group to share restaurant reviews and recipes with friends or family.</p>
                    <a href={GroupController.create().url} className="fl-btn fl-btn-p">
                        Create a Group
                    </a>
                </div>
            )}
        </div>
    );
}

GroupsIndex.layout = (page: ReactNode) => <PortalLayout title="Groups">{page}</PortalLayout>;
