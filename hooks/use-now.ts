"use client"

import * as React from "react"

import * as timeStore from "@/lib/time-store"

/** Current timestamp, updated every minute. Returns 0 until mounted. */
export function useNow(): number {
  return React.useSyncExternalStore(
    timeStore.subscribe,
    timeStore.getSnapshot,
    timeStore.getServerSnapshot
  )
}
