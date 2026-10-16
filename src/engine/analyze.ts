import { analyzeLinks } from './links'
import { CATEGORY_INFO, RULES } from './rules'
import type { Analysis, Category, Finding, Match, Rule, Verdict } from './types'

const MAX_MATCHES_PER_RULE = 5
const MAX_LINK_WEIGHT = 45
const SCORE_SCALE = 45

const NEGATION_BEFORE = /(\bnot|\bnever|n't|\bmat|\bnahi|\bnahin)\s+$/i
const SAFETY_DISCLAIMER = /\b(do not|don'?t|never|not to)\s+(share|send|tell|disclose|give)\b/i

function isNegated(text: string, match: RegExpExecArray): boolean {
  const before = text.slice(Math.max(0, match.index - 14), match.index)
  return NEGATION_BEFORE.test(before) || SAFETY_DISCLAIMER.test(match[0])
}

function findMatches(text: string, rule: Rule): Match[] {
  const matches: Match[] = []
  for (const pattern of rule.patterns) {
    const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
    const re = new RegExp(pattern.source, flags)
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) {
        re.lastIndex++
        continue
      }
      if (!rule.ignoreNegation && isNegated(text, m)) continue
      const start = m.index
      const end = start + m[0].length
      if (!matches.some((x) => start < x.end && end > x.start)) {
        matches.push({ text: m[0], start, end })
      }
      if (matches.length >= MAX_MATCHES_PER_RULE) return matches
    }
  }
  return matches
}

interface Combo {
  id: string
  category: Category
  label: string
  labelHi: string
  description: string
  weight: number
  any: string[][]
}

const COMBOS: Combo[] = [
  {
    id: 'combo_digital_arrest',
    category: 'digital_arrest',
    label: 'Classic "digital arrest" pattern',
    labelHi: 'क्लासिक "डिजिटल अरेस्ट" पैटर्न',
    description: 'Official-sounding threats combined with a demand for money is the exact script used in digital-arrest frauds.',
    weight: 20,
    any: [
      ['authority_impersonation', 'arrest_threat', 'parcel_contraband'],
      ['payment_demand', 'verification_account', 'secrecy', 'video_custody'],
    ],
  },
  {
    id: 'combo_advance_fee',
    category: 'lottery_prize',
    label: 'Advance-fee pattern',
    labelHi: 'एडवांस-फ़ीस पैटर्न',
    description: 'A promised reward that requires you to pay first is a textbook advance-fee scam.',
    weight: 15,
    any: [
      ['prize', 'job_task', 'investment', 'instant_loan'],
      ['processing_fee', 'payment_demand', 'gift_card_crypto'],
    ],
  },
]

export function scoreFromRaw(raw: number): number {
  return Math.round(100 * (1 - Math.exp(-Math.max(0, raw) / SCORE_SCALE)))
}

export function verdictFromScore(score: number): Verdict {
  if (score >= 50) return 'scam'
  if (score >= 25) return 'suspicious'
  return 'safe'
}

export function analyze(text: string): Analysis {
  const findings: Finding[] = []
  for (const rule of RULES) {
    const matches = findMatches(text, rule)
    if (matches.length > 0) {
      const { id, category, label, labelHi, description, weight } = rule
      findings.push({ id, category, label, labelHi, description, weight, matches })
    }
  }

  const ids = new Set(findings.map((f) => f.id))
  for (const combo of COMBOS) {
    if (combo.any.every((group) => group.some((id) => ids.has(id)))) {
      const { any: _any, ...meta } = combo
      void _any
      findings.push({ ...meta, matches: [] })
    }
  }

  const links = analyzeLinks(text)
  const linkWeight = Math.min(
    MAX_LINK_WEIGHT,
    links.reduce((sum, l) => sum + l.weight, 0),
  )

  const raw = findings.reduce((sum, f) => sum + f.weight, 0) + linkWeight
  const score = scoreFromRaw(raw)
  const verdict = verdictFromScore(score)

  const categoryWeights = new Map<Category, number>()
  for (const f of findings) {
    categoryWeights.set(f.category, (categoryWeights.get(f.category) ?? 0) + f.weight)
  }
  if (linkWeight > 0) categoryWeights.set('phishing_link', linkWeight)

  const ranked = [...categoryWeights.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c)
  const specific = ranked.filter((c) => c !== 'generic')
  const categories = specific.length > 0 ? specific : ranked

  const advice =
    verdict === 'safe'
      ? ['No strong scam signals found. Still, never share OTPs or PINs, and verify unexpected requests through official channels.']
      : [...categories.slice(0, 3).map((c) => CATEGORY_INFO[c].advice), CATEGORY_INFO.generic.advice]

  findings.sort((a, b) => b.weight - a.weight)

  return { score, verdict, findings, links, categories, advice }
}
