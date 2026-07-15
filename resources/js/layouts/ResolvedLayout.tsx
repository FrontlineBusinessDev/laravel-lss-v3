import AppLayout from './AppLayout';
import SettingsAcademicLayout from './settings/SettingsAcademicLayout';
import SettingsPrimaryLayout from './settings/SettingsPrimaryLayout';

export const ResolvedLayout = (name: string) => {
    console.log(name);
    // PUBLIC
    if (
        name === 'welcome' ||
        name.startsWith('auth/') ||
        name.startsWith('public/')
    ) {
        return null;
    }
    // SETTINGS ACADEMIC
    if (name.includes('settings/academic')) {
        return [AppLayout, SettingsPrimaryLayout, SettingsAcademicLayout];
    }
    // DEFAULT
    return [AppLayout];
};
