export type CheckoutValues = {
  customerName: string
  phone: string
  cityKey: string
  streetAddress: string
  landmark: string
  deliveryNotes: string
}

export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>

export function normalizeMoroccanPhone(value: string): string {
  const compact = value.trim().replace(/[\s().-]/g, '')
  if (/^0[5-7]\d{8}$/.test(compact)) return `+212${compact.slice(1)}`
  if (/^\+212[5-7]\d{8}$/.test(compact)) return compact
  return ''
}

export function validateCheckout(
  values: CheckoutValues,
  hasDeliveryQuote: boolean,
): CheckoutErrors {
  const errors: CheckoutErrors = {}
  if (values.customerName.trim().length < 2) {
    errors.customerName = 'Indiquez votre nom complet.'
  }
  if (!normalizeMoroccanPhone(values.phone)) {
    errors.phone =
      'Utilisez un numéro marocain valide, par exemple 06… ou +2126….'
  }
  if (!values.cityKey || !hasDeliveryQuote) {
    errors.cityKey = 'Choisissez une ville couverte et tarifée.'
  }
  if (values.streetAddress.trim().length < 5) {
    errors.streetAddress = 'Indiquez une adresse de livraison précise.'
  }
  return errors
}

export function hasCheckoutErrors(errors: CheckoutErrors): boolean {
  return Object.keys(errors).length > 0
}
