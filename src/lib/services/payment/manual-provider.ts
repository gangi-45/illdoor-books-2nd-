// =============================================================================
// Manual Payment Provider — Phase 1
// =============================================================================
// The buyer sends money to the platform's bKash/Nagad number, then enters
// the transaction ID. An admin verifies the payment manually.
// This is NOT a fake gateway — it is the real Phase 1 payment flow.
// =============================================================================

import type {
  PaymentProvider,
  PaymentDetails,
  PaymentResult,
  PaymentVerification,
  RefundResult,
} from './types';

export class ManualPaymentProvider implements PaymentProvider {
  /**
   * "Create" a payment — in manual flow, this just returns the platform's
   * payment numbers so the buyer can send money. No external API call.
   */
  async createPayment(details: PaymentDetails): Promise<PaymentResult> {
    // In the manual flow, we don't create an external payment session.
    // The order is already created with payment_status = 'pending'.
    // The UI will show the bKash/Nagad number from settings.
    return {
      success: true,
      paymentReference: undefined, // buyer will fill this in after sending money
    };
  }

  /**
   * Verify a payment — in manual flow, this is an admin-only action.
   * The admin checks their bKash/Nagad statement and confirms the
   * transaction ID matches.
   */
  async verifyPayment(
    orderId: string,
    paymentReference: string
  ): Promise<PaymentVerification> {
    // In manual flow, verification is done by the admin checking
    // the real bKash/Nagad statement. This method is called by the
    // admin action that marks payment as verified.
    return {
      verified: true,
      paymentReference,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Process a refund — in manual flow, the admin sends money back
   * to the buyer manually and updates the status.
   */
  async refundPayment(orderId: string): Promise<RefundResult> {
    // Manual refund — admin handles the actual money transfer
    return {
      success: true,
      refundReference: `MANUAL_REFUND_${orderId}`,
    };
  }

  /**
   * Get payment status — reads from the database via the order.
   */
  async getPaymentStatus(orderId: string): Promise<string> {
    // Status is stored on the order itself, not in an external system.
    // Callers should read order.payment_status directly.
    return 'pending';
  }
}
