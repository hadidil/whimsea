import { ShieldCheck, Truck } from 'lucide-react'
import { InstagramIcon } from '../../components/InstagramIcon'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../../config/social'

type ContentPageProps = {
  eyebrow: string
  title: string
  intro: string
  children: React.ReactNode
}

function ContentPage({ eyebrow, title, intro, children }: ContentPageProps) {
  return (
    <main className="content-page">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="content-page-intro">{intro}</p>
      <div className="content-page-body">{children}</div>
    </main>
  )
}

export function AboutPage() {
  return (
    <ContentPage
      eyebrow="L’univers Whimsea"
      title="Un petit coin de magie à porter au cou."
      intro="Des bijoux aesthetic, brillants et abordables, pensés pour celles qui aiment les détails."
    >
      <section>
        <h2>Bienvenue chez Whimsea</h2>
        <p>
          Whimsea est une petite boutique de bijoux en acier inoxydable, née
          d’une envie simple : proposer des colliers de princesse, délicats et
          brillants, à petit prix.
        </p>
        <p>
          Inspirée par la mer, les coquillages, les perles et l’esthétique
          Pinterest, la boutique mêle féminité, douceur et une pointe de magie.
        </p>
        <p>
          Nos bijoux sont en acier inoxydable de haute qualité : ils résistent à
          l’eau, ne noircissent pas et se portent au quotidien. Parfaits pour
          s’offrir un petit plaisir ou faire un cadeau qui fait sourire.
        </p>
        <p>
          <strong>Un petit bijou, une touche de magie.</strong>
        </p>
      </section>
    </ContentPage>
  )
}

export function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="Parlons bijoux."
      intro="Une question sur un collier, une commande ou une livraison ? Écrivez-nous sur Instagram."
    >
      <section className="contact-placeholder">
        <InstagramIcon size={22} />
        <div>
          <h2>Suivez-nous et écrivez-nous sur Instagram</h2>
          <p>
            Retrouvez toutes nos nouveautés et répondez-nous en message privé :
            nous vous répondons avec plaisir.
          </p>
          <p>
            <strong>{INSTAGRAM_HANDLE}</strong>
          </p>
          <a
            className="button button-secondary"
            href={INSTAGRAM_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <InstagramIcon size={16} /> Ouvrir Instagram
          </a>
        </div>
      </section>
    </ContentPage>
  )
}

export function DeliveryReturnsPage() {
  return (
    <ContentPage
      eyebrow="Livraison & retours"
      title="Livraison partout au Maroc."
      intro="Vous commandez, nous vous appelons pour confirmer, vous payez à la réception."
    >
      <section>
        <Truck aria-hidden="true" size={22} />
        <h2>Livraison et paiement</h2>
        <p>
          Nous livrons partout au Maroc. Le paiement se fait en espèces à la
          livraison : vous ne payez rien en ligne. Les frais de livraison
          dépendent de votre ville et s’affichent avant de confirmer.
        </p>
      </section>
      <section>
        <h2>Retours et échanges</h2>
        <p>
          Un souci avec votre commande ? Écrivez-nous sur Instagram{' '}
          {INSTAGRAM_HANDLE}, nous trouverons une solution ensemble.
        </p>
      </section>
    </ContentPage>
  )
}

export function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Confidentialité"
      title="Votre commande, vos données."
      intro="Voici les informations essentielles sur les données nécessaires à une commande."
    >
      <section>
        <ShieldCheck aria-hidden="true" size={22} />
        <h2>Données utilisées pour une commande</h2>
        <p>
          Nous demandons uniquement ce qui sert à la livraison : nom, téléphone,
          ville, adresse et, si besoin, un repère ou une note. Ces données sont
          réservées à la préparation et au suivi de votre commande.
        </p>
      </section>
      <section>
        <h2>Utilisation des données</h2>
        <p>
          Vos informations sont utilisées pour vous appeler afin de confirmer la
          commande, puis pour organiser la livraison. Elles ne sont jamais
          affichées publiquement.
        </p>
      </section>
    </ContentPage>
  )
}

export function TermsPage() {
  return (
    <ContentPage
      eyebrow="Conditions"
      title="Les règles de la boutique."
      intro="Les informations essentielles à connaître avant de confirmer une commande."
    >
      <section>
        <h2>Paiement à la livraison</h2>
        <p>
          Le paiement se fait uniquement en espèces, à la réception de votre
          colis. Le montant affiché au moment de la commande est celui que vous
          réglez au livreur.
        </p>
      </section>
      <section>
        <h2>Commande et confirmation</h2>
        <p>
          Les prix et la disponibilité sont vérifiés au moment de la commande.
          Nous vous appelons ensuite pour confirmer votre commande avant
          l’envoi.
        </p>
      </section>
    </ContentPage>
  )
}
