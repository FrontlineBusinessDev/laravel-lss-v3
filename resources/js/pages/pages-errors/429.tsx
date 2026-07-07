// resources/js/Pages/Errors/429.jsx
import React from 'react';
import { Head } from '@inertiajs/react';

type Error429Props = {
    title: string;
    message?: string;
};

export default function Error429({ title, message }: Error429Props) {
    return (
        <div className="flex min-h-[calc(100dvh-300px)] flex-col items-center justify-center bg-background text-foreground">
            <Head title={title} />
            <h1 className="text-6xl font-bold">429</h1>
            <p className="mt-4 text-2xl font-semibold">{title}</p>
            <p className="mt-2 max-w-md text-center text-gray-600">
                {message || 'Too many requests. Please slow down.'}
            </p>
        </div>
    );
}
