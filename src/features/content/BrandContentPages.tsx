import { ShieldCheck, Truck } from 'lucide-react'
import { instagramUrl } from '../../config/public'
import { InstagramIcon } from '../../components/InstagramIcon'

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
      title="Une touche de poésie, tous les jours."
      intro="Bienvenue dans l'univers Whimsea."
    >
      <section>
        <h2>Bienvenue dans l'univers Whimsea</h2>
        <p>
          Whimsea est une petite boutique de bijoux née d'une envie simple :
          apporter une touche de douceur, de fantaisie et d'éclat au quotidien.
        </p>
        <p>
          Inspiré par les reflets de la mer, les coquillages, les perles et les
          petits détails qui font toute la différence, l'univers Whimsea mêle
          féminité, délicatesse et une pointe de magie.
        </p>
        <p>
          Des bijoux à porter au quotidien, à offrir ou à s'offrir, pour ajouter
          un peu de lumière à chaque moment.
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
      intro="Une question sur un bijou ou une commande ? Retrouvez-nous sur Instagram, nous serons ravis de vous répondre."
    >
      <section className="contact-placeholder">
        <InstagramIcon size={22} />
        <div>
          <h2>Whimsea sur Instagram</h2>
          <p>
            Une question sur un bijou ou une commande ? Écrivez-nous sur
            Instagram, nous serons ravis de vous répondre.
          </p>
          {instagramUrl ? (
            <a
              className="text-link"
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ouvrir Instagram
            </a>
          ) : (
            <p className="contact-configuration">
              Le lien Instagram sera disponible dès que le compte officiel sera
              configuré.
            </p>
          )}
        </div>
      </section>
    </ContentPage>
  )
}

export function DeliveryReturnsPage() {
  return (
    <ContentPage
      eyebrow="Livraison & retours"
      title="Des informations claires avant de commander."
      intro="Les frais de livraison sont calculés selon la ville choisie au moment de la commande."
    >
      <section>
        <Truck aria-hidden="true" size={22} />
        <h2>Livraison au Maroc</h2>
        <p>
          Le paiement de la V1 se fait à la livraison. Une commande ne peut être
          envoyée que vers une ville activée et tarifée.
        </p>
      </section>
      <section>
        <h2>Retours et échanges</h2>
        <p>
          Pour toute question concernant une commande, retrouvez-nous sur
          Instagram avant de confirmer votre demande.
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
          Le checkout demande uniquement les informations nécessaires à la
          livraison : nom, téléphone, ville, adresse et, si besoin, un repère ou
          une note. Les données de commande sont destinées aux opérations
          Whimsea et ne sont pas exposées dans le catalogue public.
        </p>
      </section>
      <section>
        <h2>Utilisation des données</h2>
        <p>
          Les informations de commande sont utilisées pour préparer et suivre la
          livraison, puis restent accessibles aux comptes administrateurs
          autorisés.
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
          La V1 prévoit uniquement le paiement en espèces à la livraison. Le
          montant affiché au checkout est confirmé par le serveur au moment de
          la création de la commande.
        </p>
      </section>
      <section>
        <h2>Commande et livraison</h2>
        <p>
          Les prix et la disponibilité sont vérifiés au moment de la commande.
          Le paiement se fait exclusivement à la livraison, en espèces.
        </p>
      </section>
    </ContentPage>
  )
}
