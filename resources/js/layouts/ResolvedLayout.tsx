import AppLayout from './AppLayout';

export const ResolvedLayout = (name: string) => {
    // PUBLIC
    if (
        name === 'welcome' ||
        name.startsWith('auth/') ||
        name.startsWith('public/') ||
        name.startsWith('pages-errors/')
    ) {
        return null;
    }
    // DEFAULT
    return [AppLayout];
};
