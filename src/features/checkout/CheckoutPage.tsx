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

/** Évite qu'une requête qui ne répond jamais bloque la page indéfiniment. */
function withTimeout<T>(promise: PromiseLike<T>, ms = 15000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('timeout')), ms)
    Promise.resolve(promise).then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (reason: unknown) => {
        window.clearTimeout(timer)
        reject(reason)
      },
    )
  })
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
    void withTimeout(loadDeliveryZones())
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
        'La commande est momentanément indisponible. Réessayez dans quelques instants.',
      )
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const { data, error } = await withTimeout(
        createCodOrder(client, {
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
        }),
      )

      if (
        error ||
        !data ||
        typeof data !== 'object' ||
        !('reference' in data)
      ) {
        // Le détail technique va dans la console (F12), pas chez la cliente
        console.error('createCodOrder a échoué :', error ?? data)
        setSubmitError(
          'La commande n’a pas pu être confirmée. Vérifiez vos informations et réessayez.',
        )
        return
      }

      window.sessionStorage.setItem(
        `whimsea.order.${data.reference}`,
        JSON.stringify({
          reference: data.reference,
          grandTotalCentimes: data.grand_total_centimes,
          customerName: values.customerName.trim(),
          phone: normalizeMoroccanPhone(values.phone),
        }),
      )
      clearCart()
      // replace : le bouton « retour » ne renvoie pas vers le formulaire déjà envoyé
      window.location.replace(`/order-confirmation/${data.reference}`)
    } catch (caught) {
      console.error('Erreur pendant la commande :', caught)
      setSubmitError(
        caught instanceof Error && caught.message === 'timeout'
          ? 'Le serveur met trop de temps à répondre. Réessayez dans un instant.'
          : 'La commande n’a pas pu être envoyée. Vérifiez votre connexion et réessayez.',
      )
    } finally {
      setIsSubmitting(false)
    }
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
        <p className="eyebrow">Dernière étape</p>
        <h1>Recevoir vos bijoux.</h1>
        <p>
          Paiement à la livraison, en espèces. Aucun paiement en ligne. Nous
          vous appelons pour confirmer votre commande.
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
                Téléphone (nous vous appelons pour confirmer)
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
                  La livraison n’est pas encore ouverte pour votre ville.
                  Contactez-nous sur Instagram pour commander.
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
                {isSubmitting ? 'Envoi en cours…' : 'Confirmer ma commande'}
              </button>
            </fieldset>
          </form>
          <aside className="checkout-summary">
            <p className="eyebrow">Votre commande</p>
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
                {quote ? formatMad(quote.feeCentimes) : 'Choisir une ville'}
              </strong>
            </div>
            <div className="checkout-total">
              <span>Total à payer à la livraison</span>
              <strong>
                {quote ? formatMad(subtotalCentimes + quote.feeCentimes) : '—'}
              </strong>
            </div>
            <div className="checkout-trust">
              <ShieldCheck aria-hidden="true" size={18} />
              Paiement uniquement à la réception de votre colis.
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
