import { Link } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';
import PortalLayout from '@/layouts/portal/portal-layout';
import { edit as editAppearance } from '@/routes/appearance';
import { settings as cuisinesSettings } from '@/routes/cuisines';
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
    ];

    return (
        <div className="fl-settings-tabs">
            {tabs.map((tab) => (
                <Link
                    key={tab.id}
                    href={tab.href}
                    className={`fl-settings-tab${active === tab.id ? ' active' : ''}`}
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
        <div className="fl-view">
            <div className="fl-view-hdr">
                <h1 className="fl-view-ttl">{title}</h1>
            </div>
            <SettingsNav active={active} />
            <div className="fl-settings-content">
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
