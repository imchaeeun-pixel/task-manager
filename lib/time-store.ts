// External store exposing the current time, so components can read "now"
// through useSyncExternalStore instead of calling the impure Date.now()
// during render. The snapshot is a cached value that only changes on the
// interval tick, keeping render pure and stable.

let current = 0
let timer: ReturnType<typeof setInterval> | undefined
const listeners = new Set<() => void>()

export function subscribe(listener: () => void) {
  listeners.add(listener)

  if (current === 0) {
    current = Date.now()
  }
  if (timer === undefined) {
    timer = setInterval(() => {
      current = Date.now()
      listeners.forEach((l) => l())
    }, 60_000)
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && timer !== undefined) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

export function getSnapshot(): number {
  if (current === 0) {
    current = Date.now()
  }
  return current
}

export function getServerSnapshot(): number {
  return 0
}
