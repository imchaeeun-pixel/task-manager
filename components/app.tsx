"use client"

import * as React from "react"

import type { TaskFilter } from "@/lib/types"
import { Dashboard } from "@/components/dashboard"
import { TaskManager } from "@/components/task-manager"

export function App() {
  const [filter, setFilter] = React.useState<TaskFilter>("all")

  return (
    <div className="app-shell">
      <Dashboard activeFilter={filter} onSelectFilter={setFilter} />
      <TaskManager filter={filter} onFilterChange={setFilter} />
    </div>
  )
}
