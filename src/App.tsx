import {
  ArrowRight,
  Heart,
  Menu,
  Shell,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { CartPage } from './features/cart/CartPage'
import { CartProvider } from './features/cart/CartProvider'
import { useCart } from './features/cart/useCart'
import { CheckoutPage } from './features/checkout/CheckoutPage'
import { OrderConfirmationPage } from './features/checkout/OrderConfirmationPage'
import { AdminDashboardPage } from './features/admin/AdminDashboardPage'
import { AdminLoginPage } from './features/admin/AdminLoginPage'
import { AdminCatalogPage } from './features/admin/AdminCatalogPage'
import { ProductDetailPage } from './features/catalog/ProductDetailPage'
import { ProductCard } from './features/catalog/ProductCard'
import { ShopPage } from './features/catalog/ShopPage'
import { loadCatalog, type CatalogProduct } from './features/catalog/catalog'
import { InstagramIcon } from './components/InstagramIcon'
import { ShellLogo } from './components/ShellLogo'
import {
  AboutPage,
  ContactPage,
  DeliveryReturnsPage,
  PrivacyPage,
  TermsPage,
} from './features/content/BrandContentPages'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from './config/social'

const navigation = [
  { label: 'Accueil', to: '/' },
  { label: 'Boutique', to: '/shop' },
  { label: 'À propos', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const pageTitles: Record<string, string> = {
  '/': 'Whimsea · Colliers de princesse en acier inoxydable',
  '/shop': 'Boutique · Whimsea',
  '/about': 'À propos · Whimsea',
  '/contact': 'Contact · Whimsea',
  '/delivery-returns': 'Livraison & retours · Whimsea',
  '/privacy': 'Confidentialité · Whimsea',
  '/terms': 'Conditions · Whimsea',
}

function SeoMetadata() {
  const { pathname } = useLocation()
  const description =
    'Colliers aesthetic en acier inoxydable de haute qualité, à petit prix. Livraison partout au Maroc, paiement à la livraison.'

  useEffect(() => {
    document.title =
      pageTitles[pathname] ?? 'Whimsea · Bijoux en acier inoxydable au Maroc'
    const descriptionElement = document.querySelector(
      'meta[name="description"]',
    )
    descriptionElement?.setAttribute('content', description)
  }, [pathname, description])

  return null
}
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { itemCount } = useCart()

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Whimsea, accueil">
        <ShellLogo size={22} />
        <span>Whimsea</span>
      </Link>

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>

      <nav
        id="primary-navigation"
        className={`primary-navigation${isOpen ? ' is-open' : ''}`}
        aria-label="Navigation principale"
      >
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            to={item.to}
            onClick={() => setIsOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Link
        className="cart-link"
        to="/cart"
        aria-label={`Panier${itemCount ? `, ${itemCount} article${itemCount > 1 ? 's' : ''}` : ''}`}
      >
        <ShoppingBag aria-hidden="true" size={18} />
        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
      </Link>
    </header>
  )
}

function Sparkle({
  className = '',
  delay = false,
}: {
  className?: string
  delay?: boolean
}) {
  return (
    <span
      className={`sparkle sparkle-twinkle${delay ? ' sparkle-delay' : ''} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" role="presentation">
        <path d="M12 1.5c.8 5.2 2.8 8.2 9.5 10.5-6.7 2.3-8.7 5.3-9.5 10.5C11.2 17.3 9.2 14.3 2.5 12 9.2 9.7 11.2 6.7 12 1.5Z" />
      </svg>
    </span>
  )
}

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<CatalogProduct[]>([])

  useEffect(() => {
    let isCurrent = true
    void loadCatalog()
      .then(({ products }) => {
        if (isCurrent) setFeaturedProducts(products.slice(0, 4))
      })
      .catch(() => {
        if (isCurrent) setFeaturedProducts([])
      })

    return () => {
      isCurrent = false
    }
  }, [])

  return (
    <main>
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-content">
          <Sparkle />
          <p className="eyebrow">Bijoux en acier inoxydable · Maroc</p>
          <h1 id="hero-title">
            Colliers de princesse,
            <em>à petit prix.</em>
          </h1>
          <p className="hero-copy">
            Des bijoux aesthetic inspirés de Pinterest, en acier inoxydable de
            haute qualité : brillants, délicats et résistants à l’eau, pour des
            princess vibes tous les jours.
          </p>
          <Link className="button button-primary" to="/shop">
            Découvrir la boutique <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="hero-art">
          <img
            className="hero-product-image"
            src="/images/products/blush-shimmering-nacre.webp"
            alt="Collier doré sur nacre scintillante"
            width="941"
            height="1671"
            fetchPriority="high"
          />
          <Sparkle className="sparkle-one" delay />
          <Sparkle className="sparkle-two" />
        </div>
      </section>

      <section
        className="collection-section page-section"
        aria-labelledby="collection-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">La sélection Whimsea</p>
            <h2 id="collection-title">
              Vos colliers préférés, version princess vibes.
            </h2>
          </div>
          <Link className="text-link" to="/shop">
            Voir la boutique <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        <div className="collection-grid">
          {[
            [
              'Collier rubis',
              '/images/products/ruby-sand-shell.webp',
              '/products/ruby-necklace',
            ],
            [
              'Collier blush',
              '/images/products/blush-turquoise-gel.webp',
              '/products/blush-necklace',
            ],
            [
              'Collier perle',
              '/images/products/pearl-shell-dish.webp',
              '/products/pearl-necklace',
            ],
          ].map(([collection, image, to]) => (
            <Link className="collection-card" to={to} key={collection}>
              <img
                className="collection-card-image"
                src={image}
                alt={collection}
                width="800"
                height="1000"
                loading="lazy"
              />
              <span className="collection-card-footer">
                <span>{collection}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section
          className="featured-products-section page-section"
          aria-labelledby="featured-products-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Les coups de cœur</p>
              <h2 id="featured-products-title">
                À porter, à offrir, à adorer.
              </h2>
            </div>
            <Link className="text-link" to="/shop">
              Voir tous les colliers <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section
        className="editorial-section page-section"
        aria-labelledby="editorial-title"
      >
        <div className="editorial-copy">
          <p className="eyebrow">Univers nacré</p>
          <h2 id="editorial-title">De la lumière sur chaque détail.</h2>
          <p>
            Nacre, sable et reflets d’eau : des décors tout doux pour des
            bijoux en acier inoxydable qui brillent comme des petits trésors.
          </p>
          <Link className="text-link" to="/products/ruby-necklace">
            Voir le collier Ruby <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        <div className="editorial-mosaic">
          <img
            className="editorial-image editorial-image-large"
            src="/images/products/pearl-iridescent-shell-box.webp"
            alt="Collier doré dans un écrin coquillage irisé"
            width="1086"
            height="1448"
            loading="lazy"
          />
          <img
            className="editorial-image editorial-image-small"
            src="/images/products/ruby-shell-box.webp"
            alt="Collier Ruby dans un écrin nacré"
            width="1086"
            height="1448"
            loading="lazy"
          />
        </div>
      </section>

      <section
        className="story-section page-section"
        aria-labelledby="story-title"
      >
        <div className="story-art">
          <img
            src="/images/products/ruby-lipstick.webp"
            alt="Pendentif rubis sur une texture rouge satinée"
            width="941"
            height="1672"
            loading="lazy"
          />
        </div>
        <div className="story-copy">
          <p className="eyebrow">L’univers Whimsea</p>
          <h2 id="story-title">Un petit coin de magie à porter au cou.</h2>
          <p>
            Chez Whimsea, on aime les bijoux qui brillent sans se ruiner : de
            l’acier inoxydable de haute qualité, des pendentifs mignons et des
            finitions soignées. Parfait pour vous ou pour offrir.
          </p>
          <Link className="text-link" to="/about">
            Découvrir notre histoire <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </section>

      <section
        className="reassurance-section"
        aria-label="Les essentiels Whimsea"
      >
        <div className="reassurance-item">
          <Heart aria-hidden="true" size={21} strokeWidth={1.4} />
          <div>
            <h3>Acier inoxydable haute qualité</h3>
            <p>Ne noircit pas, résiste à l’eau et se porte tous les jours.</p>
          </div>
        </div>
        <div className="reassurance-item">
          <Truck aria-hidden="true" size={21} strokeWidth={1.4} />
          <div>
            <h3>Livraison partout au Maroc</h3>
            <p>Paiement à la livraison : vous payez à la réception.</p>
          </div>
        </div>
        <div className="reassurance-item">
          <Shell aria-hidden="true" size={21} strokeWidth={1.4} />
          <div>
            <h3>Prêt à offrir</h3>
            <p>Un emballage soigné pour chaque commande.</p>
          </div>
        </div>
      </section>

      <section
        className="newsletter-section page-section"
        aria-labelledby="newsletter-title"
      >
        <div>
          <p className="eyebrow">Suivez-nous</p>
          <h2 id="newsletter-title">Rejoignez-nous sur Instagram.</h2>
          <p>
            Nouveautés, inspirations et coups de cœur : retrouvez-nous sur{' '}
            {INSTAGRAM_HANDLE}.
          </p>
        </div>
        <a
          className="button button-secondary newsletter-link"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramIcon size={17} /> Instagram
        </a>
      </section>
    </main>
  )
}

function NotFoundPage() {
  return (
    <main className="placeholder-page">
      <p className="eyebrow">404 · Perle égarée</p>
      <h1>Cette page n’existe pas.</h1>
      <p>Le lien a peut-être changé. Revenons tranquillement à la boutique.</p>
      <Link className="button button-primary" to="/">
        Retour à l’accueil
      </Link>
    </main>
  )
}

function App() {
  return (
    <CartProvider>
      <div className="app-shell">
        <SeoMetadata />
        <ScrollToTop />
        <div className="announcement">
          <Sparkle />
          <span>Livraison partout au Maroc · Paiement à la livraison</span>
          <Sparkle delay />
        </div>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/order-confirmation/:reference"
            element={<OrderConfirmationPage />}
          />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/catalog" element={<AdminCatalogPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/delivery-returns" element={<DeliveryReturnsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <footer className="site-footer">
          <div className="footer-brand">
            <Link className="brand" to="/" aria-label="Whimsea, accueil">
              <ShellLogo size={20} />
              <span>Whimsea</span>
            </Link>
            <p>Little treasures, endless wonder.</p>
            <p className="footer-meta">
              Bijoux en acier inoxydable, livrés partout au Maroc.
            </p>
          </div>
          <div>
            <p className="eyebrow">Navigation</p>
            <div className="footer-links">
              <Link to="/shop">Nos pièces</Link>
              <Link to="/about">À propos</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/delivery-returns">Livraison & retours</Link>
            </div>
          </div>
          <div>
            <p className="eyebrow">Nous trouver</p>
            <div className="footer-socials">
              <a
                aria-label="Whimsea sur Instagram"
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon size={16} /> {INSTAGRAM_HANDLE}
              </a>
            </div>
            <div className="footer-payments">
              <span>Paiement à la livraison</span>
              <Link to="/privacy">Confidentialité</Link>
              <Link to="/terms">Conditions</Link>
            </div>
          </div>
          <p className="footer-copyright">
            © 2026 Whimsea. Tous droits réservés.
          </p>
        </footer>
      </div>
    </CartProvider>
  )
}

export default App
