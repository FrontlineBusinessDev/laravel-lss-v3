import { PartnerSchool } from '@/types';
import React from 'react';

const SWATCHES = [
    'bg-brand-50 text-brand-700',
    'bg-success-50 text-success-800',
    'bg-warning-50 text-warning-800',
    'bg-neutral-100 text-neutral-500',
];

type PendingAction = {
    type: 'archive' | 'restore' | 'delete';
    school: PartnerSchool;
} | null;

export default function index() {
    return <></>;
}
