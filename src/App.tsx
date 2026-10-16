import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { analyze, CATEGORY_INFO, SAMPLES } from './engine'
import type { Analysis, Verdict } from './engine'
import LiveCounters from './LiveCounters'
import CallGuard from './CallGuard'
import './App.css'

const VERDICT_TEXT: Record<Verdict, { title: string; hi: string; sub: string }> = {
  scam: { title: 'Likely scam', hi: 'यह स्कैम लगता है', sub: "Don't reply, pay or click. Shared an OTP or paid? Call 1930 now." },
  suspicious: { title: 'Possibly a scam', hi: 'सावधान रहें', sub: 'Some pressure tactics found. Verify through the official app or website before acting.' },
  safe: { title: 'No scam tactics found', hi: 'कोई स्कैम संकेत नहीं मिला', sub: 'Nothing on our tactic list — but no checker is perfect. Stay alert.' },
}

const HELP_STEPS = [
  { what: 'I paid, or money left my account', steps: ['Call 1930 immediately', 'File on cybercrime.gov.in', 'Call your bank to block card or UPI', 'Save transaction IDs and screenshots'] },
  { what: 'I shared an OTP or installed a screen-sharing app', steps: ['Uninstall the app', 'Call your bank', 'Change UPI PIN and passwords'] },
  { what: 'Suspicious call or message, no loss', steps: ["Don't reply", 'Report on Chakshu (Sanchar Saathi)', 'Block the sender'] },
]

const REPORT_LINKS = [
  { title: 'Call 1930', sub: 'National Cyber Crime Helpline, 24x7', href: 'tel:1930' },
  { title: 'cybercrime.gov.in', sub: 'File an official complaint online', href: 'https://cybercrime.gov.in' },
  { title: 'Chakshu · Sanchar Saathi', sub: 'Report suspicious calls, SMS and WhatsApp', href: 'https://sancharsaathi.gov.in/sfc/' },
]

interface Range {
  start: number
  end: number
  nums: number[]
}

function buildRanges(analysis: Analysis): Range[] {
  const all = analysis.findings
    .flatMap((f, i) => f.matches.map((m) => ({ start: m.start, end: m.end, nums: [i + 1] })))
    .sort((a, b) => a.start - b.start)
  const merged: Range[] = []
  for (const r of all) {
    const last = merged[merged.length - 1]
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end)
      for (const n of r.nums) if (!last.nums.includes(n)) last.nums.push(n)
    } else {
      merged.push({ ...r, nums: [...r.nums] })
    }
  }
  return merged
}

function Highlighted({ text, analysis }: { text: string; analysis: Analysis }) {
  const parts: ReactNode[] = []
  let cursor = 0
  buildRanges(analysis).forEach((r, i) => {
    if (r.start > cursor) parts.push(text.slice(cursor, r.start))
    parts.push(<mark key={`m${i}`}>{text.slice(r.start, r.end)}</mark>)
    r.nums.forEach((n) => parts.push(<sup key={`n${i}-${n}`} className="num">{n}</sup>))
    cursor = r.end
  })
  parts.push(text.slice(cursor))
  return <p className="highlighted">{parts}</p>
}

