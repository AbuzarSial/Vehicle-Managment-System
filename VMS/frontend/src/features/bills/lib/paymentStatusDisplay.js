/**
 * Maps API payment_status (normalized lowercase) to UI badge variant + label.
 */
export function getPaymentStatusPresentation(status) {
  const s = String(status ?? '')
    .trim()
    .toLowerCase()
  switch (s) {
    case 'paid':
      return { variant: 'success', label: 'Paid' }
    case 'unpaid':
      return { variant: 'danger', label: 'Unpaid' }
    case 'pending':
      return { variant: 'warning', label: 'Pending' }
    case 'partial':
      return { variant: 'warning', label: 'Partial' }
    case 'void':
      return { variant: 'danger', label: 'Void' }
    case 'refunded':
      return { variant: 'default', label: 'Refunded' }
    default:
      return { variant: 'default', label: s || 'Unknown' }
  }
}

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'void', label: 'Void' },
  { value: 'refunded', label: 'Refunded' },
]
