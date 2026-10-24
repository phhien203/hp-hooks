import React from 'react'

export type MediaQuery =
  | `(min-width: ${number}px)`
  | `(max-width: ${number}px)`
  | `(min-height: ${number}px)`
  | `(max-height: ${number}px)`
  | `(orientation: ${'portrait' | 'landscape'})`
  | '(prefers-color-scheme: dark)'
  | '(prefers-color-scheme: light)'
  | '(prefers-reduced-motion: reduce)'
  | '(prefers-reduced-motion: no-preference)'
  | (string & {})

export function useMediaQuery(
  query: MediaQuery,
  serverFallback = false,
): boolean {
  const mediaQueryList = React.useMemo(
    () => (typeof window === 'undefined' ? null : window.matchMedia(query)),
    [query],
  )

  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      if (!mediaQueryList) {
        return () => {}
      }

      mediaQueryList.addEventListener('change', onStoreChange)

      return () => {
        mediaQueryList.removeEventListener('change', onStoreChange)
      }
    },
    [mediaQueryList],
  )

  const getSnapshot = () => mediaQueryList?.matches ?? serverFallback

  const getServerSnapshot = () => serverFallback

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
