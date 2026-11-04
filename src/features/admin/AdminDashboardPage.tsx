import { LogOut, RefreshCw, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatMad } from '../catalog/catalog'
import {
  formatOrderDate,
  getAdminClient,
  loadAdminOrders,
  loadOrderItems,
  orderStatuses,
  updateOrderStatus,
  type Order,
  type OrderItem,
  type OrderStatus,
} from './admin'
import type { WhimseaSupabaseClient } from '../../lib/supabase'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const [client, setClient] = useState<WhimseaSupabaseClient | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [search, setSearch] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const refresh = async (adminClient: WhimseaSupabaseClient) => {
    setOrders(await loadAdminOrders(adminClient))
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

  const filteredOrders = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('fr')
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter
      const matchesSearch =
        !needle ||
        [order.public_reference, order.customer_name, order.phone, order.city]
          .join(' ')
          .toLocaleLowerCase('fr')
          .includes(needle)
      return matchesStatus && matchesSearch
    })
  }, [orders, search, statusFilter])

  const openOrder = async (order: Order) => {
    setSelected(order)
    setNotes(order.internal_notes ?? '')
    if (client) setItems(await loadOrderItems(client, order.id))
  }

  const saveStatus = async (status: OrderStatus) => {
    if (!client || !selected) return
    setIsSaving(true)
    setError('')
    try {
      await updateOrderStatus(client, selected.id, status, notes)
      await refresh(client)
      setSelected((current) => (current ? { ...current, status } : current))
    } catch {
      setError('Cette transition n’est pas autorisée ou a échoué.')
    } finally {
      setIsSaving(false)
    }
  }

  const signOut = async () => {
    if (client) await client.auth.signOut()
    navigate('/admin/login', { replace: true })
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
        <p>Cette session n’est pas autorisée à consulter les opérations.</p>
        <Link className="button button-secondary" to="/admin/login">
          Retour à la connexion
        </Link>
      </main>
    )
  }

  const counts = orders.reduce<Record<string, number>>((result, order) => {
    result[order.status] = (result[order.status] ?? 0) + 1
    return result
  }, {})

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Whimsea · privé</p>
          <h1>Opérations</h1>
        </div>
        <div className="admin-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => client && void refresh(client)}
          >
            <RefreshCw aria-hidden="true" size={15} /> Actualiser
          </button>
          <Link className="button button-secondary" to="/admin/catalog">
            Catalogue
          </Link>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void signOut()}
          >
            <LogOut aria-hidden="true" size={15} /> Déconnexion
          </button>
        </div>
      </header>
      {error && (
        <p className="checkout-error" role="alert">
          {error}
        </p>
      )}
      <section className="admin-metrics" aria-label="Résumé des commandes">
        <div>
          <span>Total</span>
          <strong>{orders.length}</strong>
        </div>
        {(
          [
            'new',
            'confirmed',
            'preparing',
            'shipped',
            'delivered',
            'cancelled',
          ] as const
        ).map((status) => (
          <div key={status}>
            <span>{status}</span>
            <strong>{counts[status] ?? 0}</strong>
          </div>
        ))}
      </section>
      <section className="admin-workspace">
        <div className="admin-list">
          <div className="admin-toolbar">
            <input
              placeholder="Rechercher une commande…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as 'all' | OrderStatus)
              }
            >
              <option value="all">Tous les statuts</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          {filteredOrders.length === 0 ? (
            <div className="catalog-state">
              <ShieldCheck aria-hidden="true" size={24} />
              <p>Aucune commande à afficher.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <button
                className={`admin-order-row${selected?.id === order.id ? ' is-selected' : ''}`}
                key={order.id}
                type="button"
                onClick={() => void openOrder(order)}
              >
                <span>
                  <strong>{order.public_reference}</strong>
                  <small>
                    {order.customer_name} · {order.city}
                  </small>
                </span>
                <span>
                  <strong>{formatMad(order.grand_total_centimes)}</strong>
                  <small>
                    {order.status} · {formatOrderDate(order.created_at)}
                  </small>
                </span>
              </button>
            ))
          )}
        </div>
        {selected ? (
          <aside className="admin-detail">
            <p className="eyebrow">{selected.public_reference}</p>
            <h2>{selected.customer_name}</h2>
            <p>
              {selected.phone}
              <br />
              {selected.street_address}
              <br />
              {selected.city}
              {selected.landmark ? ` · ${selected.landmark}` : ''}
            </p>
            {selected.delivery_notes && (
              <p className="admin-note">
                Note client : {selected.delivery_notes}
              </p>
            )}
            <div className="admin-detail-lines">
              {items.map((item) => (
                <div key={item.id}>
                  <span>
                    {item.product_name_snapshot} × {item.quantity}
                  </span>
                  <strong>{formatMad(item.line_total_centimes)}</strong>
                </div>
              ))}
              <div>
                <span>Livraison</span>
                <strong>{formatMad(selected.delivery_fee_centimes)}</strong>
              </div>
              <div>
                <span>Total COD</span>
                <strong>{formatMad(selected.grand_total_centimes)}</strong>
              </div>
            </div>
            <label>
              Notes internes
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
            <button
              className="button button-secondary"
              type="button"
              disabled={isSaving}
              onClick={() => void saveStatus(selected.status)}
            >
              Enregistrer la note
            </button>
            <label>
              Statut
              <select
                value={selected.status}
                disabled={isSaving}
                onChange={(event) =>
                  void saveStatus(event.target.value as OrderStatus)
                }
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <p className="admin-warning">
              L’annulation restaure automatiquement le stock une seule fois côté
              serveur.
            </p>
          </aside>
        ) : (
          <aside className="admin-detail catalog-state">
            <p>Sélectionnez une commande.</p>
          </aside>
        )}
      </section>
      <Link className="text-link admin-store-link" to="/">
        Retour à la boutique publique
      </Link>
    </main>
  )
}
