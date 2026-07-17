import AppLayout from './AppLayout';
import SettingsAcademicLayout from './settings/SettingsAcademicLayout';
import SettingsRatesLayout from './settings/SettingsRatesLayout';
import SettingsPrimaryLayout from './settings/SettingsPrimaryLayout';

export const ResolvedLayout = (name: string) => {
    console.log('name', name);
    // PUBLIC
    if (
        name === 'welcome' ||
        name.startsWith('auth/') ||
        name.startsWith('public/') ||
        name.startsWith('pages-errors/')
    ) {
        return null;
    }
    // SETTINGS RATES (top-level, sibling to Academic)
    // if (name.includes('settings/rates')) {
    //     return [AppLayout, SettingsPrimaryLayout, SettingsRatesLayout];
    // }
    // // SETTINGS ACADEMIC
    // if (name.includes('settings/academic')) {
    //     return [AppLayout, SettingsPrimaryLayout, SettingsAcademicLayout];
    // }
    // DEFAULT
    return [AppLayout];
};
