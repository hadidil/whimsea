import { ArrowLeft, Heart, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatMad, loadCatalog, type CatalogProduct } from './catalog'
import { useCart } from '../cart/useCart'

export function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<CatalogProduct>()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { addItem, itemCount } = useCart()

  useEffect(() => {
    let isCurrent = true

    void loadCatalog()
      .then(({ products }) => {
        if (isCurrent) setProduct(products.find((item) => item.slug === slug))
      })
      .catch(() => {
        if (isCurrent) setError('Impossible de charger cette pièce.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [slug])

  if (isLoading) {
    return (
      <main className="catalog-state product-not-found">
        <p className="eyebrow">La boutique</p>
        <h1>Chargement de la pièce…</h1>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="catalog-state product-not-found">
        <p className="eyebrow">Bijou introuvable</p>
        <h1>{error || 'Cette pièce n’est pas disponible.'}</h1>
        <Link className="button button-secondary" to="/shop">
          Retour à la boutique
        </Link>
      </main>
    )
  }

  const imageUrls = product.imageUrls?.length
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : []

  return (
    <main className="product-detail-page">
      <Link className="back-link" to="/shop">
        <ArrowLeft aria-hidden="true" size={15} /> Retour à la boutique
      </Link>
      <div className={`product-detail-layout product-detail-${product.tone}`}>
        <div className="product-detail-image">
          {imageUrls.length ? (
            <div className="product-gallery">
              <img
                className="product-image"
                src={imageUrls[selectedImage] || imageUrls[0]}
                alt={
                  product.imageAltTexts?.[selectedImage] ||
                  product.imageAlt ||
                  product.name
                }
                width="1200"
                height="1500"
                fetchPriority="high"
              />
              {imageUrls.length > 1 && (
                <div
                  className="product-gallery-thumbnails"
                  aria-label="Images du produit"
                >
                  {imageUrls.map((imageUrl, index) => (
                    <button
                      className={index === selectedImage ? 'is-selected' : ''}
                      key={imageUrl}
                      type="button"
                      aria-label={`Voir l’image ${index + 1}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={imageUrl}
                        alt={
                          product.imageAltTexts?.[index] ||
                          `${product.name} image ${index + 1}`
                        }
                        width="96"
                        height="96"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="product-image-placeholder">
              Image indisponible
            </span>
          )}
          {product.isDemo && (
            <span className="demo-image-label">Image de démonstration</span>
          )}
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatMad(product.priceCentimes)}</p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-disclaimer">
            <ShieldCheck aria-hidden="true" size={18} />
            <span>
              {product.isDemo
                ? 'Cette pièce est présentée dans le catalogue de démonstration.'
                : 'Prix et disponibilité confirmés par le catalogue Whimsea.'}
            </span>
          </div>
          <button
            className="button button-primary"
            type="button"
            disabled={product.stockQuantity <= 0}
            onClick={() => addItem(product)}
          >
            {product.stockQuantity > 0 ? 'Ajouter au panier' : 'Épuisé'}
          </button>
          {itemCount > 0 && (
            <Link className="text-link detail-cart-link" to="/cart">
              Voir mon panier ({itemCount})
            </Link>
          )}
          <button className="wishlist-button" type="button" disabled>
            <Heart aria-hidden="true" size={17} /> Favoris non activés
          </button>
        </div>
      </div>
    </main>
  )
}
