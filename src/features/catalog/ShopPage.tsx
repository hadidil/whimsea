import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadCatalog, type CatalogProduct } from './catalog'
import { ProductCard } from './ProductCard'

type SortOption = 'featured' | 'price-low' | 'price-high' | 'name'

export function ShopPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Toutes')
  const [sort, setSort] = useState<SortOption>('featured')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    void loadCatalog()
      .then((result) => {
        if (!isCurrent) return
        setProducts(result.products)
        setIsDemo(result.isDemo)
      })
      .catch(() => {
        if (isCurrent) setError('La boutique est momentanément indisponible.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const categories = useMemo(
    () => ['Toutes', ...new Set(products.map((product) => product.category))],
    [products],
  )

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr')
    const filtered = products.filter((product) => {
      const matchesCategory =
        category === 'Toutes' || product.category === category
      const searchable =
        `${product.name} ${product.category}`.toLocaleLowerCase('fr')
      return matchesCategory && searchable.includes(normalizedQuery)
    })

    return [...filtered].sort((a, b) => {
      if (sort === 'price-low') return a.priceCentimes - b.priceCentimes
      if (sort === 'price-high') return b.priceCentimes - a.priceCentimes
      if (sort === 'name') return a.name.localeCompare(b.name, 'fr')
      return Number(b.featured) - Number(a.featured)
    })
  }, [category, products, query, sort])

  const clearFilters = () => {
    setCategory('Toutes')
    setQuery('')
    setSort('featured')
  }

  return (
    <main className="shop-page">
      <section className="shop-intro">
        <p className="eyebrow">La boutique</p>
        <h1>Colliers aesthetic, princess vibes.</h1>
        <p>
          Des bijoux en acier inoxydable de haute qualité, brillants et à petit
          prix. Livraison partout au Maroc, paiement à la livraison.
        </p>
      </section>

      {isDemo && (
        <div className="demo-notice" role="status">
          <span>Mode démonstration</span>
          <p>
            Les articles affichés sont des exemples et ne sont pas disponibles à
            l’achat.
          </p>
          <Link to="/contact">Nous contacter</Link>
        </div>
      )}

      <section className="shop-controls" aria-label="Filtres de boutique">
        <label className="search-field">
          <Search aria-hidden="true" size={17} />
          <span className="sr-only">Rechercher un bijou</span>
          <input
            type="search"
            value={query}
            placeholder="Rechercher un collier"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label="Effacer la recherche"
              onClick={() => setQuery('')}
            >
              <X aria-hidden="true" size={15} />
            </button>
          )}
        </label>
        <div className="category-tabs" aria-label="Catégories">
          {categories.map((item) => (
            <button
              className={category === item ? 'is-selected' : undefined}
              key={item}
              type="button"
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="sort-field">
          <SlidersHorizontal aria-hidden="true" size={16} />
          <span className="sr-only">Trier les bijoux</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
          >
            <option value="featured">Mis en avant</option>
            <option value="price-low">Prix croissant</option>
            <option value="price-high">Prix décroissant</option>
            <option value="name">Nom</option>
          </select>
        </label>
      </section>

      {isLoading && (
        <div className="product-grid" aria-label="Chargement des bijoux">
          {[1, 2, 3].map((item) => (
            <div className="product-skeleton" key={item} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="catalog-state">
          <h2>Un instant, la boutique se réveille.</h2>
          <p>{error}</p>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      )}

      {!isLoading && !error && visibleProducts.length > 0 && (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!isLoading && !error && visibleProducts.length === 0 && (
        <div className="catalog-state">
          <h2>Aucun bijou trouvé.</h2>
          <p>Essayez une autre recherche ou revenez à toute la sélection.</p>
          <button
            type="button"
            className="button button-secondary"
            onClick={clearFilters}
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </main>
  )
}
