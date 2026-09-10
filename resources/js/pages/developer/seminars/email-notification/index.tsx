import { router } from '@inertiajs/react';
import { seminarService } from '@/api-service-layer/developer/seminar';
import { useToast } from '@/components/Toast';
import SeminarPrimaryLayout from '@/layouts/seminar/SeminarPrimaryLayout';
import type { SeminarAdminAlertSetting, SeminarEmailTemplate } from '@/types';
import { EmailNotificationsTab } from '../EmailNotificationsTab';

interface Props {
    templates: SeminarEmailTemplate[];
    adminAlerts: SeminarAdminAlertSetting[];
}

/** Props are the single source of truth — every update reloads them via router.reload(). */
export default function SeminarEmailNotificationPage({
    templates,
    adminAlerts,
}: Props) {
    const { showToast } = useToast();

    function reload() {
        router.reload({ only: ['templates', 'adminAlerts'] });
    }

    async function handleUpdateTemplate(
        id: string,
        patch: Partial<SeminarEmailTemplate>,
    ) {
        try {
            await seminarService.updateEmailTemplate(id, patch);
            reload();
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : 'Failed to update template.',
                'error',
            );
        }
    }

    async function handleToggleAlert(key: SeminarAdminAlertSetting['key']) {
        try {
            await seminarService.toggleAdminAlert(key);
            reload();
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : 'Failed to update alert setting.',
                'error',
            );
        }
    }

    async function handleSendTest(id: string) {
        try {
            await seminarService.sendTestEmail(id);
            showToast('Test email queued to your inbox.', 'success');
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : 'Failed to send test email.',
                'error',
            );
        }
    }

    return (
        <SeminarPrimaryLayout>
            <EmailNotificationsTab
                templates={templates}
                onUpdateTemplate={handleUpdateTemplate}
                adminAlerts={adminAlerts}
                onToggleAlert={handleToggleAlert}
                onSendTest={handleSendTest}
            />
        </SeminarPrimaryLayout>
    );
}
