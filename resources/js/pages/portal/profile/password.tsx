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
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <Link href="/app/profile" className="flex items-center justify-center w-[34px] h-[34px] bg-[var(--fl-s2)] rounded-xl text-[var(--fl-tx)] shrink-0 transition-all duration-100 active:bg-[var(--fl-s3)] active:scale-[.92]" style={{ width: 'auto', padding: '0 8px', gap: 4 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Profile
            </Link>

            <form className="pb-[calc(var(--fl-nav-h)+var(--fl-safe)+80px)] lg:pb-[100px]" onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
                <div className="mb-6">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">Change Password</h3>

                    {recentlySuccessful && (
                        <div className="text-sm font-semibold px-[14px] py-[10px] rounded-xl mb-3 bg-[color-mix(in_srgb,var(--fl-grn)_12%,transparent)] text-[var(--fl-grn)] border border-[color-mix(in_srgb,var(--fl-grn)_30%,transparent)]">Password updated.</div>
                    )}

                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="current_password">
                            Current Password <span className="text-[var(--fl-red)] ml-[2px]">*</span>
                        </label>
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            className={`w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none${errors.current_password ? ' border-[var(--fl-red)] shadow-[0_0_0_3px_var(--fl-red-d)]' : ''}`}
                            type="password"
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                        {errors.current_password && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.current_password}</span>}
                    </div>

                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="password">
                            New Password <span className="text-[var(--fl-red)] ml-[2px]">*</span>
                        </label>
                        <input
                            id="password"
                            ref={passwordInput}
                            className={`w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none${errors.password ? ' border-[var(--fl-red)] shadow-[0_0_0_3px_var(--fl-red-d)]' : ''}`}
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        {errors.password && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.password}</span>}
                    </div>

                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="password_confirmation">
                            Confirm Password <span className="text-[var(--fl-red)] ml-[2px]">*</span>
                        </label>
                        <input
                            id="password_confirmation"
                            className={`w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none${errors.password_confirmation ? ' border-[var(--fl-red)] shadow-[0_0_0_3px_var(--fl-red-d)]' : ''}`}
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.password_confirmation}</span>}
                    </div>
                </div>

                <div className="flex gap-[10px] mt-6 pb-4">
                    <button type="submit" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]" disabled={processing}>
                        {processing ? 'Saving…' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
}

ChangePassword.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
