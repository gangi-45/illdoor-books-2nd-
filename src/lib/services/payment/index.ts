import type { PaymentProvider } from './types';
import { ManualPaymentProvider } from './manual-provider';

export type { PaymentProvider, PaymentDetails, PaymentResult, PaymentVerification, RefundResult } from './types';

/**
 * Get the active payment provider.
 * Phase 1: ManualPaymentProvider
 * Phase 2+: swap to BkashProvider, NagadProvider, etc. based on config
 */
export function getPaymentProvider(): PaymentProvider {
  return new ManualPaymentProvider();
}
