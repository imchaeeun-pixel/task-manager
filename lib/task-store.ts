import type { Task } from "@/lib/types"

const STORAGE_KEY = "task-manager.tasks"

let cache: Task[] = []
let initialized = false
const listeners = new Set<() => void>()

const EMPTY: Task[] = []

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`
}

function isTask(value: unknown): value is Task {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Task).id === "string" &&
    typeof (value as Task).title === "string" &&
    typeof (value as Task).completed === "boolean"
  )
}

function readStorage(): Task[] {
  if (typeof window === "undefined") {
    return EMPTY
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return EMPTY
    }
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter(isTask) : EMPTY
  } catch {
    return EMPTY
  }
}

function ensureInitialized() {
  if (!initialized) {
    cache = readStorage()
    initialized = true
  }
}

function commit(next: Task[]) {
  cache = next
  initialized = true
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: () => void) {
  listeners.add(listener)

  // Keep multiple tabs in sync via the storage event.
  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      cache = readStorage()
      listeners.forEach((l) => l())
    }
  }
  window.addEventListener("storage", onStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

export function getSnapshot(): Task[] {
  ensureInitialized()
  return cache
}

export function getServerSnapshot(): Task[] {
  return EMPTY
}

export function addTask(title: string) {
  const trimmed = title.trim()
  if (!trimmed) {
    return
  }
  ensureInitialized()
  commit([
    {
      id: createId(),
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    },
    ...cache,
  ])
}

export function toggleTask(id: string) {
  ensureInitialized()
  commit(
    cache.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    )
  )
}

export function removeTask(id: string) {
  ensureInitialized()
  commit(cache.filter((task) => task.id !== id))
}

export function clearCompleted() {
  ensureInitialized()
  commit(cache.filter((task) => !task.completed))
}
