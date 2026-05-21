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
        <div className="fl-view">
            <form className="fl-form" onSubmit={handleSubmit}>
                <div className="fl-fsec">
                    <h3 className="fl-fsec-ttl">Profile Photo</h3>
                    <div className="fl-fgrp" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {avatarSrc ? (
                            <img src={avatarSrc} alt={user.first_name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                            <div className="fl-desk-avatar" style={{ width: 64, height: 64, fontSize: 20 }}>
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {pendingFile ? (
                                <>
                                    <button type="button" className="fl-btn fl-btn-p fl-btn-sm" onClick={handleAvatarSave} disabled={avatarUploading}>
                                        {avatarUploading ? 'Saving…' : 'Save'}
                                    </button>
                                    <button type="button" className="fl-btn fl-btn-ghost fl-btn-sm" onClick={handleAvatarCancel} disabled={avatarUploading}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button type="button" className="fl-btn fl-btn-out fl-btn-sm" onClick={() => fileInputRef.current?.click()}>
                                        {avatarSrc ? 'Change' : 'Upload'}
                                    </button>
                                    {user.avatar_url && (
                                        <button type="button" className="fl-btn fl-btn-danger fl-btn-sm" onClick={handleDeleteAvatar}>
                                            Remove
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>
                    {avatarError && <span className="fl-ferr">{avatarError}</span>}
                </div>

                <div className="fl-fsec">
                    <h3 className="fl-fsec-ttl">Edit Profile</h3>

                    {recentlySuccessful && (
                        <div className="fl-toast-inline fl-toast-ok">Profile updated.</div>
                    )}

                    {status && (
                        <div className="fl-toast-inline fl-toast-ok">{status}</div>
                    )}

                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="first_name">
                            First name <span className="fl-req">*</span>
                        </label>
                        <input
                            id="first_name"
                            className={`fl-fi${errors.first_name ? ' error' : ''}`}
                            type="text"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            required
                            autoComplete="given-name"
                        />
                        {errors.first_name && <span className="fl-ferr">{errors.first_name}</span>}
                    </div>

                    <div className="fl-fgrp">
                        <label className="fl-flbl" htmlFor="last_name">
                            Last name
                        </label>
                        <input
                            id="last_name"
                            className={`fl-fi${errors.last_name ? ' error' : ''}`}
                            type="text"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            autoComplete="family-name"
                        />
                        {errors.last_name && <span className="fl-ferr">{errors.last_name}</span>}
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
                    <Link href={Routes.home.url()} className="fl-btn fl-btn-ghost">
                        Go to Home
                    </Link>
                </div>
            </form>
        </div>
    );
}

EditProfile.layout = (page: ReactNode) => <PortalLayout>{page}</PortalLayout>;
