import SeminarPrimaryLayout from '@/layouts/seminar/SeminarPrimaryLayout';
import React, { useState } from 'react';
import { EmailNotificationsTab } from './EmailNotificationsTab';
import { SeminarAdminAlertSetting, SeminarEmailTemplate } from '@/types';
import {
    seminars as initialSeminars,
    seminarParticipants as initialParticipants,
    seminarEmailTemplates as initialTemplates,
    seminarAdminAlerts as initialAlerts,
    TODAY,
    currentUser,
} from '@/data/mockData';

export default function index() {
    const [templates, setTemplates] =
        useState<SeminarEmailTemplate[]>(initialTemplates);
    const [adminAlerts, setAdminAlerts] =
        useState<SeminarAdminAlertSetting[]>(initialAlerts);

    function handleUpdateTemplate(
        id: string,
        patch: Partial<SeminarEmailTemplate>,
    ) {
        setTemplates((prev) =>
            prev.map((t) =>
                t.id === id
                    ? {
                          ...t,
                          ...patch,
                      }
                    : t,
            ),
        );
    }

    function handleToggleAlert(key: SeminarAdminAlertSetting['key']) {
        setAdminAlerts((prev) =>
            prev.map((a) =>
                a.key === key
                    ? {
                          ...a,
                          enabled: !a.enabled,
                      }
                    : a,
            ),
        );
    }

    return (
        <SeminarPrimaryLayout>
            <EmailNotificationsTab
                templates={templates}
                onUpdateTemplate={handleUpdateTemplate}
                adminAlerts={adminAlerts}
                onToggleAlert={handleToggleAlert}
                data-cy="index-email-notifications-tab-12"
            />
        </SeminarPrimaryLayout>
    );
}
