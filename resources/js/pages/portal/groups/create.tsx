import { useForm } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as GroupController from '@/actions/App/Http/Controllers/GroupController';
import PortalLayout from '@/layouts/portal/portal-layout';

export default function GroupsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(GroupController.store().url);
    }

    return (
        <form className="fl-view fl-form" onSubmit={handleSubmit}>
            <div className="fl-fsec">
                <h3 className="fl-fsec-ttl">Group Info</h3>

                <div className="fl-fgrp">
                    <label className="fl-flbl" htmlFor="name">Name *</label>
                    <input
                        id="name"
                        className={`fl-fi${errors.name ? ' error' : ''}`}
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Family Eats"
                        required
                        maxLength={100}
                        autoFocus
                    />
                    {errors.name && <span className="fl-ferr">{errors.name}</span>}
                </div>

                <div className="fl-fgrp">
                    <label className="fl-flbl" htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        className={`fl-fi fl-ftxt${errors.description ? ' error' : ''}`}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="A place to share our favorite spots and recipes…"
                        rows={3}
                        maxLength={500}
                    />
                    {errors.description && <span className="fl-ferr">{errors.description}</span>}
                </div>
            </div>

            <div className="fl-form-footer">
                <button type="submit" className="fl-btn fl-btn-p" disabled={processing}>
                    {processing ? 'Creating…' : 'Create Group'}
                </button>
            </div>
        </form>
    );
}

GroupsCreate.layout = (page: ReactNode) => (
    <PortalLayout title="New Group" showBack>
        {page}
    </PortalLayout>
);
