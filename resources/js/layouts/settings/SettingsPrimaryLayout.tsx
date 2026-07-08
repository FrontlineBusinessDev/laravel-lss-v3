import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { ToastProvider } from '@/hooks/use-toast';
import { useState } from 'react';

export default function SettingsPrimaryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return { children };
}
