import { useEffect, useMemo, useRef, useState } from 'react'
import { analyze, CATEGORY_INFO } from './engine'

const LANGS = [
  { code: 'hi-IN', label: 'Hindi / Hinglish' },
  { code: 'en-IN', label: 'English (India)' },
]

const DEMO_CALL = [
  'Hello, main Inspector Rajesh bol raha hoon, Mumbai Police Cyber Crime Branch se.',
  'Aapke naam se ek parcel customs ne pakda hai jisme drugs aur fake passport mile hain.',
  'Aapke against FIR register ho chuki hai aur arrest warrant issue hua hai, money laundering case hai.',
  'Aap abhi digital arrest mein hain. Video call par rahiye aur kisi ko mat batana, family ko bhi nahi.',
  'Apni innocence prove karne ke liye apni savings RBI verification account mein turant transfer kijiye. Paisa verify hone ke baad refund ho jayega.',
]

function beep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    gain.gain.value = 0.15
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
  } catch {
    /* audio unavailable */
  }
}

export default function CallGuard() {
  const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition ?? window.webkitSpeechRecognition : undefined
  const supported = Boolean(Recognition)

  const [lang, setLang] = useState(LANGS[0].code)
  const [listening, setListening] = useState(false)
  const [finalText, setFinalText] = useState('')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [demo, setDemo] = useState(false)
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const wantListening = useRef(false)
  const alerted = useRef(false)

  const transcript = (finalText + ' ' + interim).trim()
  const analysis = useMemo(() => (transcript ? analyze(transcript) : null), [transcript])
  const danger = analysis !== null && (analysis.verdict === 'scam' || (analysis.score >= 25 && analysis.categories.includes('digital_arrest')))

  useEffect(() => {
    if (danger && !alerted.current) {
      alerted.current = true
      beep()
      navigator.vibrate?.([300, 100, 300])
    }
    if (!danger) alerted.current = false
  }, [danger])

  useEffect(() => {
    if (!demo) return
    let i = 0
    const t = setInterval(() => {
      const line = DEMO_CALL[i]
      setFinalText((prev) => (prev + ' ' + line).trim())
      i += 1
      if (i >= DEMO_CALL.length) {
        clearInterval(t)
        setDemo(false)
      }
    }, 1800)
    return () => clearInterval(t)
  }, [demo])

  const stop = () => {
    wantListening.current = false
    recRef.current?.stop()
    recRef.current = null
    setListening(false)
    setInterim('')
  }

  const start = () => {
    if (!Recognition) return
    setError(null)
    const rec = new Recognition()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e) => {
      let finals = ''
      let partial = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finals += r[0].transcript + ' '
        else partial += r[0].transcript
      }
      if (finals) setFinalText((prev) => (prev + ' ' + finals).trim())
      setInterim(partial)
    }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setError('Microphone access was blocked. Allow the mic for this site, or type what the caller says in Check above.')
        wantListening.current = false
        setListening(false)
      } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setError(`Speech recognition error: ${e.error}`)
      }
    }
    rec.onend = () => {
      if (wantListening.current) {
        try {
          rec.start()
        } catch {
          setListening(false)
        }
      }
    }
    recRef.current = rec
    wantListening.current = true
    setListening(true)
    rec.start()
  }

  useEffect(() => () => recRef.current?.abort(), [])

  const reset = () => {
    setFinalText('')
    setInterim('')
    setDemo(false)
  }

  return (
    <section className={`window guard${danger ? ' guard-danger' : ''}`} aria-live="polite">
      <div className="window-bar">
        <strong>Sach Ya Scam? · Live Call Guard</strong>
        <span>{listening ? 'Listening…' : 'Digital-arrest prevention'}</span>
      </div>
      <div className="window-body">
        <p className="guard-intro">
          Getting a “police”, “CBI” or “customs” call? Put the call on <strong>speaker</strong>, tap <strong>Start guard</strong>, and keep this page open. We
          transcribe what the caller says and flag digital-arrest tactics the moment they appear. <span className="hi">नकली पुलिस कॉल? स्पीकर पर रखें और गार्ड चालू करें।</span>
        </p>

        <div className="actions">
          {listening ? (
            <button className="danger" onClick={stop}>
              Stop guard
            </button>
          ) : (
            <button className="primary" onClick={start} disabled={!supported}>
              Start guard
            </button>
          )}
          <select value={lang} onChange={(e) => setLang(e.target.value)} disabled={listening} aria-label="Call language">
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <button className="ghost" onClick={() => setDemo(true)} disabled={demo || listening}>
            Simulate a scam call
          </button>
          {transcript && (
            <button className="ghost" onClick={reset}>
              Reset
            </button>
          )}
        </div>

        {!supported && (
          <p className="guard-note">
            Live transcription needs Chrome or Edge (desktop or Android). In other browsers, type what the caller says in Check above, or try the simulation.
          </p>
        )}
        {error && <p className="guard-note guard-error">{error}</p>}
        {supported && !listening && !transcript && (
          <p className="guard-note">Speech is transcribed by your browser's speech service; nothing is stored by this site.</p>
        )}

        {danger && analysis && (
          <div className="guard-alert" role="alert">
            <strong>Hang up now. This is a scam call.</strong>
            <span>
              There is no such thing as a “digital arrest”. Police, CBI, ED and courts never video-call or ask for money. Do not transfer anything. Tell a
              family member and call <a href="tel:1930">1930</a>.
            </span>
            <span className="hi">फ़ोन काट दें। डिजिटल अरेस्ट जैसी कोई चीज़ नहीं होती। 1930 पर कॉल करें।</span>
          </div>
        )}

        {transcript && (
          <div className="guard-live">
            <div className="guard-transcript">
              <span className="eyebrow">Live transcript</span>
              <p>
                {finalText} <em>{interim}</em>
              </p>
            </div>
            {analysis && (
              <div className="guard-flags">
                <span className="eyebrow">
                  {analysis.findings.length} red flag{analysis.findings.length === 1 ? '' : 's'} · risk {analysis.score} / 100
                </span>
                {analysis.categories.length > 0 && (
                  <div className="tags">
                    {analysis.categories.slice(0, 3).map((c) => (
                      <span key={c} className="tag">
                        {CATEGORY_INFO[c].label}
                      </span>
                    ))}
                  </div>
                )}
                <ul>
                  {analysis.findings.slice(0, 6).map((f) => (
                    <li key={f.id}>
                      <strong>{f.label}</strong>
                      {f.matches[0] && <q>{f.matches[0].text}</q>}
                    </li>
                  ))}
                  {analysis.findings.length === 0 && <li>No scam tactics heard yet. Keep listening.</li>}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
