// =============================================================================
// Payment Provider Abstraction — Polytechnic Used Book Marketplace
// Phase 1 uses ManualPaymentProvider; the interface allows swapping to
// bKash/Nagad merchant API in Phase 2 without touching order logic.
// =============================================================================

export interface PaymentDetails {
  orderId: string;
  amount: number;
  buyerName: string;
  orderNumber: string;
}

export interface PaymentResult {
  success: boolean;
  paymentReference?: string;
  error?: string;
}

export interface PaymentVerification {
  verified: boolean;
  paymentReference: string;
  verifiedAt?: string;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundReference?: string;
  error?: string;
}

/**
 * Abstract payment provider interface.
 * Phase 1: ManualPaymentProvider
 * Phase 2+: BkashProvider, NagadProvider, etc.
 */
export interface PaymentProvider {
  /**
   * Initiate a payment. For manual flow, this returns the platform's
   * bKash/Nagad number and instructions. For automated, it creates a
   * payment session.
   */
  createPayment(details: PaymentDetails): Promise<PaymentResult>;

  /**
   * Verify that a payment has been received. For manual flow, this is
   * an admin action. For automated, this checks the gateway.
   */
  verifyPayment(
    orderId: string,
    paymentReference: string
  ): Promise<PaymentVerification>;

  /**
   * Process a refund. Phase 1: manual refund (admin sends money back).
   * Phase 2+: automated via gateway API.
   */
  refundPayment(orderId: string): Promise<RefundResult>;

  /**
   * Get the current payment status for an order.
   */
  getPaymentStatus(orderId: string): Promise<string>;
}
