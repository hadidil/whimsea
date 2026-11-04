import { describe, expect, it } from 'vitest'
import {
  findDeliveryQuote,
  normalizeCityKey,
  type DeliveryZone,
} from './delivery'

const zones: DeliveryZone[] = [
  {
    id: 'zone-1',
    cityName: 'Marrakech',
    cityKey: 'marrakech',
    region: 'Marrakech-Safi',
    feeCentimes: 2500,
    notes: null,
  },
]

describe('delivery zones', () => {
  it('normalizes accents and common separators', () => {
    expect(normalizeCityKey('  Béni Mellal  ')).toBe('beni-mellal')
  })

  it('resolves a supported city without trusting display spelling', () => {
    expect(findDeliveryQuote(zones, 'marrakesh')?.feeCentimes).toBe(2500)
    expect(findDeliveryQuote(zones, 'Agadir')).toBeNull()
  })

  it('does not silently provide a quote for an unknown or disabled city', () => {
    expect(findDeliveryQuote(zones, 'Agadir')).toBeNull()
    expect(
      findDeliveryQuote(
        [
          {
            ...zones[0],
            cityKey: 'rabat',
            cityName: 'Rabat',
            feeCentimes: 0,
          },
        ],
        'Marrakech',
      ),
    ).toBeNull()
  })
})
