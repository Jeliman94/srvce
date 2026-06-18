import type { CustomerType } from '../types'

export interface PricingSettings {
  hourlyRatePerson: number
  hourlyRateCompany: number
  kmRate: number
  minTravelFee: number
}

export const defaultPricingSettings: PricingSettings = {
  hourlyRatePerson: 750,
  hourlyRateCompany: 1000,
  kmRate: 17,
  minTravelFee: 200,
}

const STORAGE_KEY = 'srvce:pricing'

export function getPricingSettings(): PricingSettings {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultPricingSettings
  return { ...defaultPricingSettings, ...(JSON.parse(raw) as Partial<PricingSettings>) }
}

export function savePricingSettings(settings: PricingSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

// First started hour is always billed in full; after that, every started
// minute is billed.
export function billedLaborMinutes(workedMinutes: number): number {
  if (workedMinutes <= 60) return 60
  return Math.ceil(workedMinutes)
}

export function laborPrice(
  workedMinutes: number,
  customerType: CustomerType,
  settings: PricingSettings,
): number {
  const hourlyRate = customerType === 'firma' ? settings.hourlyRateCompany : settings.hourlyRatePerson
  return Math.round((hourlyRate * billedLaborMinutes(workedMinutes)) / 60)
}

// Every started kilometer counts as a whole one.
export function billedKm(km: number): number {
  return Math.ceil(km)
}

export function travelPrice(km: number, settings: PricingSettings): number {
  return Math.max(billedKm(km) * settings.kmRate, settings.minTravelFee)
}
