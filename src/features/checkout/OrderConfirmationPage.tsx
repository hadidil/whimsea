import { CheckCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { InstagramIcon } from '../../components/InstagramIcon'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../../config/social'
import { formatMad } from '../catalog/catalog'

type StoredOrder = {
  grandTotalCentimes?: number
  customerName?: string
  phone?: string
}

function readStoredOrder(reference?: string): StoredOrder | null {
  if (!reference) return null
  try {
    const stored = window.sessionStorage.getItem(`whimsea.order.${reference}`)
    return stored ? (JSON.parse(stored) as StoredOrder) : null
  } catch {
    return null
  }
}

export function OrderConfirmationPage() {
  const { reference } = useParams()
  const order = readStoredOrder(reference)
  const firstName = order?.customerName?.trim().split(/\s+/)[0]

  return (
    <main className="confirmation-page catalog-state">
      <CheckCircle2 aria-hidden="true" size={44} />
      <p className="eyebrow">Commande reçue</p>
      <h1>Votre commande est passée !</h1>
      <p>
        {firstName ? `Merci ${firstName} ! ` : 'Merci ! '}
        Vous allez recevoir un appel de confirmation très bientôt
        {order?.phone ? ` au ${order.phone}` : ''}. Gardez votre téléphone à
        portée de main.
      </p>
      <div className="confirmation-call">
        Paiement en espèces à la livraison, partout au Maroc.
      </div>
      {reference && <strong>Référence : {reference}</strong>}
      {order?.grandTotalCentimes ? (
        <p>
          Total à payer à la livraison : {formatMad(order.grandTotalCentimes)}
        </p>
      ) : null}
      <div className="confirmation-actions">
        <Link className="button button-primary" to="/shop">
          Continuer mes achats
        </Link>
        <a
          className="button button-secondary"
          href={INSTAGRAM_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          <InstagramIcon size={16} /> {INSTAGRAM_HANDLE}
        </a>
      </div>
    </main>
  )
}
