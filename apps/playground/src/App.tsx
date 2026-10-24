import { useState } from 'react'
import { useBattery, useMediaQuery } from '@hp-hooks/react'
import type { MediaQuery } from '@hp-hooks/react'

const queries = [
  { label: 'Tablet', value: '(min-width: 768px)' },
  { label: 'Desktop', value: '(min-width: 1024px)' },
  { label: 'Wide desktop', value: '(min-width: 1440px)' },
  { label: 'Dark mode', value: '(prefers-color-scheme: dark)' },
  { label: 'Portrait', value: '(orientation: portrait)' },
]

function formatDuration(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds)) return 'Not available'
  if (seconds === 0) return 'Complete'

  const hours = Math.floor(seconds / 3_600)
  const minutes = Math.ceil((seconds % 3_600) / 60)

  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} hr`

  return `${hours} hr ${minutes} min`
}

export default function App() {
  const [query, setQuery] = useState<MediaQuery>('(min-width: 1024px)')

  const matches = useMediaQuery(query)
  const battery = useBattery()
  const batteryPercentage =
    battery.level === null ? null : Math.round(battery.level * 100)
  const batteryStatus = battery.loading
    ? 'Connecting'
    : !battery.supported
      ? 'Unavailable'
      : battery.charging
        ? 'Charging'
        : 'On battery'
  const batteryStatusKind = battery.loading
    ? 'loading'
    : !battery.supported
      ? 'unavailable'
      : battery.charging
        ? 'charging'
        : 'discharging'

  return (
    <main>
      <header>
        <span className="eyebrow">@hp-hooks/react</span>
        <h1>React Hooks Playground</h1>
        <p>Experiment with reusable hooks in your browser.</p>
      </header>

      <section className="panel battery-panel">
        <div className="panel-heading">
          <div>
            <span className="section-number">01</span>
            <h2>useBattery</h2>
            <p>Live battery information reported by your browser.</p>
          </div>

          <span className={`status-pill status-${batteryStatusKind}`}>
            <span aria-hidden="true" />
            {batteryStatus}
          </span>
        </div>

        <div className="battery-overview" aria-live="polite">
          <div className="battery-visual">
            <div
              className="battery-shell"
              role="meter"
              aria-label="Battery level"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={batteryPercentage ?? 0}
              aria-valuetext={
                batteryPercentage === null
                  ? 'Battery level unavailable'
                  : `${batteryPercentage}%`
              }
            >
              <div
                className="battery-fill"
                style={{ width: `${batteryPercentage ?? 0}%` }}
              />
              {battery.charging && (
                <svg
                  className="charging-icon"
                  viewBox="0 0 24 24"
                  aria-label="Charging"
                >
                  <path d="M13.3 2 5.8 13.1h5.1L10.7 22l7.5-11.1h-5.1L13.3 2Z" />
                </svg>
              )}
            </div>
            <span className="battery-cap" aria-hidden="true" />
          </div>

          <div className="battery-reading">
            <strong>
              {batteryPercentage === null ? '—' : `${batteryPercentage}%`}
            </strong>
            <span>{batteryStatus}</span>
          </div>
        </div>

        {!battery.loading && !battery.supported && (
          <p className="support-message">
            This browser does not expose the Battery Status API. The hook
            returns a safe unavailable state instead.
          </p>
        )}

        <dl className="battery-stats">
          <div>
            <dt>Level</dt>
            <dd>
              {batteryPercentage === null ? 'Not available' : batteryPercentage}
              {batteryPercentage !== null && <small>%</small>}
            </dd>
          </div>
          <div>
            <dt>Power source</dt>
            <dd>
              {battery.charging === null
                ? 'Not available'
                : battery.charging
                  ? 'Adapter'
                  : 'Battery'}
            </dd>
          </div>
          <div>
            <dt>Time to full</dt>
            <dd>{formatDuration(battery.chargingTime)}</dd>
          </div>
          <div>
            <dt>Time remaining</dt>
            <dd>{formatDuration(battery.dischargingTime)}</dd>
          </div>
        </dl>

        <details className="code-example">
          <summary>Usage</summary>
          <pre>
            <code>{`const battery = useBattery()

if (!battery.supported) return <p>Unavailable</p>
if (battery.loading) return <p>Loading…</p>

return <p>{Math.round(battery.level * 100)}%</p>`}</code>
          </pre>
        </details>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="section-number">02</span>
            <h2>useMediaQuery</h2>
            <p>Change a query or resize your browser to test it.</p>
          </div>
        </div>

        <div className="query-list">
          {queries.map((item) => (
            <button
              key={item.value}
              onClick={() => setQuery(item.value)}
              aria-pressed={query === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label htmlFor="query">Media query</label>
        <input
          id="query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="result" aria-live="polite">
          <span>Match status</span>
          <strong>{matches ? 'MATCHES' : 'DOES NOT MATCH'}</strong>
        </div>

        <p className="viewport">
          Viewport: {window.innerWidth}px × {window.innerHeight}px
        </p>
      </section>
    </main>
  )
}
