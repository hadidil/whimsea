import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadCatalog } from '../catalog/catalog'
import { formatMad } from '../catalog/catalog'
import {
  findDeliveryQuote,
  loadDeliveryZones,
  type DeliveryZone,
} from '../delivery/delivery'
import { reconcileCart } from './cart'
import { useCart } from './useCart'

export function CartPage() {
  const { cart, subtotalCentimes, updateQuantity, removeItem, replaceCart } =
    useCart()
  const [isReconciled, setIsReconciled] = useState(false)
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [city, setCity] = useState('')
  const [deliveryError, setDeliveryError] = useState('')

  useEffect(() => {
    void loadCatalog()
      .then(({ products }) => {
        const currentCart = reconcileCart(cart, products)
        const changed =
          currentCart.items.length !== cart.items.length ||
          currentCart.items.some((item, index) => {
            const previous = cart.items[index]
            return (
              !previous ||
              item.product.id !== previous.product.id ||
              item.product.priceCentimes !== previous.product.priceCentimes ||
              item.quantity !== previous.quantity
            )
          })
        if (changed) replaceCart(currentCart)
        setIsReconciled(true)
      })
      .catch(() => {
        setIsReconciled(true)
      })
  }, [cart, replaceCart])

  useEffect(() => {
    void loadDeliveryZones()
      .then(setZones)
      .catch(() =>
        setDeliveryError(
          'Les frais de livraison sont indisponibles pour le moment.',
        ),
      )
  }, [])

  if (!isReconciled) {
    return (
      <main className="cart-page catalog-state">
        <p className="eyebrow">Votre panier</p>
        <h1>Vérification des disponibilités…</h1>
      </main>
    )
  }

  if (cart.items.length === 0) {
    return (
      <main className="cart-page catalog-state">
        <ShoppingBag aria-hidden="true" size={28} />
        <p className="eyebrow">Votre panier</p>
        <h1>Votre panier est encore vide.</h1>
        <p>Découvrez les pièces délicates de la sélection Whimsea.</p>
        <Link className="button button-primary" to="/shop">
          Voir la boutique
        </Link>
      </main>
    )
  }

  const deliveryQuote = findDeliveryQuote(zones, city)

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <p className="eyebrow">Votre panier</p>
          <h1>Vos petites merveilles.</h1>
        </div>
        <Link className="text-link" to="/shop">
          Continuer mes achats
        </Link>
      </div>
      <div className="cart-layout">
        <section className="cart-items" aria-label="Articles dans le panier">
          {cart.items.map((item) => (
            <article className="cart-item" key={item.product.id}>
              <div className="cart-item-image">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.imageAlt || item.product.name}
                    width="96"
                    height="96"
                    loading="lazy"
                  />
                ) : (
                  <span>Image indisponible</span>
                )}
              </div>
              <div className="cart-item-details">
                <p className="product-category">{item.product.category}</p>
                <h2>{item.product.name}</h2>
                <p className="product-price">
                  {formatMad(item.product.priceCentimes)}
                </p>
                <div className="cart-item-actions">
                  <div
                    className="quantity-control"
                    aria-label={`Quantité de ${item.product.name}`}
                  >
                    <button
                      type="button"
                      aria-label={`Diminuer la quantité de ${item.product.name}`}
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                    >
                      <Minus aria-hidden="true" size={14} />
                    </button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Augmenter la quantité de ${item.product.name}`}
                      disabled={item.quantity >= item.product.stockQuantity}
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                    >
                      <Plus aria-hidden="true" size={14} />
                    </button>
                  </div>
                  <button
                    className="remove-item"
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                  >
                    <Trash2 aria-hidden="true" size={15} /> Retirer
                  </button>
                </div>
              </div>
              <strong>
                {formatMad(item.product.priceCentimes * item.quantity)}
              </strong>
            </article>
          ))}
        </section>
        <aside className="cart-summary">
          <p className="eyebrow">Résumé</p>
          <div>
            <span>Sous-total estimé</span>
            <strong>{formatMad(subtotalCentimes)}</strong>
          </div>
          <label className="delivery-field">
            <span>Ville de livraison</span>
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
              <option value="">Choisir une ville</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.cityKey}>
                  {zone.cityName}
                </option>
              ))}
            </select>
          </label>
          {zones.length === 0 && !deliveryError && (
            <p className="delivery-feedback">
              Les villes et tarifs seront affichés après configuration de la
              livraison.
            </p>
          )}
          {deliveryError && (
            <p className="delivery-feedback">{deliveryError}</p>
          )}
          {deliveryQuote && (
            <div className="delivery-quote">
              <span>Livraison estimée</span>
              <strong>{formatMad(deliveryQuote.feeCentimes)}</strong>
            </div>
          )}
          {deliveryQuote && (
            <div className="cart-total">
              <span>Total estimé</span>
              <strong>
                {formatMad(subtotalCentimes + deliveryQuote.feeCentimes)}
              </strong>
            </div>
          )}
          <p>
            Le total final, la couverture et la disponibilité seront vérifiés
            côté serveur au moment de la commande.
          </p>
          {deliveryQuote ? (
            <Link
              className="button button-primary"
              to={`/checkout?city=${encodeURIComponent(deliveryQuote.zone.cityKey)}`}
            >
              Passer la commande
            </Link>
          ) : (
            <button className="button button-primary" type="button" disabled>
              Livraison à configurer
            </button>
          )}
        </aside>
      </div>
    </main>
  )
}