export default function App() {
  const [input, setInput] = useState('')
  const [checked, setChecked] = useState<string | null>(null)
  const analysis = useMemo(() => (checked === null ? null : analyze(checked)), [checked])

  const check = () => setChecked(input.trim())
  const loadSample = (text: string) => {
    setInput(text)
    setChecked(text)
  }
  const ruleMatches = analysis ? analysis.findings.reduce((n, f) => n + f.matches.length, 0) : 0

  return (
    <div className="page">
      <nav className="topbar">
        <span>HACKCOM 2026 · CF-14</span>
        <span>Building a Safer Digital World</span>
      </nav>

      <header className="hero">
        <div className="hero-copy">
          <p className="hero-hi">सच या स्कैम?</p>
          <h1>
            Sach Ya <span>Scam?</span>
          </h1>
          <p className="tagline">Check it. Practise it. Protect yourself.</p>
          <p className="hero-sub">
            Built for every parent who gets a <strong>“your account will be blocked”</strong> SMS and every grandparent pulled into a{' '}
            <strong>“CBI” video call</strong>. Paste the message, forward or link, or type what the caller said, and see every pressure
            tactic named and explained.
          </p>
          <p className="handwritten">…in the language people actually use.</p>
        </div>
        <aside className="sticky-note">
          Never share your OTP.
          <br />
          Not even with “the bank”.
        </aside>
      </header>

      <LiveCounters />

      <main>
        <section className="window">
          <div className="window-bar">
            <strong>Sach Ya Scam? · Check</strong>
            <span>Scam mode</span>
          </div>
          <div className="window-body">
            <label htmlFor="message">Message, forward, link, or what the caller said</label>
            <textarea
              id="message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) check()
              }}
              placeholder="e.g. “Main CBI se bol raha hoon. Aapke naam pe parcel mein drugs mile hain. Video call pe rahiye, kisi ko mat batana.”"
              rows={6}
            />
            <div className="actions">
              <button className="primary" onClick={check} disabled={input.trim() === ''}>
                Check now
              </button>
              <button
                className="ghost"
                onClick={() => {
                  setInput('')
                  setChecked(null)
                }}
              >
                Clear
              </button>
              <span className="hint">Ctrl+Enter · English, Hindi and Hinglish · runs in your browser, nothing is sent</span>
            </div>
            <div className="samples">
              <span>Try an example:</span>
              {SAMPLES.map((s) => (
                <button key={s.id} className="chip" onClick={() => loadSample(s.text)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {analysis && checked !== null && (
          <section className={`window result result-${analysis.verdict}`} aria-live="polite">
            <div className="window-bar">
              <strong>Sach Ya Scam? · Result</strong>
              <span>Risk score {analysis.score} / 100</span>
            </div>
            <div className="window-body">
              <div className="verdict">
                <div>
                  <h2>
                    {VERDICT_TEXT[analysis.verdict].title} <small>{VERDICT_TEXT[analysis.verdict].hi}</small>
                  </h2>
                  <p>{VERDICT_TEXT[analysis.verdict].sub}</p>
                </div>
                <div className="verdict-meta">
                  {analysis.findings.length} red flag{analysis.findings.length === 1 ? '' : 's'} · {ruleMatches} rule match
                  {ruleMatches === 1 ? '' : 'es'}
                </div>
              </div>

              {analysis.categories.length > 0 && (
                <div className="tags">
                  {analysis.categories.slice(0, 3).map((c) => (
                    <span key={c} className="tag">
                      {CATEGORY_INFO[c].label}
                    </span>
                  ))}
                </div>
              )}

              {analysis.findings.length > 0 && (
                <>
                  <Highlighted text={checked} analysis={analysis} />
                  <ol className="findings">
                    {analysis.findings.map((f) => (
                      <li key={f.id}>
                        <span className={`badge ${f.id.startsWith('combo_') ? 'badge-pattern' : 'badge-rule'}`}>
                          {f.id.startsWith('combo_') ? 'Pattern' : 'Rule'}
                        </span>
                        <div>
                          <strong>{f.label}.</strong> {f.description}
                          <span className="hi"> {f.labelHi}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {analysis.links.length > 0 && (
                <ul className="links">
                  {analysis.links.map((l) => (
                    <li key={l.url} className={l.flags.length ? 'risky' : 'clean'}>
                      <span className="badge badge-link">Link</span>
                      <div>
                        <code>{l.url}</code>
                        {l.flags.length === 0 ? (
                          <p>Not on our lookalike or shortener lists. Only open it from the official app or website.</p>
                        ) : (
                          <p>{l.flags.join(' · ')}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="do-now">
                <strong>Do now:</strong>
                <ul>
                  {analysis.advice.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        <CallGuard />

        <section className="help">
          <div className="help-copy">
            <h3>Get Help Now</h3>
            <p>
              Speed matters: the government's Citizen Financial Cyber Fraud Reporting System has helped save more than <strong>₹7,130 crore</strong>{' '}
              across over 23 lakh complaints, and it depends on quick reporting.
            </p>
            <div className="report-links">
              {REPORT_LINKS.map((r) => (
                <a key={r.title} href={r.href} target="_blank" rel="noreferrer">
                  <strong>{r.title}</strong>
                  <span>{r.sub}</span>
                </a>
              ))}
            </div>
          </div>
          <table className="help-table">
            <thead>
              <tr>
                <th>What happened</th>
                <th>First steps, in order</th>
              </tr>
            </thead>
            <tbody>
              {HELP_STEPS.map((h) => (
                <tr key={h.what}>
                  <th scope="row">{h.what}</th>
                  <td>
                    {h.steps.map((s, i) => (
                      <span key={s}>
                        <i className="step">{i + 1}</i> {s}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      <footer>
        <span>SACH YA SCAM?</span>
        <span>HACKCOM 2026 · CF-14 · Building a Safer Digital World</span>
        <span>Guidance, not legal advice. Nothing you paste leaves your browser.</span>
      </footer>
    </div>
  )
}
