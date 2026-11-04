const allowedProductImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024

export function isAllowedProductImage(file: {
  type: string
  size: number
}): boolean {
  return (
    allowedProductImageTypes.has(file.type) &&
    file.size > 0 &&
    file.size <= MAX_PRODUCT_IMAGE_BYTES
  )
}
