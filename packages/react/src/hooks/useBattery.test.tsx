import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { renderHook } from 'vitest-browser-react'

import { useBattery } from './useBattery'

class FakeBatteryManager extends EventTarget {
  level = 0.8
  charging = true
  chargingTime = 120
  dischargingTime = Infinity
}

const availableState = {
  supported: true,
  loading: false,
  level: 0.8,
  charging: true,
  chargingTime: 120,
  dischargingTime: Infinity,
}

const unavailableState = {
  supported: false,
  loading: false,
  level: null,
  charging: null,
  chargingTime: null,
  dischargingTime: null,
}

function mockGetBattery(getBattery: () => Promise<FakeBatteryManager>) {
  const mockedGetBattery = vi.fn(getBattery)

  Object.defineProperty(navigator, 'getBattery', {
    configurable: true,
    value: mockedGetBattery,
  })

  return mockedGetBattery
}

const originalGetBattery = Object.getOwnPropertyDescriptor(
  navigator,
  'getBattery',
)

afterEach(() => {
  if (originalGetBattery) {
    Object.defineProperty(navigator, 'getBattery', originalGetBattery)
  } else {
    delete (navigator as Navigator & { getBattery?: unknown }).getBattery
  }
})

describe('useBattery', () => {
  it('returns an unavailable state when the Battery Status API is missing', async () => {
    Object.defineProperty(navigator, 'getBattery', {
      configurable: true,
      value: undefined,
    })

    const { result } = await renderHook(() => useBattery())

    await expect.poll(() => result.current).toEqual(unavailableState)
  })

  it('reports loading until the battery request resolves', async () => {
    const manager = new FakeBatteryManager()
    let resolveBattery!: (manager: FakeBatteryManager) => void
    const batteryRequest = new Promise<FakeBatteryManager>((resolve) => {
      resolveBattery = resolve
    })

    mockGetBattery(() => batteryRequest)

    const { result, act } = await renderHook(() => useBattery())

    expect(result.current).toEqual({
      supported: true,
      loading: true,
      level: null,
      charging: null,
      chargingTime: null,
      dischargingTime: null,
    })

    await act(async () => {
      resolveBattery(manager)
      await batteryRequest
    })

    await expect.poll(() => result.current).toEqual(availableState)
  })

  it('returns the current battery state when the request resolves', async () => {
    const manager = new FakeBatteryManager()

    mockGetBattery(() => Promise.resolve(manager))

    const { result } = await renderHook(() => useBattery())

    await expect.poll(() => result.current).toEqual(availableState)
  })

  it('updates when the battery manager dispatches change events', async () => {
    const manager = new FakeBatteryManager()

    mockGetBattery(() => Promise.resolve(manager))

    const { result, act } = await renderHook(() => useBattery())

    await expect.poll(() => result.current).toEqual(availableState)

    await act(() => {
      manager.level = 0.4
      manager.dispatchEvent(new Event('levelchange'))
    })
    expect(result.current.level).toBe(0.4)

    await act(() => {
      manager.charging = false
      manager.dispatchEvent(new Event('chargingchange'))
    })
    expect(result.current.charging).toBe(false)

    await act(() => {
      manager.chargingTime = Infinity
      manager.dispatchEvent(new Event('chargingtimechange'))
    })
    expect(result.current.chargingTime).toBe(Infinity)

    await act(() => {
      manager.dischargingTime = 3_600
      manager.dispatchEvent(new Event('dischargingtimechange'))
    })

    expect(result.current.dischargingTime).toBe(3_600)
  })

  it('shares one connection and disconnects after the last subscriber leaves', async () => {
    const manager = new FakeBatteryManager()
    const addEventListener = vi.spyOn(manager, 'addEventListener')
    const removeEventListener = vi.spyOn(manager, 'removeEventListener')
    const getBattery = mockGetBattery(() => Promise.resolve(manager))

    const first = await renderHook(() => useBattery())
    const second = await renderHook(() => useBattery())

    await expect.poll(() => second.result.current).toEqual(availableState)

    expect(getBattery).toHaveBeenCalledTimes(1)
    expect(addEventListener).toHaveBeenCalledTimes(4)

    await first.unmount()
    expect(removeEventListener).not.toHaveBeenCalled()

    await second.unmount()
    expect(removeEventListener).toHaveBeenCalledTimes(4)
  })

  it('does not publish the result of a request after its subscriber leaves', async () => {
    const manager = new FakeBatteryManager()
    const addEventListener = vi.spyOn(manager, 'addEventListener')
    let resolveBattery!: (manager: FakeBatteryManager) => void
    const batteryRequest = new Promise<FakeBatteryManager>((resolve) => {
      resolveBattery = resolve
    })

    mockGetBattery(() => batteryRequest)

    const { unmount, act } = await renderHook(() => useBattery())
    await unmount()

    await act(async () => {
      resolveBattery(manager)
      await batteryRequest
      await Promise.resolve()
    })

    expect(addEventListener).not.toHaveBeenCalled()
  })

  it('reports an unavailable state after a rejected request and retries later', async () => {
    const manager = new FakeBatteryManager()
    let attempt = 0
    const getBattery = mockGetBattery(() => {
      attempt++

      return attempt === 1
        ? Promise.reject(new Error('Battery permission denied'))
        : Promise.resolve(manager)
    })

    const first = await renderHook(() => useBattery())

    await expect.poll(() => first.result.current).toEqual(unavailableState)

    await first.unmount()

    const second = await renderHook(() => useBattery())

    await expect.poll(() => second.result.current).toEqual(availableState)

    expect(getBattery).toHaveBeenCalledTimes(2)
  })

  it('preserves the snapshot identity when an event changes no values', async () => {
    const manager = new FakeBatteryManager()

    mockGetBattery(() => Promise.resolve(manager))

    const { result, act } = await renderHook(() => useBattery())

    await expect.poll(() => result.current).toEqual(availableState)

    const snapshot = result.current

    await act(() => {
      manager.dispatchEvent(new Event('levelchange'))
    })

    expect(result.current).toBe(snapshot)
  })

  it('connects a new subscriber to an in-flight battery request', async () => {
    const manager = new FakeBatteryManager()
    let resolveBattery!: (manager: FakeBatteryManager) => void
    const batteryRequest = new Promise<FakeBatteryManager>((resolve) => {
      resolveBattery = resolve
    })
    const getBattery = mockGetBattery(() => batteryRequest)

    const first = await renderHook(() => useBattery())
    await first.unmount()

    const second = await renderHook(() => useBattery())

    await second.act(async () => {
      resolveBattery(manager)
      await batteryRequest
    })

    await expect.poll(() => second.result.current).toEqual(availableState)

    expect(getBattery).toHaveBeenCalledTimes(1)
  })
})
