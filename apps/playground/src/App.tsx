import { useState } from 'react'
import { useMediaQuery } from '@hp-hooks/react'
import type { MediaQuery } from '@hp-hooks/react'

const queries = [
  { label: 'Tablet', value: '(min-width: 768px)' },
  { label: 'Desktop', value: '(min-width: 1024px)' },
  { label: 'Wide desktop', value: '(min-width: 1440px)' },
  { label: 'Dark mode', value: '(prefers-color-scheme: dark)' },
  { label: 'Portrait', value: '(orientation: portrait)' },
]

export default function App() {
  const [query, setQuery] = useState<MediaQuery>('(min-width: 1024px)')

  const matches = useMediaQuery(query)

  return (
    <main>
      <header>
        <span className="eyebrow">@hp-hooks/react</span>
        <h1>React Hooks Playground</h1>
        <p>Experiment with reusable hooks in your browser.</p>
      </header>

      <section className="panel">
        <h2>useMediaQuery</h2>
        <p>Change a query or resize your browser to test it.</p>

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
