/** Availability for one ticket tier (Decimal money fields arrive as strings). */
export interface TierAvailability {
  ticket_type_id: string
  name: string
  price: string
  currency: string
  quantity_total: number
  quantity_sold: number
  quantity_available: number
  is_on_sale: boolean
}

export interface Availability {
  event_id: string
  total_available: number
  tiers: TierAvailability[]
}
