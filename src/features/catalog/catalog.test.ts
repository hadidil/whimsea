import { describe, expect, it } from 'vitest'
import { formatMad, getDemoProducts } from './catalog'

describe('catalog adapter', () => {
  it('formats integer centimes as MAD', () => {
    expect(formatMad(18900)).toBe('189,00 MAD')
  })

  it('keeps demo content visibly identifiable and excludes inactive products', () => {
    const products = getDemoProducts()
    expect(products.every((product) => product.isDemo)).toBe(true)
    expect(products.filter((product) => product.active)).toHaveLength(3)
  })
})
