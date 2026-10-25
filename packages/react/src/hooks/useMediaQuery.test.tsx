import { describe, expect, it } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser/context'
import { renderHook } from 'vitest-browser-react'

import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
  it('returns true when the query matches', async () => {
    await page.viewport(1200, 800)

    const { result } = await renderHook(() =>
      useMediaQuery('(min-width: 1024px)'),
    )

    expect(result.current).toBe(true)
  })

  it('returns false when the query does not match', async () => {
    await page.viewport(800, 600)

    const { result } = await renderHook(() =>
      useMediaQuery('(min-width: 1024px)'),
    )

    expect(result.current).toBe(false)
  })

  it('updates when the viewport crosses a breakpoint', async () => {
    await page.viewport(800, 600)

    const { result } = await renderHook(() =>
      useMediaQuery('(min-width: 1024px)'),
    )

    expect(result.current).toBe(false)

    await page.viewport(1200, 800)

    await expect.poll(() => result.current).toBe(true)

    await page.viewport(700, 600)

    await expect.poll(() => result.current).toBe(false)
  })

  it('updates when the query prop changes', async () => {
    await page.viewport(900, 600)

    const { result, rerender } = await renderHook(
      (props: { query: string } | undefined) =>
        useMediaQuery(props?.query ?? '(min-width: 1024px)'),
      {
        initialProps: {
          query: '(min-width: 1024px)',
        },
      },
    )

    expect(result.current).toBe(false)

    await rerender({
      query: '(min-width: 768px)',
    })

    await expect.poll(() => result.current).toBe(true)
  })
})
