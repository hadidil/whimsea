import {
  ArrowRight,
  Gem,
  Heart,
  Menu,
  ShoppingBag,
  Sparkles,
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
import { ShopPage } from './features/catalog/ShopPage'
import {
  AboutPage,
  ContactPage,
  DeliveryReturnsPage,
  PrivacyPage,
  TermsPage,
} from './features/content/BrandContentPages'

const navigation = [
  { label: 'Accueil', to: '/' },
  { label: 'Boutique', to: '/shop' },
  { label: 'À propos', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const pageTitles: Record<string, string> = {
  '/': 'Whimsea · Little treasures, endless wonder',
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
    'Whimsea, des bijoux délicats et lumineux pour les petits moments précieux.'

  useEffect(() => {
    document.title =
      pageTitles[pathname] ?? 'Whimsea · Bijoux délicats au Maroc'
    const descriptionElement = document.querySelector(
      'meta[name="description"]',
    )
    descriptionElement?.setAttribute('content', description)
  }, [pathname, description])

  return null
}

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { itemCount } = useCart()

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Whimsea, accueil">
        <Gem aria-hidden="true" size={18} strokeWidth={1.5} />
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

function HomePage() {
  return (
    <main>
      <div className="announcement">
        <Sparkles aria-hidden="true" size={14} />
        <span>Un petit monde précieux arrive bientôt</span>
        <Sparkles aria-hidden="true" size={14} />
      </div>
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-content">
          <p className="eyebrow">Bijoux délicats · Maroc</p>
          <h1 id="hero-title">
            Little treasures,
            <em>endless wonder.</em>
          </h1>
          <p className="hero-copy">
            Des bijoux doux et lumineux, imaginés pour accompagner les petits
            moments qui deviennent de grands souvenirs.
          </p>
          <Link className="button button-primary" to="/shop">
            Découvrir la boutique <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div
          className="hero-art"
          aria-label="Illustration décorative de perles"
        >
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-pearl hero-pearl-large" />
          <div className="hero-pearl hero-pearl-small" />
          <div className="hero-chain" />
          <span className="hero-art-label">made with wonder</span>
          <span className="sparkle sparkle-one" aria-hidden="true">
            ✦
          </span>
          <span className="sparkle sparkle-two" aria-hidden="true">
            ✧
          </span>
        </div>
      </section>

      <section
        className="collection-section page-section"
        aria-labelledby="collection-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">À découvrir bientôt</p>
            <h2 id="collection-title">Des détails qui font rêver.</h2>
          </div>
          <Link className="text-link" to="/shop">
            Voir la boutique <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        <div className="collection-grid">
          {['Pearls & light', 'Everyday magic', 'Little keepsakes'].map(
            (collection, index) => (
              <Link
                className={`collection-card card-tone-${index + 1}`}
                to="/shop"
                key={collection}
              >
                <span className="card-placeholder">Image à venir</span>
                <span className="collection-card-footer">
                  <span>{collection}</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </span>
              </Link>
            ),
          )}
        </div>
      </section>

      <section
        className="story-section page-section"
        aria-labelledby="story-title"
      >
        <div className="story-art" aria-hidden="true">
          <div className="story-disc story-disc-one" />
          <div className="story-disc story-disc-two" />
          <div className="story-line" />
          <span className="story-sparkle">✦</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow">L’univers Whimsea</p>
          <h2 id="story-title">Une touche de poésie, tous les jours.</h2>
          <p>
            Whimsea est un petit refuge pour les bijoux qui se portent comme un
            secret : délicats, personnels et toujours un peu magiques.
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
            <h3>Pensé avec soin</h3>
            <p>Une sélection douce, à découvrir prochainement.</p>
          </div>
        </div>
        <div className="reassurance-item">
          <Truck aria-hidden="true" size={21} strokeWidth={1.4} />
          <div>
            <h3>Livraison au Maroc</h3>
            <p>Les détails seront annoncés avec la boutique.</p>
          </div>
        </div>
        <div className="reassurance-item">
          <Gem aria-hidden="true" size={21} strokeWidth={1.4} />
          <div>
            <h3>Un peu de merveilleux</h3>
            <p>Pour offrir, garder, et faire sourire.</p>
          </div>
        </div>
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
              <Gem aria-hidden="true" size={17} strokeWidth={1.5} />
              <span>Whimsea</span>
            </Link>
            <p>Little treasures, endless wonder.</p>
          </div>
          <div className="footer-meta">
            <span>Une aventure marocaine, bientôt.</span>
            <div className="footer-links">
              <Link to="/delivery-returns">Livraison & retours</Link>
              <Link to="/privacy">Confidentialité</Link>
              <Link to="/terms">Conditions</Link>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}

export default App
