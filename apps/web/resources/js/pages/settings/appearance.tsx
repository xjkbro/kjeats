import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import SettingsLayout from '@/layouts/settings/portal-settings-layout';

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <div className="space-y-6">
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = (page: React.ReactNode) => (
    <SettingsLayout active="appearance" title="Appearance">
        {page}
    </SettingsLayout>
);
