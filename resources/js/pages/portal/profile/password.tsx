import { Link, useForm } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import * as SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import PortalLayout from '@/layouts/portal/portal-layout';

export default function ChangePassword() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(SecurityController.update().url, {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
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
                    <h3 className="fl-fsec-ttl">Change Password</h3>

                    {recentlySuccessful && (
                        <div className="fl-toast-inline fl-toast-ok">Password updated.</div>
                    )}

                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="current_password">
                            Current Password <span className="fl-req">*</span>
                        </label>
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            className={`fl-fi${errors.current_password ? ' error' : ''}`}
                            type="password"
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                        {errors.current_password && <span className="fl-ferr">{errors.current_password}</span>}
                    </div>

                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="password">
                            New Password <span className="fl-req">*</span>
                        </label>
                        <input
                            id="password"
                            ref={passwordInput}
                            className={`fl-fi${errors.password ? ' error' : ''}`}
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        {errors.password && <span className="fl-ferr">{errors.password}</span>}
                    </div>

                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="password_confirmation">
                            Confirm Password <span className="fl-req">*</span>
                        </label>
                        <input
                            id="password_confirmation"
                            className={`fl-fi${errors.password_confirmation ? ' error' : ''}`}
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && <span className="fl-ferr">{errors.password_confirmation}</span>}
                    </div>
                </div>

                <div className="fl-factions">
                    <button type="submit" className="fl-btn fl-btn-p" disabled={processing}>
                        {processing ? 'Saving…' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
}

ChangePassword.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
