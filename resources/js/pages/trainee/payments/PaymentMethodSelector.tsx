import { Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { ImageLightbox } from '@/components/ImageLightbox';
import { Thumbnail } from '@/components/Thumbnail';
import { useToast } from '@/components/Toast';
import { copyText } from '@/lib/clipboard';
import type { PaymentMethod } from '@/types/modules/payments/trainee-payment';

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

interface Props {
    paymentMethods: PaymentMethod[];
}

export function PaymentMethodSelector({ paymentMethods }: Props) {
    const { showToast } = useToast();
    const [activeId, setActiveId] = useState(paymentMethods[0]?.id ?? null);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    if (paymentMethods.length === 0) {
        return (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-neutral-500 shadow-sm">
                No active payment methods configured yet. Please check back
                later or contact the admin team.
            </div>
        );
    }

    const active =
        paymentMethods.find((m) => m.id === activeId) ?? paymentMethods[0];

    const handleCopy = async (value: string) => {
        const ok = await copyText(value);
        showToast(ok ? 'Copied!' : 'Copy failed', ok ? 'success' : 'error');
    };

    return (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-ink">
                How to make a payment
            </h2>

            <div
                className="mb-4 flex flex-wrap gap-2"
                data-cy="trainee-payment-method-selector"
            >
                {paymentMethods.map((method) => (
                    <button
                        key={method.id}
                        type="button"
                        onClick={() => setActiveId(method.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            method.id === active.id
                                ? 'border-brand-600 bg-brand-50 text-brand-700'
                                : 'border-slate-200 text-neutral-600 hover:bg-slate-50'
                        }`}
                        data-cy={`payment-tab-${slugify(method.provider_name)}`}
                    >
                        {method.provider_name}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
                {active.qr_code && (
                    <button
                        type="button"
                        onClick={() => setLightboxSrc(active.qr_code)}
                        className="shrink-0"
                    >
                        <Thumbnail
                            src={active.qr_code}
                            alt={`${active.provider_name} QR code`}
                            className="h-32 w-32 rounded-lg border border-slate-200 object-cover"
                            data-cy="payment-qr-code-img"
                        />
                    </button>
                )}

                <div className="min-w-0 flex-1 space-y-2 text-sm">
                    {active.account_name && (
                        <p>
                            <span className="text-neutral-500">
                                Account name:
                            </span>{' '}
                            <span className="font-medium text-ink">
                                {active.account_name}
                            </span>
                        </p>
                    )}
                    {active.account_number && (
                        <p className="flex items-center gap-1.5">
                            <span className="text-neutral-500">
                                Account number:
                            </span>
                            <span className="font-medium text-ink">
                                {active.account_number}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    handleCopy(active.account_number ?? '')
                                }
                                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50"
                                data-cy="btn-copy-account-number"
                            >
                                <Copy className="size-3" />
                                Copy
                            </button>
                        </p>
                    )}
                    {active.payment_link && (
                        <a
                            href={active.payment_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                        >
                            Open Payment Link
                            <ExternalLink className="size-3.5" />
                        </a>
                    )}
                    {active.instructions && (
                        <p
                            className="mt-2 whitespace-pre-wrap text-neutral-600"
                            data-cy="payment-instructions-body"
                        >
                            {active.instructions}
                        </p>
                    )}
                </div>
            </div>

            <ImageLightbox
                open={lightboxSrc !== null}
                src={lightboxSrc ?? ''}
                alt={`${active.provider_name} QR code`}
                onClose={() => setLightboxSrc(null)}
            />
        </div>
    );
}

export default PaymentMethodSelector;
