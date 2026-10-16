export type Category =
  | 'digital_arrest'
  | 'kyc_otp'
  | 'parcel_customs'
  | 'job_task'
  | 'investment'
  | 'lottery_prize'
  | 'loan_app'
  | 'sextortion'
  | 'utility'
  | 'phishing_link'
  | 'generic'

export type Verdict = 'safe' | 'suspicious' | 'scam'

export interface Rule {
  id: string
  category: Category
  label: string
  labelHi: string
  description: string
  weight: number
  patterns: RegExp[]
  ignoreNegation?: boolean
}

export interface Match {
  text: string
  start: number
  end: number
}

export interface Finding {
  id: string
  category: Category
  label: string
  labelHi: string
  description: string
  weight: number
  matches: Match[]
}

export interface LinkReport {
  url: string
  host: string
  flags: string[]
  weight: number
}

export interface Analysis {
  score: number
  verdict: Verdict
  findings: Finding[]
  links: LinkReport[]
  categories: Category[]
  advice: string[]
}
