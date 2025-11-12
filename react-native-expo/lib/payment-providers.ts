/**
 * Information about a payment provider for display purposes
 */
export interface PaymentProviderInfo {
  icon: string;
  title: string;
}

/**
 * Get display information for a payment provider based on its ID
 * Returns an icon name and formatted title for the payment provider
 */
export function getPaymentProviderInfo(providerId: string): PaymentProviderInfo {
  switch (providerId) {
    case 'pp_system_default':
      return {
        icon: 'creditcard',
        title: 'Manual Payment',
      };
    default:
      return {
        icon: 'creditcard',
        title: providerId.replace('pp_', '').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      };
  }
}

