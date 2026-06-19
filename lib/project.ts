import type { Task } from "@/lib/types"

export const UNCATEGORIZED = "미분류"

/** Distinct hues for project segments; cycled by index. */
const PROJECT_HUES = [277, 200, 150, 95, 45, 15, 330, 250]

export function projectColor(index: number): string {
  const hue = PROJECT_HUES[index % PROJECT_HUES.length]
  return `oklch(0.62 0.17 ${hue})`
}

/** Whether a task belongs to the selected project filter (null = any). */
export function matchesProject(task: Task, projectFilter: string | null): boolean {
  if (projectFilter === null) {
    return true
  }
  if (projectFilter === UNCATEGORIZED) {
    return task.project === ""
  }
  return task.project === projectFilter
}

export interface ProjectGroup {
  name: string
  total: number
  completed: number
  color: string
}

/** Distinct project names present in the tasks, sorted (uncategorized last). */
export function projectNames(tasks: Task[]): string[] {
  const names = new Set<string>()
  for (const task of tasks) {
    if (task.project) {
      names.add(task.project)
    }
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b, "ko"))
}

/** Group tasks by project for the distribution view, largest group first. */
export function groupByProject(tasks: Task[]): ProjectGroup[] {
  const map = new Map<string, { total: number; completed: number }>()

  for (const task of tasks) {
    const key = task.project || UNCATEGORIZED
    const entry = map.get(key) ?? { total: 0, completed: 0 }
    entry.total += 1
    if (task.completed) {
      entry.completed += 1
    }
    map.set(key, entry)
  }

  return Array.from(map.entries())
    .sort((a, b) => {
      // Uncategorized always sinks to the bottom.
      if (a[0] === UNCATEGORIZED) return 1
      if (b[0] === UNCATEGORIZED) return -1
      return b[1].total - a[1].total
    })
    .map(([name, entry], index) => ({
      name,
      total: entry.total,
      completed: entry.completed,
      color: name === UNCATEGORIZED ? "var(--muted-foreground)" : projectColor(index),
    }))
}
