/**
 * @file api-service-layer/admin/payment-method.ts
 * Payment Methods service — `/settings/payment-methods` (crudModule).
 * Logo/QR uploads on create/update flow through the FormData path automatically.
 */

import type { PaymentMethod } from '@/types/modules/settings/payment-methods';
import { createCrudResource } from '../http';

export type PaymentMethodInput = Partial<PaymentMethod>;

export const paymentMethodService = createCrudResource<
    PaymentMethod,
    PaymentMethodInput
>({ baseUrl: '/settings/payment-methods' });
