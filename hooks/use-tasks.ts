"use client"

import * as React from "react"

import * as store from "@/lib/task-store"

export function useTasks() {
  const tasks = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  )

  // `false` during SSR and the first client render, then `true` once mounted —
  // lets the UI show a loading state instead of flashing "no tasks".
  const hydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return {
    tasks,
    hydrated,
    addTask: store.addTask,
    updateTask: store.updateTask,
    toggleTask: store.toggleTask,
    removeTask: store.removeTask,
    clearCompleted: store.clearCompleted,
  }
}
