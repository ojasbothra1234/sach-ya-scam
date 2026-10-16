import { useEffect, useState } from 'react'
import { estimateSince, formatRate, formatStat, istYear, istYearStart, LIVE_STATS } from './engine/stats'

export default function LiveCounters() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const elapsed = now - istYearStart(now)

  return (
    <section className="stats" aria-label="Live estimates">
      {LIVE_STATS.map((s) => (
        <div key={s.id}>
          <span className="eyebrow">
            <i className="live-dot" aria-hidden="true" /> {s.eyebrow} · so far in {istYear(now)}
          </span>
          <strong aria-live="off">{formatStat(s, estimateSince(s.perYear, elapsed))}</strong>
          <span>
            {s.caption} — {formatRate(s)}
          </span>
          <span className="stat-source">Estimate at 2024's official rate ({s.source})</span>
        </div>
      ))}
    </section>
  )
}
