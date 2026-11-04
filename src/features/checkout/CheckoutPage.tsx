import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatMad } from '../catalog/catalog'
import {
  findDeliveryQuote,
  loadDeliveryZones,
  type DeliveryZone,
} from '../delivery/delivery'
import { createCodOrder, getSupabaseClient } from '../../lib/supabase'
import {
  hasCheckoutErrors,
  normalizeMoroccanPhone,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutValues,
} from './checkout'
import { useCart } from '../cart/useCart'

const initialValues: CheckoutValues = {
  customerName: '',
  phone: '',
  cityKey: '',
  streetAddress: '',
  landmark: '',
  deliveryNotes: '',
}

function createIdempotencyKey(): string {
  return crypto.randomUUID()
}

export function CheckoutPage() {
  const { cart, clearCart, subtotalCentimes } = useCart()
  const [searchParams] = useSearchParams()
  const [values, setValues] = useState({
    ...initialValues,
    cityKey: searchParams.get('city') ?? '',
  })
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    void loadDeliveryZones()
      .then(setZones)
      .catch(() => setSubmitError('Les zones de livraison sont indisponibles.'))
      .finally(() => setIsLoading(false))
  }, [])

  const quote = useMemo(
    () => findDeliveryQuote(zones, values.cityKey),
    [values.cityKey, zones],
  )

  const updateValue = (field: keyof CheckoutValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateCheckout(values, Boolean(quote))
    if (hasCheckoutErrors(nextErrors)) {
      setErrors(nextErrors)
      return
    }

    const client = getSupabaseClient()
    if (!client) {
      setSubmitError(
        'La commande sera disponible après connexion du catalogue Whimsea.',
      )
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    const { data, error } = await createCodOrder(client, {
      p_idempotency_key: createIdempotencyKey(),
      p_customer_name: values.customerName.trim(),
      p_phone: normalizeMoroccanPhone(values.phone),
      p_city_key: quote!.zone.cityKey,
      p_street_address: values.streetAddress.trim(),
      p_landmark: values.landmark.trim() || null,
      p_delivery_notes: values.deliveryNotes.trim() || null,
      p_items: cart.items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    })

    if (error || !data || typeof data !== 'object' || !('reference' in data)) {
      setSubmitError(
        'La commande n’a pas pu être confirmée. Vérifiez vos informations et réessayez.',
      )
      setIsSubmitting(false)
      return
    }

    window.sessionStorage.setItem(
      `whimsea.order.${data.reference}`,
      JSON.stringify({
        reference: data.reference,
        grandTotalCentimes: data.grand_total_centimes,
      }),
    )
    clearCart()
    window.location.assign(`/order-confirmation/${data.reference}`)
  }

  if (cart.items.length === 0) {
    return (
      <main className="checkout-page catalog-state">
        <p className="eyebrow">Commande</p>
        <h1>Votre panier est vide.</h1>
        <Link className="button button-primary" to="/shop">
          Voir la boutique
        </Link>
      </main>
    )
  }

  return (
    <main className="checkout-page">
      <Link className="back-link" to="/cart">
        <ArrowLeft aria-hidden="true" size={15} /> Retour au panier
      </Link>
      <div className="checkout-heading">
        <p className="eyebrow">Commande invitée</p>
        <h1>Recevoir vos merveilles.</h1>
        <p>
          Paiement en espèces à la livraison. Aucun paiement en ligne ne sera
          demandé.
        </p>
      </div>
      {isLoading ? (
        <div className="catalog-state">
          <h2>Vérification des zones de livraison…</h2>
        </div>
      ) : (
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit} noValidate>
            <fieldset disabled={isSubmitting}>
              <legend>Vos informations</legend>
              <label>
                Nom complet
                <input
                  value={values.customerName}
                  onChange={(event) =>
                    updateValue('customerName', event.target.value)
                  }
                  aria-invalid={Boolean(errors.customerName)}
                />
                {errors.customerName && <small>{errors.customerName}</small>}
              </label>
              <label>
                Téléphone marocain
                <input
                  inputMode="tel"
                  placeholder="06 12 34 56 78"
                  value={values.phone}
                  onChange={(event) => updateValue('phone', event.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone && <small>{errors.phone}</small>}
              </label>
              <label>
                Ville
                <select
                  value={values.cityKey}
                  onChange={(event) =>
                    updateValue('cityKey', event.target.value)
                  }
                  aria-invalid={Boolean(errors.cityKey)}
                >
                  <option value="">Choisir une ville</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.cityKey}>
                      {zone.cityName}
                    </option>
                  ))}
                </select>
                {errors.cityKey && <small>{errors.cityKey}</small>}
              </label>
              {zones.length === 0 && (
                <p className="checkout-error" role="status">
                  Aucune zone de livraison tarifée n’est configurée. La prise de
                  commande reste désactivée jusqu’à la configuration Supabase.
                </p>
              )}
              <label>
                Adresse
                <textarea
                  rows={3}
                  value={values.streetAddress}
                  onChange={(event) =>
                    updateValue('streetAddress', event.target.value)
                  }
                  aria-invalid={Boolean(errors.streetAddress)}
                />
                {errors.streetAddress && <small>{errors.streetAddress}</small>}
              </label>
              <label>
                Repère ou appartement <span>(facultatif)</span>
                <input
                  value={values.landmark}
                  onChange={(event) =>
                    updateValue('landmark', event.target.value)
                  }
                />
              </label>
              <label>
                Note de livraison <span>(facultatif)</span>
                <textarea
                  rows={2}
                  value={values.deliveryNotes}
                  onChange={(event) =>
                    updateValue('deliveryNotes', event.target.value)
                  }
                />
              </label>
              {submitError && (
                <p className="checkout-error" role="alert">
                  {submitError}
                </p>
              )}
              <button
                className="button button-primary checkout-submit"
                type="submit"
                disabled={isSubmitting || !quote}
              >
                {isSubmitting ? 'Confirmation…' : 'Confirmer la commande COD'}
              </button>
            </fieldset>
          </form>
          <aside className="checkout-summary">
            <p className="eyebrow">Résumé sécurisé</p>
            {cart.items.map((item) => (
              <div className="checkout-line" key={item.product.id}>
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <strong>
                  {formatMad(item.product.priceCentimes * item.quantity)}
                </strong>
              </div>
            ))}
            <div className="checkout-line">
              <span>Sous-total</span>
              <strong>{formatMad(subtotalCentimes)}</strong>
            </div>
            <div className="checkout-line">
              <span>Livraison</span>
              <strong>
                {quote ? formatMad(quote.feeCentimes) : 'À configurer'}
              </strong>
            </div>
            <div className="checkout-total">
              <span>Total à payer en espèces</span>
              <strong>
                {quote ? formatMad(subtotalCentimes + quote.feeCentimes) : '—'}
              </strong>
            </div>
            <div className="checkout-trust">
              <ShieldCheck aria-hidden="true" size={18} />
              Les prix, le stock et les frais sont revérifiés côté serveur.
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
