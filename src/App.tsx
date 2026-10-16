import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { analyze, CATEGORY_INFO, SAMPLES } from './engine'
import type { Analysis, Match, Verdict } from './engine'
import './App.css'

const VERDICT_TEXT: Record<Verdict, { title: string; hi: string; sub: string }> = {
  scam: { title: 'Scam!', hi: 'यह स्कैम है', sub: 'Strong signs of fraud. Do not pay, share OTPs or click links.' },
  suspicious: { title: 'Suspicious', hi: 'सावधान रहें', sub: 'Some warning signs. Verify through official channels before acting.' },
  safe: { title: 'Looks safe', hi: 'सच लगता है', sub: 'No strong scam signals found — but stay alert.' },
}

const REPORT_LINKS = [
  { title: 'Call 1930', sub: 'National Cyber Crime Helpline (24x7). Call within the "golden hour" to freeze stolen money.', href: 'tel:1930' },
  { title: 'cybercrime.gov.in', sub: 'File an official cyber-crime complaint online.', href: 'https://cybercrime.gov.in' },
  { title: 'Chakshu (Sanchar Saathi)', sub: 'Report suspicious calls, SMS and WhatsApp messages to DoT.', href: 'https://sancharsaathi.gov.in/sfc/' },
]

function mergeMatches(analysis: Analysis): Match[] {
  const all = analysis.findings.flatMap((f) => f.matches).sort((a, b) => a.start - b.start)
  const merged: Match[] = []
  for (const m of all) {
    const last = merged[merged.length - 1]
    if (last && m.start <= last.end) {
      last.end = Math.max(last.end, m.end)
    } else {
      merged.push({ ...m })
    }
  }
  return merged
}

function Highlighted({ text, analysis }: { text: string; analysis: Analysis }) {
  const ranges = mergeMatches(analysis)
  const parts: ReactNode[] = []
  let cursor = 0
  ranges.forEach((r, i) => {
    if (r.start > cursor) parts.push(text.slice(cursor, r.start))
    parts.push(<mark key={i}>{text.slice(r.start, r.end)}</mark>)
    cursor = r.end
  })
  parts.push(text.slice(cursor))
  return <p className="highlighted">{parts}</p>
}

function Gauge({ score, verdict }: { score: number; verdict: Verdict }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  return (
    <svg className={`gauge gauge-${verdict}`} viewBox="0 0 120 120" role="img" aria-label={`Risk score ${score} out of 100`}>
      <circle cx="60" cy="60" r={radius} className="gauge-track" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        className="gauge-fill"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - score / 100)}
      />
      <text x="60" y="58" textAnchor="middle" className="gauge-score">
        {score}
      </text>
      <text x="60" y="78" textAnchor="middle" className="gauge-label">
        risk / 100
      </text>
    </svg>
  )
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

  return (
    <div className="page">
      <header className="hero">
        <h1>
          Sach <span>Ya</span> Scam?
        </h1>
        <p>Paste a suspicious SMS, WhatsApp message, call script or link. We'll tell you if it looks like a scam — and what to do next.</p>
        <p className="hero-hi">संदिग्ध मैसेज या लिंक पेस्ट करें और जानें — सच या स्कैम?</p>
      </header>

      <main>
        <section className="card input-card">
          <label htmlFor="message">Message, call transcript or link</label>
          <textarea
            id="message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) check()
            }}
            placeholder="e.g. 'This is Mumbai Police. A parcel in your name contains drugs. You are under digital arrest…'"
            rows={7}
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
          </div>
          <div className="samples">
            <span>Try an example:</span>
            {SAMPLES.map((s) => (
              <button key={s.id} className="chip" onClick={() => loadSample(s.text)}>
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {analysis && checked !== null && (
          <section className={`card result result-${analysis.verdict}`} aria-live="polite">
            <div className="result-head">
              <Gauge score={analysis.score} verdict={analysis.verdict} />
              <div>
                <h2>
                  {VERDICT_TEXT[analysis.verdict].title} <small>{VERDICT_TEXT[analysis.verdict].hi}</small>
                </h2>
                <p>{VERDICT_TEXT[analysis.verdict].sub}</p>
                {analysis.categories.length > 0 && (
                  <div className="tags">
                    {analysis.categories.slice(0, 3).map((c) => (
                      <span key={c} className="tag">
                        {CATEGORY_INFO[c].label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {analysis.findings.length > 0 && (
              <>
                <h3>Red flags found ({analysis.findings.length})</h3>
                <ul className="findings">
                  {analysis.findings.map((f) => (
                    <li key={f.id}>
                      <div className="finding-title">
                        <strong>{f.label}</strong>
                        <span className="hi">{f.labelHi}</span>
                      </div>
                      <p>{f.description}</p>
                      {f.matches.length > 0 && (
                        <div className="quotes">
                          {f.matches.map((m) => (
                            <q key={m.start}>{m.text}</q>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                <h3>Where we found them</h3>
                <Highlighted text={checked} analysis={analysis} />
              </>
            )}

            {analysis.links.length > 0 && (
              <>
                <h3>Links in the message</h3>
                <ul className="links">
                  {analysis.links.map((l) => (
                    <li key={l.url} className={l.flags.length ? 'risky' : 'clean'}>
                      <code>{l.url}</code>
                      {l.flags.length === 0 ? (
                        <span className="ok">No obvious issues with this link</span>
                      ) : (
                        <ul>
                          {l.flags.map((fl) => (
                            <li key={fl}>{fl}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3>What to do now</h3>
            <ul className="advice">
              {analysis.advice.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="card report">
          <h3>Been targeted? Report it — शिकायत करें</h3>
          <div className="report-grid">
            {REPORT_LINKS.map((r) => (
              <a key={r.title} href={r.href} target="_blank" rel="noreferrer">
                <strong>{r.title}</strong>
                <span>{r.sub}</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer>
        Analysis runs entirely in your browser — nothing you paste is sent anywhere. Sach Ya Scam? gives guidance, not legal advice.
      </footer>
    </div>
  )
}
