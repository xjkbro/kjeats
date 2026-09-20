import { Link } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';
import PortalLayout from '@/layouts/portal/portal-layout';
import { edit as editAppearance } from '@/routes/appearance';
import { settings as cuisinesSettings } from '@/routes/cuisines';
import { settings as locationsSettings } from '@/routes/locations';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

interface SettingsNavProps {
    active: string;
}

function SettingsNav({ active }: SettingsNavProps) {
    const tabs = [
        { id: 'profile', label: 'Profile', href: edit() },
        { id: 'security', label: 'Security', href: editSecurity() },
        { id: 'appearance', label: 'Appearance', href: editAppearance() },
        { id: 'cuisines', label: 'Cuisines', href: cuisinesSettings() },
        { id: 'locations', label: 'Locations', href: locationsSettings() },
    ];

    return (
        <div className="flex gap-[3px] p-[3px] bg-[var(--fl-s2)] rounded-2xl mb-6 overflow-x-auto kj-scrollbar-none">
            {tabs.map((tab) => (
                <Link
                    key={tab.id}
                    href={tab.href}
                    className={`flex-1 text-center px-[14px] py-[9px] text-[13px] font-bold tracking-[-.2px] transition-all duration-100 rounded-xl whitespace-nowrap no-underline${
                        active === tab.id
                            ? ' bg-white text-[var(--fl-tx)] shadow-[0_1px_3px_rgba(0,0,0,.08)] dark:bg-zinc-800'
                            : ' text-[var(--fl-tx2)] hover:text-[var(--fl-tx)]'
                    }`}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    );
}

interface SettingsPageProps extends SettingsNavProps {
    title: string;
    children: ReactNode;
}

export function SettingsPage({ active, title, children }: SettingsPageProps) {
    return (
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <div className="mb-5">
                <h1 className="text-[22px] font-black text-[var(--fl-tx)] tracking-[-.5px] leading-[1.2]">{title}</h1>
            </div>
            <SettingsNav active={active} />
            <div>
                {children}
            </div>
        </div>
    );
}

export default function SettingsLayout({ active, title, children }: PropsWithChildren<SettingsPageProps>) {
    return (
        <PortalLayout>
            <SettingsPage active={active} title={title}>
                {children}
            </SettingsPage>
        </PortalLayout>
    );
}
