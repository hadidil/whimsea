import { getSupabaseClient } from '../../lib/supabase'

export type DeliveryZone = {
  id: string
  cityName: string
  cityKey: string
  region: string | null
  feeCentimes: number
  notes: string | null
}

export type DeliveryQuote = {
  zone: DeliveryZone
  feeCentimes: number
}

type LiveDeliveryZone = {
  id: string
  city_name: string
  normalized_city_key: string
  region: string | null
  fee_centimes: number | null
  delivery_notes: string | null
}

const cityAliases: Record<string, string> = {
  casa: 'casablanca',
  casablanca: 'casablanca',
  الدارالبيضاء: 'casablanca',
  'الدار-البيضاء': 'casablanca',
  'الدار البيضاء': 'casablanca',
  'casa blanca': 'casablanca',
  marrakesh: 'marrakech',
  marrakes: 'marrakech',
  marrakech: 'marrakech',
  مراكش: 'marrakech',
  rabat: 'rabat',
  الرباط: 'rabat',
  tanger: 'tanger',
  tangier: 'tanger',
  طنجة: 'tanger',
  sale: 'sale',
  salé: 'sale',
  kenitra: 'kenitra',
  kénitra: 'kenitra',
  meknes: 'meknes',
  'imzourne-hoceima': 'imzourne-hoceima',
  hoceima: 'imzourne-hoceima',
  'al-hoceima': 'imzourne-hoceima',
}

export function normalizeCityKey(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('fr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function canonicalCityKey(value: string): string {
  const normalized = normalizeCityKey(value)
  return cityAliases[normalized] ?? normalized
}

export function findDeliveryQuote(
  zones: DeliveryZone[],
  cityInput: string,
): DeliveryQuote | null {
  const key = canonicalCityKey(cityInput)
  const zone = zones.find(
    (candidate) => canonicalCityKey(candidate.cityKey) === key,
  )
  return zone ? { zone, feeCentimes: zone.feeCentimes } : null
}

export async function loadDeliveryZones(): Promise<DeliveryZone[]> {
  const client = getSupabaseClient()
  if (!client) return []

  const { data, error } = await client
    .from('delivery_zones')
    .select(
      'id, city_name, normalized_city_key, region, fee_centimes, delivery_notes, sort_order',
    )
    .eq('enabled', true)
    .not('fee_centimes', 'is', null)
    .order('sort_order', { ascending: true })
    .order('city_name', { ascending: true })

  if (error) throw new Error('Impossible de charger les zones de livraison.')

  const rows = (data ?? []) as LiveDeliveryZone[]

  return rows.flatMap((zone) =>
    zone.fee_centimes === null
      ? []
      : [
          {
            id: zone.id,
            cityName: zone.city_name,
            cityKey: zone.normalized_city_key,
            region: zone.region,
            feeCentimes: zone.fee_centimes,
            notes: zone.delivery_notes,
          },
        ],
  )
}
