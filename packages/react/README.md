# @hp-hooks/react

![React](https://img.shields.io/badge/React-18%20%7C%2019-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?logo=typescript&logoColor=white)
![Vite+](https://img.shields.io/badge/Vite%2B-monorepo-646CFF?logo=vite&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-12-F69220?logo=pnpm&logoColor=white)

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
