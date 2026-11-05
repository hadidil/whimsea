import { ArrowLeft, Gem, Minus, Plus, Sparkles, Truck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatMad, loadCatalog, type CatalogProduct } from './catalog'
import { ProductGallery } from './ProductGallery'
import { ProductCard } from './ProductCard'
import { useCart } from '../cart/useCart'

export function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<CatalogProduct>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [showStickyBar, setShowStickyBar] = useState(false)
  const mainButtonRef = useRef<HTMLButtonElement>(null)
  const { addItem, itemCount } = useCart()

  useEffect(() => {
    let isCurrent = true

    void loadCatalog()
      .then((result) => {
        if (!isCurrent) return
        setProduct(result.products.find((item) => item.slug === slug))
        setProducts(result.products)
      })
      .catch(() => {
        if (isCurrent) setError('Impossible de charger ce bijou.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [slug])

  useEffect(() => {
    const button = mainButtonRef.current
    if (!button || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0.1 },
    )
    observer.observe(button)
    return () => observer.disconnect()
  }, [product])

  if (isLoading) {
    return (
      <main className="catalog-state product-not-found">
        <p className="eyebrow">La boutique</p>
        <h1>Chargement du bijou…</h1>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="catalog-state product-not-found">
        <p className="eyebrow">Bijou introuvable</p>
        <h1>{error || 'Ce bijou n’est plus disponible.'}</h1>
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

  const imageAlts = imageUrls.map(
    (_, index) =>
      product.imageAltTexts?.[index] ||
      product.imageAlt ||
      `${product.name}, photo ${index + 1} sur ${imageUrls.length}`,
  )

  const rawDescription = product.description?.trim() ?? ''
  const isTechnicalDescription =
    /approved whimsea|catalogue de démonstration|prix et disponibilité/i.test(
      rawDescription,
    )
  const descriptionParagraphs = (
    isTechnicalDescription ? '' : rawDescription
  )
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  const relatedProducts = products
    .filter((item) => item.id !== product.id)
    .slice(0, 4)
  const stockLabel =
    product.stockQuantity <= 0
      ? 'Épuisé'
      : product.stockQuantity <= 3
        ? `Plus que ${product.stockQuantity} ${
            product.stockQuantity === 1 ? 'pièce' : 'pièces'
          }`
        : 'En stock'
  const addToCart = () => {
    addItem(product, quantity)
    setIsAdded(true)
    setCartMessage(`${product.name} ajouté au panier`)
    window.setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <main className="product-detail-page">
      <Link className="back-link" to="/shop">
        <ArrowLeft aria-hidden="true" size={15} /> Boutique / {product.name}
      </Link>
      <div className={`product-detail-layout product-detail-${product.tone}`}>
        <div className="product-detail-media">
          <ProductGallery
            alts={imageAlts}
            images={imageUrls}
            key={product.id}
            name={product.name}
          />
          {product.isDemo && (
            <span className="demo-image-label">Image de démonstration</span>
          )}
        </div>

        <div className="product-detail-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatMad(product.priceCentimes)}</p>

          <div className="detail-description">
            {descriptionParagraphs.length ? (
              descriptionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))
            ) : (
              <p>
                Collier en acier inoxydable de haute qualité, brillant et
                délicat, à porter tous les jours.
              </p>
            )}
          </div>

          <ul className="detail-highlights">
            <li>
              <Gem aria-hidden="true" size={18} />
              Acier inoxydable haute qualité, ne noircit pas
            </li>
            <li>
              <Sparkles aria-hidden="true" size={18} />
              Finition glaze brillante
            </li>
            <li>
              <Truck aria-hidden="true" size={18} />
              Livraison partout au Maroc · Paiement à la livraison
            </li>
          </ul>

          <p className={`stock-label detail-stock${stockLabel === 'Épuisé' ? ' sold-out' : ''}`}>
            {stockLabel}
          </p>
          {product.stockQuantity > 0 && (
            <div className="quantity-selector" aria-label="Quantité">
              <span>Quantité</span>
              <div>
                <button
                  aria-label="Diminuer la quantité"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  type="button"
                >
                  <Minus aria-hidden="true" size={16} />
                </button>
                <output aria-live="polite">{quantity}</output>
                <button
                  aria-label="Augmenter la quantité"
                  disabled={quantity >= product.stockQuantity}
                  onClick={() =>
                    setQuantity((value) =>
                      Math.min(product.stockQuantity, value + 1),
                    )
                  }
                  type="button"
                >
                  <Plus aria-hidden="true" size={16} />
                </button>
              </div>
            </div>
          )}
          <button
            className="button button-primary"
            disabled={product.stockQuantity <= 0}
            onClick={addToCart}
            ref={mainButtonRef}
            type="button"
          >
            {product.stockQuantity > 0
              ? isAdded
                ? 'Ajouté ✓'
                : 'Ajouter au panier'
              : 'Épuisé'}
          </button>
          <div aria-live="polite" className="cart-feedback">
            {cartMessage && (
              <>
                <span>{cartMessage}</span>{' '}
                <Link to="/cart">Voir le panier</Link>
              </>
            )}
          </div>
          <Link className="text-link detail-cart-link" to="/cart">
            Voir mon panier ({itemCount})
          </Link>
        </div>
      </div>
      {relatedProducts.length > 0 && (
        <section className="related-products" aria-labelledby="related-products-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Pour vous</p>
              <h2 id="related-products-title">Vous aimerez aussi</h2>
            </div>
          </div>
          <div className="product-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
      {showStickyBar && product.stockQuantity > 0 && (
        <div className="mobile-sticky-cart">
          <strong>{formatMad(product.priceCentimes * quantity)}</strong>
          <button className="button button-primary" onClick={addToCart} type="button">
            {isAdded ? 'Ajouté ✓' : 'Ajouter au panier'}
          </button>
        </div>
      )}
    </main>
  )
}
