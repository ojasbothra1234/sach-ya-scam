import type { LinkReport } from './types'

const URL_PATTERN =
  /\b(?:https?:\/\/[^\s<>"'()]+|www\.[^\s<>"'()]+|[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:com|in|net|org|xyz|top|click|link|info|online|site|live|shop|icu|buzz|loan|work|vip|cc|tk|ml|ga|cf|gq|ly|me|io|app|sbi)(?:\/[^\s<>"'()]*)?)/gi

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 'cutt.ly', 'is.gd', 't.ly', 'rb.gy', 'shorturl.at', 'tiny.cc',
  'ow.ly', 'goo.gl', 'rebrand.ly', 's.id', 't.co', 'v.gd', 'bitly.com', 'shorte.st',
])

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'click', 'link', 'online', 'site', 'live', 'shop', 'icu', 'buzz', 'loan',
  'work', 'vip', 'cc', 'tk', 'ml', 'ga', 'cf', 'gq',
])

const BRANDS: Record<string, string[]> = {
  sbi: ['sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com', 'sbi.bank.in'],
  hdfc: ['hdfcbank.com', 'hdfc.com'],
  icici: ['icicibank.com'],
  axis: ['axisbank.com'],
  kotak: ['kotak.com'],
  paytm: ['paytm.com'],
  phonepe: ['phonepe.com'],
  amazon: ['amazon.in', 'amazon.com'],
  flipkart: ['flipkart.com'],
  indiapost: ['indiapost.gov.in'],
  incometax: ['incometax.gov.in'],
  npci: ['npci.org.in'],
  uidai: ['uidai.gov.in'],
  aadhaar: ['uidai.gov.in'],
  airtel: ['airtel.in'],
  jio: ['jio.com'],
  bsnl: ['bsnl.co.in'],
  whatsapp: ['whatsapp.com'],
}

const LURE_WORDS = /(kyc|verify|verification|update|secure|login|signin|reward|refund|bonus|claim|prize|gift|offer|redeem)/

function endsWithDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith('.' + domain)
}

export function extractUrls(text: string): string[] {
  const found = text.match(URL_PATTERN) ?? []
  return [...new Set(found.map((u) => u.replace(/[.,;:!?]+$/, '')))]
}

export function analyzeUrl(raw: string): LinkReport | null {
  let parsed: URL
  try {
    parsed = new URL(/^https?:\/\//i.test(raw) ? raw : 'http://' + raw)
  } catch {
    return null
  }
  const host = parsed.hostname.toLowerCase()
  const flags: string[] = []
  let weight = 0
  const flag = (msg: string, w: number) => {
    flags.push(msg)
    weight += w
  }

  const isGov = endsWithDomain(host, 'gov.in') || endsWithDomain(host, 'nic.in')
  const tld = host.split('.').pop() ?? ''

  if (SHORTENERS.has(host)) flag('URL shortener hides the real destination', 15)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) flag('Uses a raw IP address instead of a domain', 25)
  if (host.split('.').some((p) => p.startsWith('xn--'))) flag('Punycode domain (look-alike characters)', 25)
  if (SUSPICIOUS_TLDS.has(tld)) flag(`Cheap domain ending ".${tld}" common in scams`, 15)
  if (raw.includes('@')) flag('Contains "@" which can hide the real destination', 20)
  if (/\.apk(\?|$)/i.test(parsed.pathname)) flag('Downloads an Android APK file', 30)

  if (!isGov) {
    const compact = host.replace(/[-.]/g, '')
    for (const [brand, official] of Object.entries(BRANDS)) {
      if (compact.includes(brand) && !official.some((d) => endsWithDomain(host, d))) {
        flag(`Mentions "${brand}" but is not its official website`, 30)
        break
      }
    }
    if (/(gov|govt|police|cybercrime|court)/.test(host)) {
      flag('Pretends to be a government site but is not .gov.in', 25)
    }
  }

  if ((host.match(/-/g) ?? []).length >= 2) flag('Many hyphens in the domain', 10)
  if (!isGov && LURE_WORDS.test(host)) flag('Lure words like "kyc", "verify" or "reward" in the domain', 10)
  if (parsed.protocol === 'http:' && /^http:\/\//i.test(raw)) flag('Not using HTTPS', 5)

  return { url: raw, host, flags, weight }
}

export function analyzeLinks(text: string): LinkReport[] {
  return extractUrls(text)
    .map(analyzeUrl)
    .filter((r): r is LinkReport => r !== null)
}
