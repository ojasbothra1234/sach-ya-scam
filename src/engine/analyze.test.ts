import { describe, expect, it } from 'vitest'
import { analyze, analyzeUrl, extractUrls, SAMPLES } from '.'

const sample = (id: string) => SAMPLES.find((s) => s.id === id)!.text
const ruleIds = (text: string) => analyze(text).findings.map((f) => f.id)

describe('analyze', () => {
  it('flags the digital arrest script as a scam', () => {
    const result = analyze(sample('digital_arrest'))
    expect(result.verdict).toBe('scam')
    expect(result.score).toBeGreaterThanOrEqual(90)
    expect(result.categories[0]).toBe('digital_arrest')
    expect(ruleIds(sample('digital_arrest'))).toEqual(
      expect.arrayContaining(['arrest_threat', 'video_custody', 'secrecy', 'verification_account', 'combo_digital_arrest']),
    )
  })

  it('flags Hindi digital arrest messages', () => {
    const result = analyze(sample('hindi'))
    expect(result.verdict).toBe('scam')
    expect(result.categories).toContain('digital_arrest')
  })

  it('flags KYC phishing with a fake bank link', () => {
    const result = analyze(sample('kyc'))
    expect(result.verdict).toBe('scam')
    expect(result.links).toHaveLength(1)
    expect(result.links[0].flags.join(' ')).toMatch(/not its official website/)
    expect(ruleIds(sample('kyc'))).toEqual(expect.arrayContaining(['kyc_expiry', 'otp_request', 'foreign_number']))
  })

  it('flags part-time job task scams', () => {
    const result = analyze(sample('job'))
    expect(result.verdict).toBe('scam')
    expect(result.categories).toContain('job_task')
  })

  it('flags electricity disconnection scams', () => {
    expect(analyze(sample('electricity')).verdict).not.toBe('safe')
  })

  it('treats a genuine bank OTP message as safe', () => {
    const result = analyze(sample('safe'))
    expect(result.verdict).toBe('safe')
    expect(ruleIds(sample('safe'))).not.toContain('otp_request')
  })

  it('treats ordinary messages as safe', () => {
    for (const text of ['Hi, are we still meeting at 5 today?', 'Mom, I reached the hostel. Will call you at night.', '']) {
      expect(analyze(text).verdict).toBe('safe')
    }
  })

  it('ignores negated phrases', () => {
    expect(ruleIds('Never share your OTP or PIN with anyone.')).not.toContain('otp_request')
  })

  it('detects Hinglish phrases', () => {
    const ids = ruleIds('Aapka account band ho jayega, turant OTP bata do')
    expect(ids).toEqual(expect.arrayContaining(['account_block', 'urgency', 'otp_request']))
  })

  it('records match positions for highlighting', () => {
    const text = 'Please install AnyDesk now'
    const finding = analyze(text).findings.find((f) => f.id === 'remote_access')!
    const m = finding.matches[0]
    expect(text.slice(m.start, m.end)).toBe('AnyDesk')
  })
})

describe('links', () => {
  it('extracts urls with and without scheme', () => {
    expect(extractUrls('visit www.example.com, or https://a.in/x. Also bit.ly/abc')).toEqual([
      'www.example.com',
      'https://a.in/x',
      'bit.ly/abc',
    ])
  })

  it('does not flag official domains', () => {
    expect(analyzeUrl('https://www.onlinesbi.sbi/')!.flags).toEqual([])
    expect(analyzeUrl('https://cybercrime.gov.in')!.flags).toEqual([])
  })

  it('flags risky urls', () => {
    expect(analyzeUrl('http://192.168.1.10/login')!.flags.join(' ')).toMatch(/IP address/)
    expect(analyzeUrl('https://xn--sbi-xyz.com')!.flags.join(' ')).toMatch(/Punycode/)
    expect(analyzeUrl('https://example.com/app.apk')!.flags.join(' ')).toMatch(/APK/)
    expect(analyzeUrl('delhi-police-challan.online')!.flags.join(' ')).toMatch(/government/)
  })
})
