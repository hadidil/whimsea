import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CatalogProduct } from './catalog'
import { formatMad } from './catalog'

type ProductCardProps = {
  product: CatalogProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const isAvailable = product.stockQuantity > 0

  return (
    <article className={`product-card product-card-${product.tone}`}>
      <Link
        className="product-card-image"
        to={`/products/${product.slug}`}
        aria-label={`Voir ${product.name}`}
      >
        {product.imageUrl ? (
          <img
            className="product-image"
            src={product.imageUrl}
            alt={product.imageAlt || product.name}
          />
        ) : (
          <span className="product-image-placeholder">Photo à venir</span>
        )}
        {product.featured && <span className="product-badge">Sélection</span>}
      </Link>
      <div className="product-card-info">
        <div>
          <p className="product-category">{product.category}</p>
          <h2>
            <Link to={`/products/${product.slug}`}>{product.name}</Link>
          </h2>
        </div>
        <div className="product-card-bottom">
          <span className="product-price">
            {formatMad(product.priceCentimes)}
          </span>
          <span
            className={isAvailable ? 'stock-label' : 'stock-label sold-out'}
          >
            {isAvailable ? 'Disponible' : 'Épuisé'}
          </span>
        </div>
      </div>
      <Link
        className="product-card-arrow"
        to={`/products/${product.slug}`}
        aria-label={`Découvrir ${product.name}`}
      >
        <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </article>
  )
}
