import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import PortalLayout from '@/layouts/portal/portal-layout';
import type { Auth } from '@/types';
import * as Routes from '@/routes';

function getInitials(firstName: string, lastName?: string | null) {
    const first = (firstName || '')[0] || '';
    const last = (lastName || '')[0] || '';
    return (first + last || first || '?').toUpperCase();
}

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function EditProfile({ mustVerifyEmail, status }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const avatarSrc = preview || user.avatar_url;

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        first_name: auth.user.first_name,
        last_name: auth.user.last_name ?? '',
        email: auth.user.email,
        _portal: true as boolean,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(ProfileController.update().url, { preserveScroll: true });
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
        setPendingFile(file);
    }

    function handleAvatarSave() {
        if (!pendingFile) return;
        setAvatarUploading(true);
        setAvatarError(null);
        router.post(
            ProfileController.updateAvatar.url() + '?_portal=1',
            { avatar: pendingFile },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setPreview(null);
                    setPendingFile(null);
                    setAvatarError(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
                onError: (errs) => {
                    setAvatarError(errs.avatar ?? 'Upload failed. Please try again.');
                },
                onFinish: () => setAvatarUploading(false),
            },
        );
    }

    function handleAvatarCancel() {
        setPreview(null);
        setPendingFile(null);
        setAvatarError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleDeleteAvatar() {
        router.delete(ProfileController.deleteAvatar.url() + '?_portal=1', {
            preserveScroll: true,
        });
    }

    return (
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <form className="pb-[calc(var(--fl-nav-h)+var(--fl-safe)+80px)] lg:pb-[100px]" onSubmit={handleSubmit}>
                <div className="mb-6">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">Profile Photo</h3>
                    <div className="mb-3 relative" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {avatarSrc ? (
                            <img src={avatarSrc} alt={user.first_name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                            <div className="w-[32px] h-[32px] rounded-full shrink-0 bg-gradient-to-br from-[var(--fl-p)] to-[var(--fl-gold)] text-white text-xs font-bold flex items-center justify-center" style={{ width: 64, height: 64, fontSize: 20 }}>
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {pendingFile ? (
                                <>
                                    <button type="button" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)] px-[14px] py-2 text-sm font-semibold rounded-xl" onClick={handleAvatarSave} disabled={avatarUploading}>
                                        {avatarUploading ? 'Saving…' : 'Save'}
                                    </button>
                                    <button type="button" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s2)] active:scale-[.97] px-[14px] py-2 text-sm font-semibold rounded-xl" onClick={handleAvatarCancel} disabled={avatarUploading}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button type="button" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s2)] px-[14px] py-2 text-sm font-semibold rounded-xl" onClick={() => fileInputRef.current?.click()}>
                                        {avatarSrc ? 'Change' : 'Upload'}
                                    </button>
                                    {user.avatar_url && (
                                        <button type="button" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-[var(--fl-red-d)] text-[var(--fl-red)] border-[rgba(255,69,96,.3)] active:bg-[rgba(255,69,96,.25)] active:scale-[.97] px-[14px] py-2 text-sm font-semibold rounded-xl" onClick={handleDeleteAvatar}>
                                            Remove
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>
                    {avatarError && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{avatarError}</span>}
                </div>

                <div className="mb-6">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] mb-3 flex items-center gap-2">Edit Profile</h3>

                    {recentlySuccessful && (
                        <div className="text-sm font-semibold px-[14px] py-[10px] rounded-xl mb-3 bg-[color-mix(in_srgb,var(--fl-grn)_12%,transparent)] text-[var(--fl-grn)] border border-[color-mix(in_srgb,var(--fl-grn)_30%,transparent)]">Profile updated.</div>
                    )}

                    {status && (
                        <div className="text-sm font-semibold px-[14px] py-[10px] rounded-xl mb-3 bg-[color-mix(in_srgb,var(--fl-grn)_12%,transparent)] text-[var(--fl-grn)] border border-[color-mix(in_srgb,var(--fl-grn)_30%,transparent)]">{status}</div>
                    )}

                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="first_name">
                            First name <span className="text-[var(--fl-red)] ml-[2px]">*</span>
                        </label>
                        <input
                            id="first_name"
                            className={`w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none${errors.first_name ? ' border-[var(--fl-red)] shadow-[0_0_0_3px_var(--fl-red-d)]' : ''}`}
                            type="text"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            required
                            autoComplete="given-name"
                        />
                        {errors.first_name && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.first_name}</span>}
                    </div>

                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="last_name">
                            Last name
                        </label>
                        <input
                            id="last_name"
                            className={`w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none${errors.last_name ? ' border-[var(--fl-red)] shadow-[0_0_0_3px_var(--fl-red-d)]' : ''}`}
                            type="text"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            autoComplete="family-name"
                        />
                        {errors.last_name && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.last_name}</span>}
                    </div>

                    <div className="mb-3 relative">
                        <label className="block text-xs font-semibold text-[var(--fl-tx2)] mb-[6px]" htmlFor="email">
                            Email <span className="text-[var(--fl-red)] ml-[2px]">*</span>
                        </label>
                        <input
                            id="email"
                            className={`w-full bg-[var(--fl-s2)] border-[1.5px] border-solid border-[var(--fl-bdr)] rounded-xl px-[13px] py-[11px] text-[15px] text-[var(--fl-tx)] transition-all duration-100 appearance-none placeholder:text-[var(--fl-tx3)] focus:border-[var(--fl-p)] focus:shadow-[0_0_0_3px_var(--fl-p-dim)] focus:outline-none${errors.email ? ' border-[var(--fl-red)] shadow-[0_0_0_3px_var(--fl-red-d)]' : ''}`}
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        {errors.email && <span className="block text-xs text-[var(--fl-red)] mt-[5px]">{errors.email}</span>}
                    </div>

                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                        <p className="text-xs text-[var(--fl-tx2)] -mt-1 p-2 bg-[var(--fl-s2)] border border-[var(--fl-bdr-s)] rounded-xl">Your email address is unverified.</p>
                    )}
                </div>

                <div className="flex gap-[10px] mt-6 pb-4">
                    <button type="submit" className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]" disabled={processing}>
                        {processing ? 'Saving…' : 'Save Changes'}
                    </button>
                    <Link href={Routes.home.url()} className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-transparent text-[var(--fl-tx2)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s2)] active:scale-[.97]">
                        Go to Home
                    </Link>
                </div>
            </form>
        </div>
    );
}

EditProfile.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
