import { CheckCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { formatMad } from '../catalog/catalog'

export function OrderConfirmationPage() {
  const { reference } = useParams()
  const stored = reference
    ? window.sessionStorage.getItem(`whimsea.order.${reference}`)
    : null
  const order = stored
    ? (JSON.parse(stored) as { grandTotalCentimes?: number })
    : null

  return (
    <main className="confirmation-page catalog-state">
      <CheckCircle2 aria-hidden="true" size={38} />
      <p className="eyebrow">Commande reçue</p>
      <h1>Merci pour votre confiance.</h1>
      <p>
        Votre demande de commande a été enregistrée. Le paiement se fera en
        espèces à la livraison.
      </p>
      {reference && <strong>Référence : {reference}</strong>}
      {order?.grandTotalCentimes && (
        <p>Total confirmé : {formatMad(order.grandTotalCentimes)}</p>
      )}
      <Link className="button button-primary" to="/shop">
        Retour à la boutique
      </Link>
    </main>
  )
}
