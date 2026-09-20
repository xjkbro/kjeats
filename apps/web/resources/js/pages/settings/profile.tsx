import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import * as ProfileActions from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/portal-settings-layout';
import { send } from '@/routes/verification';

function getInitials(firstName: string, lastName?: string | null) {
    const first = (firstName || '')[0] || '';
    const last = (lastName || '')[0] || '';
    return (first + last || first || '?').toUpperCase();
}

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Profile({ mustVerifyEmail, status }: Props) {
    const { auth } = usePage().props;
    const user = auth.user as { first_name: string; last_name: string | null; email: string; avatar_url?: string | null };
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const avatarSrc = preview || user.avatar_url;

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file) {
return;
}

        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('avatar', file);

        router.post(ProfileActions.updateAvatar.url(), formData, {
            preserveScroll: true,
            onSuccess: () => setPreview(null),
        });
    }

    function handleDeleteAvatar() {
        router.delete(ProfileActions.deleteAvatar.url(), {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Profile settings" />

            <div className="space-y-6">
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                    <h3 className="text-sm font-medium dark:text-zinc-200">Profile Photo</h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        This photo will appear next to your activity in the feed.
                    </p>

                    <div className="mt-4 flex items-center gap-4">
                        {avatarSrc ? (
                            <img
                                src={avatarSrc}
                                alt={user.first_name}
                                className="h-16 w-16 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-600"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                {avatarSrc ? 'Change' : 'Upload'}
                            </button>
                            {avatarSrc && (
                                <button
                                    type="button"
                                    onClick={handleDeleteAvatar}
                                    className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">First name</Label>

                                    <Input
                                        id="first_name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.first_name}
                                        name="first_name"
                                        required
                                        autoComplete="given-name"
                                        placeholder="First name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.first_name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">Last name</Label>

                                    <Input
                                        id="last_name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.last_name ?? ''}
                                        name="last_name"
                                        autoComplete="family-name"
                                        placeholder="Last name (optional)"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.last_name}
                                    />
                                </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>

                                        <Input
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.email}
                                        />
                                    </div>

                                    {mustVerifyEmail &&
                                        auth.user.email_verified_at === null && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Your email address is unverified.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                    >
                                                        Click here to resend the
                                                        verification email.
                                                    </Link>
                                                </p>

                                                {status ===
                                                    'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        A new verification link has been
                                                        sent to your email address.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    <div className="flex items-center gap-4">
                                        <Button
                                            disabled={processing}
                                            data-test="update-profile-button"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </Form>

                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = (page: React.ReactNode) => (
    <SettingsLayout active="profile" title="Profile">
        {page}
    </SettingsLayout>
);
