# @hp-hooks/react

A collection of reusable, type-safe React hooks built with TypeScript.

## Installation

```bash
npm install @hp-hooks/react
```

Or:

```bash
pnpm add @hp-hooks/react
```

**Requirements:** React 18 or 19.

## Available Hooks

| Hook            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| `useMediaQuery` | Subscribe to CSS media query matches using native browser APIs |

## Usage

```tsx
import { useMediaQuery } from '@hp-hooks/react'

export function ResponsiveComponent() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return <div>{isDesktop ? 'Desktop layout' : 'Mobile layout'}</div>
}
```

### Server-side rendering

The hook accepts an optional fallback result:

```tsx
const isDesktop = useMediaQuery('(min-width: 1024px)', false)
```

The fallback is used during server rendering and hydration until the client snapshot is available.

## Development

This repository is a Vite+ monorepo containing the React Hooks library and a playground application.

```bash
vp install
vp -C packages/react test
vp -C packages/react pack
vp -C apps/playground dev
```

## License

MIT.
