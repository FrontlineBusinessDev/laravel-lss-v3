import { ApiError } from '@/api-service-layer/client';
import { Avatar } from '@/components/Avatar';
import { AvatarCropModal } from '@/components/AvatarCropModal';
import { Button } from '@/components/Button';
import { ConfirmDeleteModal } from '@/components/modal/ConfirmDeleteModal';
import { useToast } from '@/hooks/use-toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    ArrowLeft,
    Camera,
    Mail,
    Phone,
    Trash2,
} from 'lucide-react';
import { ReactNode, useRef, useState, type ChangeEvent } from 'react';

export default function TraineesDetailLayout({
    trainee,
    children,
}: {
    trainee: TraineeDetail;
    children: ReactNode;
}) {
    const { toast } = useToast();
    const { url } = usePage();
    const path = url.split('?')[0];
    const displayStatus = trainee.status;

    const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
    const [avatarProgress, setAvatarProgress] = useState<number | null>(null);
    const [deletingAvatar, setDeletingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [archiving, setArchiving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const isActive = trainee.status === 'active';

    const toggleArchive = async () => {
        setArchiving(true);
        try {
            await apiFetchJson(
                `/trainees/${trainee.id}/${isActive ? 'archive' : 'restore'}`,
                { method: 'PATCH' },
            );
            toast({
                title: isActive ? 'Trainee archived' : 'Trainee restored',
                variant: 'info',
            });
            router.reload();
        } catch (error) {
            toast({
                title: 'Action failed',
                description:
                    error instanceof ApiError ? error.message : undefined,
                variant: 'error',
            });
        } finally {
            setArchiving(false);
        }
    };

    const confirmDeleteTrainee = async () => {
        setDeleting(true);
        try {
            await apiFetchJson(`/trainees/${trainee.id}`, {
                method: 'DELETE',
            });
            toast({ title: 'Trainee deleted', variant: 'info' });
            router.visit('/trainees');
        } catch (error) {
            toast({
                title: 'Delete failed',
                description:
                    error instanceof ApiError ? error.message : undefined,
                variant: 'error',
            });
        } finally {
            setDeleting(false);
            setDeleteOpen(false);
        }
    };

    const pickAvatar = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Image too large',
                description: 'Please choose an image under 5MB.',
                variant: 'error',
            });
            return;
        }
        setAvatarSrc(URL.createObjectURL(file));
    };

    const closeAvatarModal = () => {
        if (avatarSrc) URL.revokeObjectURL(avatarSrc);
        setAvatarSrc(null);
        setAvatarProgress(null);
    };

    const saveAvatar = async (blob: Blob) => {
        const form = new FormData();
        form.append('avatar_path', blob, 'avatar.jpg');
        setAvatarProgress(0);
        try {
            await apiFetchJson(`/trainees/${trainee.id}/avatar`, {
                method: 'POST',
                body: form,
                onUploadProgress: setAvatarProgress,
            });
            toast({ title: 'Profile picture updated', variant: 'success' });
            closeAvatarModal();
            router.reload({ only: ['trainee'] });
        } catch (error) {
            toast({
                title: 'Failed to upload profile picture',
                description:
                    error instanceof ApiError ? error.message : undefined,
                variant: 'error',
            });
            setAvatarProgress(null);
        }
    };

    const deleteAvatar = async () => {
        setDeletingAvatar(true);
        try {
            await apiFetchJson(`/trainees/${trainee.id}/avatar`, {
                method: 'DELETE',
            });
            toast({ title: 'Profile picture removed', variant: 'success' });
            router.reload({ only: ['trainee'] });
        } catch (error) {
            toast({
                title: 'Failed to remove profile picture',
                description:
                    error instanceof ApiError ? error.message : undefined,
                variant: 'error',
            });
        } finally {
            setDeletingAvatar(false);
        }
    };

    const TABS = [
        {
            label: 'Personal Information',
            href: `/trainees/${trainee.id}`,
        },
        {
            label: 'Academic Information',
            href: `/trainees/${trainee.id}/academic-information`,
        },
        {
            label: 'Documents',
            href: `/trainees/${trainee.id}/documents`,
        },
        {
            label: 'Learning Outcomes',
            href: `/trainees/${trainee.id}/learning-outcomes`,
        },
        {
            label: 'Payment Details',
            href: `/trainees/${trainee.id}/payment-details`,
        },
        {
            label: 'Ratings',
            href: `/trainees/${trainee.id}/ratings`,
        },
        {
            label: 'Certificate',
            href: `/trainees/${trainee.id}/certificate`,
        },
        {
            label: 'Biometrics',
            href: `/trainees/${trainee.id}/biometrics`,
        },
    ];

    return (
        <>
            <div data-cy="detail-div-1">
                <Link
                    href="/trainees"
                    className="mb-3 flex items-center gap-1.5 text-xs text-neutral-500 transition-opacity hover:opacity-60"
                    data-cy="batch-detail-layout-link-batches"
                >
                    <ArrowLeft
                        size={14}
                        data-cy="batch-detail-layout-arrow-left-3"
                    />
                    Back to trainees
                </Link>
            </div>

            <div
                className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                data-cy="detail-div-4"
            >
                <div className="flex items-center gap-3" data-cy="detail-div-5">
                    <div
                        className="relative h-14 w-14 shrink-0"
                        data-cy="detail-div-6"
                    >
                        <Avatar
                            src={trainee.avatar_url}
                            name={trainee.name}
                            initials={trainee.initials}
                            size="lg"
                            isLoading={avatarProgress !== null}
                            data-cy="detail-avatar"
                        />
                        <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/50 text-white opacity-0 transition-opacity hover:opacity-100"
                            aria-label="Change profile picture"
                            data-cy="detail-button-change-avatar"
                        >
                            <Camera size={16} data-cy="detail-icon-camera" />
                        </button>
                        {trainee.avatar_url && (
                            <button
                                type="button"
                                onClick={deleteAvatar}
                                disabled={deletingAvatar}
                                className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-danger-600 shadow ring-1 ring-neutral-200 transition-colors hover:bg-danger-50 disabled:opacity-50"
                                aria-label="Remove profile picture"
                                data-cy="detail-button-delete-avatar"
                            >
                                <Trash2 size={12} data-cy="detail-icon-trash" />
                            </button>
                        )}
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={pickAvatar}
                            data-cy="detail-input-avatar-file"
                        />
                    </div>
                    <div data-cy="detail-div-7">
                        <div
                            className="mb-0.5 flex items-center gap-2"
                            data-cy="detail-div-8"
                        >
                            <span
                                className="text-lg font-semibold text-ink"
                                data-cy="detail-span-9"
                            >
                                {trainee.name}
                            </span>
                            <span
                                className={
                                    displayStatus === 'active'
                                        ? 'inline-flex items-center rounded-pill bg-success-50 px-2.5 py-0.5 text-xs leading-5 font-medium text-success-800'
                                        : 'inline-flex items-center rounded-pill bg-neutral-100 px-2.5 py-0.5 text-xs leading-5 font-medium text-neutral-600'
                                }
                                data-cy="detail-span-10"
                            >
                                {displayStatus}
                            </span>
                        </div>
                        <p
                            className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500"
                            data-cy="detail-p-11"
                        >
                            <span
                                className="flex items-center gap-1"
                                data-cy="detail-span-12"
                            >
                                <Mail size={12} data-cy="detail-mail-13" />{' '}
                                {trainee.email}
                            </span>
                            <span
                                className="flex items-center gap-1"
                                data-cy="detail-span-14"
                            >
                                <Phone size={12} data-cy="detail-phone-15" />{' '}
                                {trainee.mobile_number}
                            </span>
                            <span data-cy="detail-span-16">
                                {trainee.batch?.batch_code ?? '—'} ·{' '}
                                {trainee.school?.school_name ?? '—'}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2" data-cy="detail-div-actions">
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={isActive ? Archive : ArchiveRestore}
                        disabled={archiving}
                        onClick={() => void toggleArchive()}
                        data-cy="detail-button-toggle-archive"
                    >
                        {isActive ? 'Archive' : 'Restore'}
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        disabled={isActive}
                        onClick={() => setDeleteOpen(true)}
                        data-cy="detail-button-set-delete-open"
                    >
                        Delete
                    </Button>
                </div>
            </div>

            <div
                className="lss-scrollbar mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5"
                data-cy="detail-div-17"
            >
                {TABS.map((t, key) => {
                    const active = path === t.href;
                    return (
                        <Link
                            key={key}
                            href={t.href}
                            className={cn(
                                'pb-2.5 text-xs font-medium whitespace-nowrap transition-colors',
                                active
                                    ? 'border-b-2 border-brand-500 font-semibold text-ink'
                                    : 'text-neutral-500 hover:text-neutral-700',
                            )}
                            data-cy="detail-button-set-tab"
                        >
                            {t.label}
                        </Link>
                    );
                })}
            </div>

            {children}

            <AvatarCropModal
                imageSrc={avatarSrc}
                uploadProgress={avatarProgress}
                onClose={closeAvatarModal}
                onSave={saveAvatar}
            />

            <ConfirmDeleteModal
                open={deleteOpen}
                busy={deleting}
                label={trainee.name}
                confirmText={trainee.name}
                onCancel={() => setDeleteOpen(false)}
                onConfirm={confirmDeleteTrainee}
                data-cy="detail-confirm-delete-modal"
            />
        </>
    );
}
