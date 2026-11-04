import { ArrowLeft, Heart, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { formatMad, getDemoProducts } from './catalog'
import { useCart } from '../cart/useCart'

export function ProductDetailPage() {
  const { slug } = useParams()
  const product = getDemoProducts().find((item) => item.slug === slug)
  const { addItem, itemCount } = useCart()

  if (!product) {
    return (
      <main className="catalog-state product-not-found">
        <p className="eyebrow">Bijou introuvable</p>
        <h1>Cette pièce n’est pas disponible.</h1>
        <Link className="button button-secondary" to="/shop">
          Retour à la boutique
        </Link>
      </main>
    )
  }

  return (
    <main className="product-detail-page">
      <Link className="back-link" to="/shop">
        <ArrowLeft aria-hidden="true" size={15} /> Retour à la boutique
      </Link>
      <div className={`product-detail-layout product-detail-${product.tone}`}>
        <div className="product-detail-image">
          <span className="product-image-placeholder">
            Photo réelle à venir
          </span>
          <span className="demo-image-label">Image de démonstration</span>
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatMad(product.priceCentimes)}</p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-disclaimer">
            <ShieldCheck aria-hidden="true" size={18} />
            <span>
              Prix, disponibilité et détails réels seront confirmés au
              lancement.
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
            <Heart aria-hidden="true" size={17} /> Ajouter aux favoris (bientôt)
          </button>
        </div>
      </div>
    </main>
  )
}
