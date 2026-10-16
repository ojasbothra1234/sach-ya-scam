const YEAR_MS = 365 * 24 * 60 * 60 * 1000
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

export interface LiveStat {
  id: string
  eyebrow: string
  perYear: number
  unit: 'inr' | 'count'
  caption: string
  source: string
}

/** Official 2024 figures (Ministry of Home Affairs replies in Parliament), spread evenly over a year. */
export const LIVE_STATS: LiveStat[] = [
  { id: 'loss', eyebrow: 'Cyber fraud losses', perYear: 22845e7, unit: 'inr', caption: 'lost by citizens to cyber fraud', source: '₹22,845 cr in 2024' },
  { id: 'complaints', eyebrow: 'Complaints', perYear: 2268000, unit: 'count', caption: 'complaints on the national cybercrime portal', source: '22.68 lakh in 2024' },
  { id: 'arrest', eyebrow: 'Digital arrest', perYear: 1935e7, unit: 'inr', caption: 'lost to “digital arrest” scams', source: '₹1,935 cr in 2024' },
]

export function istYear(nowMs: number): number {
  return new Date(nowMs + IST_OFFSET_MS).getUTCFullYear()
}

export function istYearStart(nowMs: number): number {
  return Date.UTC(istYear(nowMs), 0, 1) - IST_OFFSET_MS
}

export function estimateSince(perYear: number, elapsedMs: number): number {
  return (perYear * Math.max(0, elapsedMs)) / YEAR_MS
}

export function perSecond(perYear: number): number {
  return perYear / (YEAR_MS / 1000)
}

const inr = (digits: number) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function formatInr(value: number): string {
  if (value >= 1e7) return `₹${inr(2).format(value / 1e7)} cr`
  if (value >= 1e5) return `₹${inr(2).format(value / 1e5)} lakh`
  return `₹${inr(0).format(Math.floor(value))}`
}

export function formatCount(value: number): string {
  return inr(0).format(Math.floor(value))
}

export function formatStat(stat: LiveStat, value: number): string {
  return stat.unit === 'inr' ? formatInr(value) : formatCount(value)
}

export function formatRate(stat: LiveStat): string {
  const rate = perSecond(stat.perYear)
  if (stat.unit === 'inr') return `${formatInr(rate)} every second`
  return `one every ${Math.round(1 / rate)} seconds`
}
