import { Link, useForm, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import PortalLayout from '@/layouts/portal/portal-layout';
import type { Auth } from '@/types';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function EditProfile({ mustVerifyEmail, status }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        _portal: true as boolean,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(ProfileController.update().url, { preserveScroll: true });
    }

    return (
        <div className="fl-view">
            <Link href="/profile" className="fl-back-btn">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Profile
            </Link>

            <form className="fl-form" onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
                <div className="fl-fsec">
                    <h3 className="fl-fsec-ttl">Edit Profile</h3>

                    {recentlySuccessful && (
                        <div className="fl-toast-inline fl-toast-ok">Profile updated.</div>
                    )}

                    {status && (
                        <div className="fl-toast-inline fl-toast-ok">{status}</div>
                    )}

                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="name">
                            Name <span className="fl-req">*</span>
                        </label>
                        <input
                            id="name"
                            className={`fl-fi${errors.name ? ' error' : ''}`}
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                        {errors.name && <span className="fl-ferr">{errors.name}</span>}
                    </div>

                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="email">
                            Email <span className="fl-req">*</span>
                        </label>
                        <input
                            id="email"
                            className={`fl-fi${errors.email ? ' error' : ''}`}
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        {errors.email && <span className="fl-ferr">{errors.email}</span>}
                    </div>

                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                        <p className="fl-verify-note">Your email address is unverified.</p>
                    )}
                </div>

                <div className="fl-factions">
                    <button type="submit" className="fl-btn fl-btn-p" disabled={processing}>
                        {processing ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

EditProfile.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
