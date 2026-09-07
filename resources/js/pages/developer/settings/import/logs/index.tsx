import SettingsImportLayout from '@/layouts/settings/SettingsImportLayout';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import { ImportLogsPanel } from '../ImportLogsPanel';

export default function index() {
    return (
        <SettingsPrimaryLayout>
            <SettingsImportLayout>
                <ImportLogsPanel />
            </SettingsImportLayout>
        </SettingsPrimaryLayout>
    );
}
