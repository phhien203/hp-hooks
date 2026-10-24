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

| Hook            | Description                                                      |
| --------------- | ---------------------------------------------------------------- |
| `useBattery`    | Subscribe to the device battery state when the browser allows it |
| `useMediaQuery` | Subscribe to CSS media query matches using native browser APIs   |

## Usage

### `useBattery`

`useBattery` reads the browser's Battery Status API and updates when the battery
level, charging state, or time estimates change.

```tsx
import { useBattery } from '@hp-hooks/react'

export function BatteryIndicator() {
  const battery = useBattery()

  if (battery.loading) {
    return <p>Reading battery status…</p>
  }

  if (!battery.supported || battery.level === null) {
    return <p>Battery status is unavailable.</p>
  }

  const percentage = Math.round(battery.level * 100)

  return (
    <p>
      {battery.charging ? 'Charging' : 'On battery'} · {percentage}%
    </p>
  )
}
```

The hook returns a `BatteryState` object:

| Property          | Type              | Description                                        |
| ----------------- | ----------------- | -------------------------------------------------- |
| `supported`       | `boolean`         | Whether battery information is available           |
| `loading`         | `boolean`         | Whether the initial battery request is in progress |
| `level`           | `number \| null`  | Charge level from `0` to `1`                       |
| `charging`        | `boolean \| null` | Whether the device is charging                     |
| `chargingTime`    | `number \| null`  | Seconds until full                                 |
| `dischargingTime` | `number \| null`  | Seconds until empty                                |

Time values may be `Infinity` when the browser cannot provide an estimate. The
Battery Status API is not available in every browser. When it is unavailable or
the request fails, `supported` and `loading` are `false` and the battery values
are `null`.

The hook is safe to render on the server. It begins with a loading snapshot and
checks browser support after the component subscribes on the client. Multiple
components share one battery connection, which is removed after the last
subscriber unmounts.

### `useMediaQuery`

```tsx
import { useMediaQuery } from '@hp-hooks/react'

export function ResponsiveComponent() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return <div>{isDesktop ? 'Desktop layout' : 'Mobile layout'}</div>
}
```

#### Server-side rendering

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
