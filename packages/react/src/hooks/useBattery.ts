import React from 'react'

interface BatteryManager extends EventTarget {
  readonly level: number
  readonly charging: boolean
  readonly chargingTime: number
  readonly dischargingTime: number
}

interface BatteryNavigator extends Navigator {
  getBattery(): Promise<BatteryManager>
}

export interface BatteryState {
  supported: boolean
  loading: boolean
  level: number | null
  charging: boolean | null
  chargingTime: number | null
  dischargingTime: number | null
}

const initialState: BatteryState = {
  supported: false,
  loading: true,
  level: null,
  charging: null,
  chargingTime: null,
  dischargingTime: null,
}

const unavailableState: BatteryState = {
  ...initialState,
  loading: false,
}

const events = [
  'levelchange',
  'chargingchange',
  'chargingtimechange',
  'dischargingtimechange',
] as const

function createBatteryStore() {
  let snapshot = initialState
  let battery: BatteryManager | null = null
  let inFlightRequest: Promise<BatteryManager> | null = null

  // indicates whether the store currently has subscribers
  let active = false

  // identifies the current connect/disconnect lifecycle
  let generation = 0

  const listeners = new Set<() => void>()

  function setSnapshot(next: BatteryState) {
    // avoid unnecessary notifications
    const unchanged = Object.keys(next).every(
      (key) =>
        next[key as keyof BatteryState] === snapshot[key as keyof BatteryState],
    )

    if (unchanged) return

    snapshot = next
    // notify every subscriber
    listeners.forEach((listener) => listener())
  }

  function update() {
    if (battery) {
      setSnapshot({
        supported: true,
        loading: false,
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      })
    }
  }

  function connect() {
    if (active) return

    active = true
    const currentGeneration = ++generation

    // handle unsupported environment
    if (
      typeof navigator === 'undefined' ||
      !('getBattery' in navigator) ||
      typeof navigator.getBattery !== 'function'
    ) {
      setSnapshot(unavailableState)
      return
    }

    setSnapshot({
      ...initialState,
      supported: true,
    })

    const nav = navigator as BatteryNavigator
    // request currently running -> reuse it
    const request = inFlightRequest ?? nav.getBattery()
    inFlightRequest = request

    void request
      .then(
        (manager) => {
          // ignore callbacks from an obsolete connection
          if (!active || currentGeneration !== generation) {
            return
          }

          battery = manager

          // listen to battery changes
          for (const event of events) {
            battery.addEventListener(event, update)
          }

          update()
        },
        () => {
          if (active && currentGeneration === generation) {
            setSnapshot(unavailableState)
          }
        },
      )
      .finally(() => {
        // request already settled -> allow a fresh request
        if (inFlightRequest === request) {
          inFlightRequest = null
        }
      })
  }

  function disconnect() {
    if (!battery) return

    for (const event of events) {
      battery.removeEventListener(event, update)
    }

    battery = null
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)

    if (listeners.size === 1) {
      connect()
    }

    return () => {
      listeners.delete(listener)

      if (listeners.size === 0) {
        active = false
        generation++
        disconnect()
      }
    }
  }

  return {
    subscribe,
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initialState,
  }
}

const batteryStore = createBatteryStore()

export function useBattery(): BatteryState {
  return React.useSyncExternalStore(
    batteryStore.subscribe,
    batteryStore.getSnapshot,
    batteryStore.getServerSnapshot,
  )
}
