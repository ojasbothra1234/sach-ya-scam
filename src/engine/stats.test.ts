import { describe, expect, it } from 'vitest'
import { estimateSince, formatCount, formatInr, formatRate, istYear, istYearStart, LIVE_STATS, perSecond } from './stats'

describe('live stats', () => {
  it('uses the IST calendar year', () => {
    const lateDec31Utc = Date.UTC(2025, 11, 31, 20, 0)
    expect(istYear(lateDec31Utc)).toBe(2026)
    expect(istYearStart(lateDec31Utc)).toBe(Date.UTC(2025, 11, 31, 18, 30))
  })

  it('scales a yearly figure to elapsed time', () => {
    const year = 365 * 24 * 3600 * 1000
    expect(estimateSince(1000, year / 2)).toBeCloseTo(500)
    expect(estimateSince(1000, -5)).toBe(0)
    expect(perSecond(LIVE_STATS[0].perYear)).toBeCloseTo(7244, 0)
  })

  it('formats rupees in Indian units', () => {
    expect(formatInr(22845e7)).toBe('₹22,845.00 cr')
    expect(formatInr(250000)).toBe('₹2.50 lakh')
    expect(formatInr(7244.4)).toBe('₹7,244')
    expect(formatCount(2268000)).toBe('22,68,000')
    expect(formatRate(LIVE_STATS[1])).toBe('one every 14 seconds')
  })
})
