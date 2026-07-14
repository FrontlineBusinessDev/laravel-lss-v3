// resources/js/Pages/Errors/404.jsx
import React from 'react';
import { Head } from '@inertiajs/react';

type Error404Props = {
    title: string;
    message?: string;
};

export default function Error404({ title, message }: Error404Props) {
    return (
        <div className="bg-background text-foreground flex min-h-[calc(100dvh-300px)] flex-col items-center justify-center">
            <Head title={title} />
            <h1 className="text-6xl font-bold">404</h1>
            <p className="mt-4 text-2xl font-semibold">{title}</p>
            <p className="mt-2 max-w-md text-center text-gray-600">
                {message || 'Page Not Found.'}
            </p>
        </div>
    );
}
