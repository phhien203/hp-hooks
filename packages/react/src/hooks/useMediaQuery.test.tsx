import { afterEach, describe, expect, it } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser/context'
import { cleanup, renderHook, waitFor } from '@testing-library/react'

import { useMediaQuery } from './useMediaQuery'

afterEach(() => {
  cleanup()
})

describe('useMediaQuery', () => {
  it('returns true when the query matches', async () => {
    await page.viewport(1200, 800)

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))

    expect(result.current).toBe(true)
  })

  it('returns false when the query does not match', async () => {
    await page.viewport(800, 600)

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))

    expect(result.current).toBe(false)
  })

  it('updates when the viewport crosses a breakpoint', async () => {
    await page.viewport(800, 600)

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))

    expect(result.current).toBe(false)

    await page.viewport(1200, 800)

    await waitFor(() => {
      expect(result.current).toBe(true)
    })

    await page.viewport(700, 600)

    await waitFor(() => {
      expect(result.current).toBe(false)
    })
  })

  it('updates when the query prop changes', async () => {
    await page.viewport(900, 600)

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useMediaQuery(query),
      {
        initialProps: {
          query: '(min-width: 1024px)',
        },
      },
    )

    expect(result.current).toBe(false)

    rerender({
      query: '(min-width: 768px)',
    })

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })
})
