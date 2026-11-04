import { Mail, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

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
      intro="Whimsea prépare une boutique marocaine de bijoux délicats pour les petits moments qui deviennent de grands souvenirs."
    >
      <section>
        <h2>Une histoire à compléter avec vous</h2>
        <p>
          Cette présentation est un brouillon éditorial. L’histoire officielle
          de la marque, ses engagements et les informations sur les créations
          seront ajoutés après validation de la propriétaire.
        </p>
      </section>
      <p className="approval-note" role="note">
        Brouillon nécessitant validation propriétaire avant publication.
      </p>
    </ContentPage>
  )
}

export function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="Parlons bijoux."
      intro="Une question sur une commande ou une création ? Les coordonnées officielles seront publiées ici dès qu’elles seront confirmées."
    >
      <section className="contact-placeholder">
        <Mail aria-hidden="true" size={22} />
        <div>
          <h2>Coordonnées à confirmer</h2>
          <p>
            Aucun numéro, e-mail ou compte social n’est inventé dans cette
            version. Pour une commande, utilisez le parcours de checkout quand
            la boutique et ses zones de livraison sont configurées.
          </p>
          <Link className="text-link" to="/shop">
            Voir la boutique
          </Link>
        </div>
      </section>
      <p className="approval-note" role="note">
        Ajouter ici un e-mail, un numéro et les réseaux sociaux approuvés par la
        propriétaire.
      </p>
    </ContentPage>
  )
}

export function DeliveryReturnsPage() {
  return (
    <ContentPage
      eyebrow="Livraison & retours"
      title="Des informations claires avant de commander."
      intro="Les frais et zones de livraison seront affichés depuis les données administrées dans Supabase."
    >
      <section>
        <Truck aria-hidden="true" size={22} />
        <h2>Livraison au Maroc</h2>
        <p>
          Le paiement de la V1 se fait à la livraison. Une commande ne peut être
          envoyée que vers une ville activée avec un tarif configuré par la
          propriétaire.
        </p>
      </section>
      <section>
        <h2>Retours et échanges</h2>
        <p>
          Les délais, conditions, frais et exclusions de retour restent à
          confirmer. Aucun engagement légal ou commercial n’est présenté comme
          définitif dans ce brouillon.
        </p>
      </section>
      <p className="approval-note" role="note">
        Texte juridique et politique de retour nécessitant validation avant
        publication.
      </p>
    </ContentPage>
  )
}

export function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Confidentialité"
      title="Votre commande, vos données."
      intro="Cette page décrit le périmètre technique actuel sans remplacer une politique juridique validée."
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
        <h2>À compléter</h2>
        <p>
          Identité du responsable, durée de conservation, droits applicables et
          contact confidentialité doivent être ajoutés après validation
          propriétaire et juridique.
        </p>
      </section>
      <p className="approval-note" role="note">
        Brouillon nécessitant validation juridique avant publication.
      </p>
    </ContentPage>
  )
}

export function TermsPage() {
  return (
    <ContentPage
      eyebrow="Conditions"
      title="Les règles de la boutique."
      intro="Les conditions de vente finales seront publiées avant l’ouverture de la boutique."
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
        <h2>Informations à confirmer</h2>
        <p>
          Prix, disponibilité, délais, retours, garanties, identité légale et
          modalités de contact doivent être remplis avec les informations
          approuvées par la propriétaire.
        </p>
      </section>
      <p className="approval-note" role="note">
        Conditions de vente à valider avant toute commande réelle.
      </p>
    </ContentPage>
  )
}
