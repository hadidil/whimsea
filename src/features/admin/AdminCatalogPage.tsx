import { ImagePlus, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { normalizeCityKey } from '../delivery/delivery'
import {
  getAdminClient,
  addAdminProductImage,
  loadAdminDeliveryZones,
  loadAdminProductImages,
  loadAdminProducts,
  removeAdminProductImage,
  saveAdminDeliveryZone,
  saveAdminProduct,
  updateAdminProductImage,
  unpublishAdminProduct,
  type AdminDeliveryZone,
  type AdminProduct,
  type AdminProductImage,
} from './admin'
import type { WhimseaSupabaseClient } from '../../lib/supabase'
import { isAllowedProductImage } from '../../security/security'

type ProductDraft = {
  slug: string
  name: string
  description: string
  sku: string
  priceMad: string
  stock: string
  active: boolean
  featured: boolean
}

type ZoneDraft = {
  cityName: string
  cityKey: string
  region: string
  feeMad: string
  enabled: boolean
  notes: string
  sortOrder: string
}

const emptyProduct: ProductDraft = {
  slug: '',
  name: '',
  description: '',
  sku: '',
  priceMad: '',
  stock: '0',
  active: false,
  featured: false,
}

const emptyZone: ZoneDraft = {
  cityName: '',
  cityKey: '',
  region: '',
  feeMad: '',
  enabled: false,
  notes: '',
  sortOrder: '0',
}

function toProductDraft(product: AdminProduct): ProductDraft {
  return {
    slug: product.slug,
    name: product.name,
    description: product.description ?? '',
    sku: product.sku,
    priceMad: (product.price_centimes / 100).toFixed(2),
    stock: String(product.stock_quantity),
    active: product.active,
    featured: product.featured,
  }
}

function toZoneDraft(zone: AdminDeliveryZone): ZoneDraft {
  return {
    cityName: zone.city_name,
    cityKey: zone.normalized_city_key,
    region: zone.region ?? '',
    feeMad:
      zone.fee_centimes === null ? '' : (zone.fee_centimes / 100).toFixed(2),
    enabled: zone.enabled,
    notes: zone.delivery_notes ?? '',
    sortOrder: String(zone.sort_order),
  }
}

function parseMad(value: string) {
  const amount = Number(value.replace(',', '.'))
  return Number.isFinite(amount) && amount >= 0
    ? Math.round(amount * 100)
    : null
}

export function AdminCatalogPage() {
  const navigate = useNavigate()
  const [client, setClient] = useState<WhimseaSupabaseClient | null>(null)
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [zones, setZones] = useState<AdminDeliveryZone[]>([])
  const [product, setProduct] = useState<ProductDraft>(emptyProduct)
  const [zone, setZone] = useState<ZoneDraft>(emptyZone)
  const [editingProductId, setEditingProductId] = useState<string>()
  const [images, setImages] = useState<AdminProductImage[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageAlt, setImageAlt] = useState('')
  const [editingZoneId, setEditingZoneId] = useState<string>()
  const [section, setSection] = useState<'products' | 'delivery'>('products')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const refresh = async (adminClient: WhimseaSupabaseClient) => {
    const [nextProducts, nextZones] = await Promise.all([
      loadAdminProducts(adminClient),
      loadAdminDeliveryZones(adminClient),
    ])
    setProducts(nextProducts)
    setZones(nextZones)
  }

  useEffect(() => {
    void getAdminClient()
      .then(async (adminClient) => {
        if (!adminClient) {
          navigate('/admin/login', { replace: true })
          return
        }
        setClient(adminClient)
        await refresh(adminClient)
      })
      .catch(() => setError('Accès admin indisponible.'))
      .finally(() => setIsLoading(false))
  }, [navigate])

  const showSuccess = (message: string) => {
    setError('')
    setSuccess(message)
    window.setTimeout(() => setSuccess(''), 3500)
  }

  const saveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!client) return
    const price = parseMad(product.priceMad)
    const stock = Number(product.stock)
    if (
      !product.name.trim() ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug) ||
      !product.sku.trim() ||
      price === null ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError('Vérifiez le nom, le slug, le SKU, le prix et le stock.')
      return
    }
    setIsSaving(true)
    try {
      await saveAdminProduct(
        client,
        {
          slug: product.slug.trim(),
          name: product.name.trim(),
          description: product.description.trim() || null,
          sku: product.sku.trim(),
          price_centimes: price,
          stock_quantity: stock,
          active: product.active,
          featured: product.featured,
        },
        editingProductId,
      )
      await refresh(client)
      setProduct(emptyProduct)
      setEditingProductId(undefined)
      showSuccess('Produit enregistré.')
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Échec de sauvegarde.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const unpublishProduct = async (item: AdminProduct) => {
    if (!client || !window.confirm(`Dépublier « ${item.name} » ?`)) return
    try {
      await unpublishAdminProduct(client, item.id)
      await refresh(client)
      showSuccess(
        'Produit dépublié. Les commandes historiques restent intactes.',
      )
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Échec de dépublication.',
      )
    }
  }

  const selectProduct = async (item: AdminProduct) => {
    if (!client) return
    setEditingProductId(item.id)
    setProduct(toProductDraft(item))
    setImageFile(null)
    setImageAlt('')
    try {
      setImages(await loadAdminProductImages(client, item.id))
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Impossible de charger les images.',
      )
    }
  }

  const uploadProductImage = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (!client || !editingProductId || !imageFile) return
    if (!isAllowedProductImage(imageFile)) {
      setError('Choisissez une image JPG, PNG ou WebP de 5 Mo maximum.')
      return
    }
    const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const storagePath = `${editingProductId}/${crypto.randomUUID()}-${safeName}`
    setIsSaving(true)
    try {
      const { error: uploadError } = await client.storage
        .from('product-images')
        .upload(storagePath, imageFile, { upsert: false })
      if (uploadError) throw new Error('Impossible de téléverser l’image.')
      await addAdminProductImage(client, {
        product_id: editingProductId,
        storage_path: storagePath,
        alt_text: imageAlt.trim() || product.name.trim(),
        sort_order: images.length,
      })
      setImages(await loadAdminProductImages(client, editingProductId))
      setImageFile(null)
      setImageAlt('')
      showSuccess('Image ajoutée.')
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Échec du téléversement.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const deleteProductImage = async (image: AdminProductImage) => {
    if (!client || !window.confirm('Supprimer cette image ?')) return
    try {
      const { error: storageError } = await client.storage
        .from('product-images')
        .remove([image.storage_path])
      if (storageError)
        throw new Error('Impossible de supprimer le fichier image.')
      await removeAdminProductImage(client, image.id)
      setImages(images.filter((item) => item.id !== image.id))
      showSuccess('Image supprimée.')
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Échec de suppression.',
      )
    }
  }

  const moveProductImage = async (
    image: AdminProductImage,
    direction: -1 | 1,
  ) => {
    if (!client) return
    const index = images.findIndex((item) => item.id === image.id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= images.length) return
    const reordered = [...images]
    ;[reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ]
    try {
      await Promise.all(
        reordered.map((item, sortOrder) =>
          updateAdminProductImage(client, item.id, { sort_order: sortOrder }),
        ),
      )
      setImages(
        reordered.map((item, sortOrder) => ({
          ...item,
          sort_order: sortOrder,
        })),
      )
    } catch (reorderError) {
      setError(
        reorderError instanceof Error
          ? reorderError.message
          : 'Impossible de réordonner les images.',
      )
    }
  }

  const updateProductImageAlt = async (
    image: AdminProductImage,
    altText: string,
  ) => {
    if (!client || altText === image.alt_text) return
    try {
      await updateAdminProductImage(client, image.id, { alt_text: altText })
      setImages(
        images.map((item) =>
          item.id === image.id ? { ...item, alt_text: altText } : item,
        ),
      )
    } catch (altError) {
      setError(
        altError instanceof Error
          ? altError.message
          : 'Impossible de modifier le texte alternatif.',
      )
    }
  }

  const saveZone = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!client) return
    const fee = zone.feeMad.trim() ? parseMad(zone.feeMad) : null
    if (
      !zone.cityName.trim() ||
      !zone.cityKey.trim() ||
      !/^[a-z0-9-]+$/.test(zone.cityKey) ||
      (zone.feeMad.trim() && fee === null)
    ) {
      setError('Vérifiez la ville, la clé normalisée et le tarif.')
      return
    }
    setIsSaving(true)
    try {
      await saveAdminDeliveryZone(
        client,
        {
          city_name: zone.cityName.trim(),
          normalized_city_key: zone.cityKey.trim(),
          region: zone.region.trim() || null,
          fee_centimes: fee,
          enabled: zone.enabled && fee !== null,
          delivery_notes: zone.notes.trim() || null,
          sort_order: Number(zone.sortOrder) || 0,
        },
        editingZoneId,
      )
      await refresh(client)
      setZone(emptyZone)
      setEditingZoneId(undefined)
      showSuccess('Zone de livraison enregistrée.')
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Échec de sauvegarde.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="admin-page catalog-state">
        <h1>Vérification de l’accès…</h1>
      </main>
    )
  }

  if (!client) {
    return (
      <main className="admin-page catalog-state">
        <p className="eyebrow">Espace privé</p>
        <h1>Accès admin requis.</h1>
        <Link className="button button-secondary" to="/admin/login">
          Retour à la connexion
        </Link>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Whimsea · catalogue</p>
          <h1>Gérer la boutique.</h1>
        </div>
        <Link className="text-link" to="/admin">
          Retour aux commandes
        </Link>
      </header>
      <nav className="admin-tabs" aria-label="Gestion du catalogue">
        <button
          className={section === 'products' ? 'is-active' : ''}
          type="button"
          onClick={() => setSection('products')}
        >
          Produits
        </button>
        <button
          className={section === 'delivery' ? 'is-active' : ''}
          type="button"
          onClick={() => setSection('delivery')}
        >
          Livraison
        </button>
      </nav>
      {error && (
        <p className="checkout-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="admin-success" role="status">
          {success}
        </p>
      )}
      {section === 'products' ? (
        <section className="admin-management">
          <form className="admin-editor" onSubmit={saveProduct}>
            <div className="admin-editor-heading">
              <div>
                <p className="eyebrow">
                  {editingProductId ? 'Modifier' : 'Nouveau'}
                </p>
                <h2>
                  {editingProductId
                    ? 'Modifier le produit'
                    : 'Ajouter un produit'}
                </h2>
              </div>
              <ImagePlus aria-hidden="true" size={22} />
            </div>
            <div className="admin-form-grid">
              <label>
                Nom
                <input
                  required
                  value={product.name}
                  onChange={(event) =>
                    setProduct({ ...product, name: event.target.value })
                  }
                />
              </label>
              <label>
                Slug
                <input
                  required
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  value={product.slug}
                  onChange={(event) =>
                    setProduct({ ...product, slug: event.target.value })
                  }
                />
              </label>
              <label>
                SKU
                <input
                  required
                  value={product.sku}
                  onChange={(event) =>
                    setProduct({ ...product, sku: event.target.value })
                  }
                />
              </label>
              <label>
                Prix (MAD)
                <input
                  required
                  inputMode="decimal"
                  value={product.priceMad}
                  onChange={(event) =>
                    setProduct({ ...product, priceMad: event.target.value })
                  }
                />
              </label>
              <label>
                Stock
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={product.stock}
                  onChange={(event) =>
                    setProduct({ ...product, stock: event.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Description
              <textarea
                rows={4}
                value={product.description}
                onChange={(event) =>
                  setProduct({ ...product, description: event.target.value })
                }
              />
            </label>
            <div className="admin-checks">
              <label>
                <input
                  type="checkbox"
                  checked={product.active}
                  onChange={(event) =>
                    setProduct({ ...product, active: event.target.checked })
                  }
                />{' '}
                Publié
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={product.featured}
                  onChange={(event) =>
                    setProduct({ ...product, featured: event.target.checked })
                  }
                />{' '}
                Mis en avant
              </label>
            </div>
            <div className="admin-actions">
              <button
                className="button button-primary"
                type="submit"
                disabled={isSaving}
              >
                <Save size={15} /> Enregistrer
              </button>
              {editingProductId && (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => {
                    setEditingProductId(undefined)
                    setProduct(emptyProduct)
                    setImages([])
                  }}
                >
                  Annuler
                </button>
              )}
            </div>
            <p className="admin-warning">
              <ImagePlus size={15} /> Les images doivent être ajoutées depuis
              des assets autorisés ; aucun visuel fictif n’est créé ici.
            </p>
          </form>
          {editingProductId && (
            <section className="admin-editor admin-image-editor">
              <div className="admin-editor-heading">
                <div>
                  <p className="eyebrow">Médias</p>
                  <h2>Images du produit</h2>
                </div>
                <ImagePlus aria-hidden="true" size={22} />
              </div>
              <form
                className="admin-image-upload"
                onSubmit={uploadProductImage}
              >
                <label>
                  Fichier image
                  <input
                    accept="image/*"
                    type="file"
                    onChange={(event) =>
                      setImageFile(event.target.files?.[0] ?? null)
                    }
                  />
                </label>
                <label>
                  Texte alternatif
                  <input
                    value={imageAlt}
                    onChange={(event) => setImageAlt(event.target.value)}
                    placeholder={product.name}
                  />
                </label>
                <button
                  className="button button-secondary"
                  disabled={!imageFile || isSaving}
                  type="submit"
                >
                  <Plus size={15} /> Ajouter l’image
                </button>
              </form>
              <div className="admin-image-list">
                {images.length === 0 ? (
                  <p className="admin-muted">Aucune image ajoutée.</p>
                ) : (
                  images.map((image, index) => {
                    const { data } = client!.storage
                      .from('product-images')
                      .getPublicUrl(image.storage_path)
                    return (
                      <div className="admin-image-row" key={image.id}>
                        <img src={data.publicUrl} alt={image.alt_text} />
                        <input
                          aria-label={`Texte alternatif image ${index + 1}`}
                          defaultValue={image.alt_text}
                          onBlur={(event) =>
                            void updateProductImageAlt(
                              image,
                              event.target.value,
                            )
                          }
                        />
                        <button
                          aria-label="Monter l’image"
                          disabled={index === 0}
                          type="button"
                          onClick={() => void moveProductImage(image, -1)}
                        >
                          ↑
                        </button>
                        <button
                          aria-label="Descendre l’image"
                          disabled={index === images.length - 1}
                          type="button"
                          onClick={() => void moveProductImage(image, 1)}
                        >
                          ↓
                        </button>
                        <button
                          aria-label="Supprimer l’image"
                          type="button"
                          onClick={() => void deleteProductImage(image)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          )}
          <div className="admin-list">
            <h2>Produits existants</h2>
            {products.map((item) => (
              <div className="admin-management-row" key={item.id}>
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.sku} · {item.active ? 'Publié' : 'Non publié'} · stock{' '}
                    {item.stock_quantity}
                  </small>
                </span>
                <span className="admin-row-actions">
                  <button
                    type="button"
                    aria-label={`Modifier ${item.name}`}
                    onClick={() => void selectProduct(item)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Dépublier ${item.name}`}
                    onClick={() => void unpublishProduct(item)}
                  >
                    <Trash2 size={15} />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="admin-management">
          <form className="admin-editor" onSubmit={saveZone}>
            <div className="admin-editor-heading">
              <div>
                <p className="eyebrow">
                  {editingZoneId ? 'Modifier' : 'Nouvelle'}
                </p>
                <h2>
                  {editingZoneId ? 'Modifier la zone' : 'Ajouter une zone'}
                </h2>
              </div>
              <Plus aria-hidden="true" size={22} />
            </div>
            <div className="admin-form-grid">
              <label>
                Ville
                <input
                  required
                  value={zone.cityName}
                  onChange={(event) =>
                    setZone({
                      ...zone,
                      cityName: event.target.value,
                      cityKey:
                        zone.cityKey || normalizeCityKey(event.target.value),
                    })
                  }
                />
              </label>
              <label>
                Clé normalisée
                <input
                  required
                  pattern="[a-z0-9-]+"
                  value={zone.cityKey}
                  onChange={(event) =>
                    setZone({
                      ...zone,
                      cityKey: normalizeCityKey(event.target.value),
                    })
                  }
                />
              </label>
              <label>
                Région
                <input
                  value={zone.region}
                  onChange={(event) =>
                    setZone({ ...zone, region: event.target.value })
                  }
                />
              </label>
              <label>
                Frais (MAD)
                <input
                  inputMode="decimal"
                  placeholder="Laisser vide = non tarifé"
                  value={zone.feeMad}
                  onChange={(event) =>
                    setZone({ ...zone, feeMad: event.target.value })
                  }
                />
              </label>
              <label>
                Ordre
                <input
                  type="number"
                  step="1"
                  value={zone.sortOrder}
                  onChange={(event) =>
                    setZone({ ...zone, sortOrder: event.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Notes
              <textarea
                rows={3}
                value={zone.notes}
                onChange={(event) =>
                  setZone({ ...zone, notes: event.target.value })
                }
              />
            </label>
            <label className="admin-check-label">
              <input
                type="checkbox"
                checked={zone.enabled}
                onChange={(event) =>
                  setZone({ ...zone, enabled: event.target.checked })
                }
              />{' '}
              Active uniquement si un tarif réel est renseigné
            </label>
            <div className="admin-actions">
              <button
                className="button button-primary"
                type="submit"
                disabled={isSaving}
              >
                <Save size={15} /> Enregistrer
              </button>
              {editingZoneId && (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => {
                    setEditingZoneId(undefined)
                    setZone(emptyZone)
                  }}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
          <div className="admin-list">
            <h2>Zones existantes</h2>
            {zones.map((item) => (
              <div className="admin-management-row" key={item.id}>
                <span>
                  <strong>{item.city_name}</strong>
                  <small>
                    {item.fee_centimes === null
                      ? 'Non tarifée'
                      : `${(item.fee_centimes / 100).toFixed(2)} MAD`}{' '}
                    · {item.enabled ? 'Active' : 'Désactivée'}
                  </small>
                </span>
                <button
                  type="button"
                  aria-label={`Modifier ${item.city_name}`}
                  onClick={() => {
                    setEditingZoneId(item.id)
                    setZone(toZoneDraft(item))
                  }}
                >
                  <Pencil size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
