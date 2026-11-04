import { describe, expect, it } from 'vitest'
import {
  normalizeMoroccanPhone,
  validateCheckout,
  type CheckoutValues,
} from './checkout'

const validValues: CheckoutValues = {
  customerName: 'Nora Whimsea',
  phone: '0612345678',
  cityKey: 'rabat',
  streetAddress: '12 rue des Fleurs',
  landmark: '',
  deliveryNotes: '',
}

describe('checkout validation', () => {
  it('normalizes local Moroccan phone numbers for the server contract', () => {
    expect(normalizeMoroccanPhone('06 12 34 56 78')).toBe('+212612345678')
    expect(normalizeMoroccanPhone('+212612345678')).toBe('+212612345678')
    expect(normalizeMoroccanPhone('0212345678')).toBe('')
  })

  it('requires a configured delivery quote before checkout', () => {
    expect(validateCheckout(validValues, false)).toHaveProperty('cityKey')
    expect(validateCheckout(validValues, true)).toEqual({})
  })

  it('rejects forged or malformed customer input before any RPC call', () => {
    const errors = validateCheckout(
      {
        ...validValues,
        customerName: 'x',
        phone: '+212212345678',
        cityKey: '',
        streetAddress: 'x',
      },
      true,
    )

    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining([
        'customerName',
        'phone',
        'cityKey',
        'streetAddress',
      ]),
    )
  })
})
