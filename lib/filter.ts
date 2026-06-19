import type { Task, TaskFilter } from "@/lib/types"
import { startOfDay } from "@/lib/date"

/**
 * Whether a task belongs to a given filter view. `now` is the current time
 * (used by the date-based views). The "today"/"overdue" views match the
 * dashboard card definitions: only incomplete, dated tasks.
 */
export function matchesFilter(
  task: Task,
  filter: TaskFilter,
  now: number
): boolean {
  switch (filter) {
    case "active":
      return !task.completed
    case "completed":
      return task.completed
    case "today":
      return (
        !task.completed &&
        task.dueDate !== null &&
        startOfDay(task.dueDate) === startOfDay(now)
      )
    case "overdue":
      return (
        !task.completed &&
        task.dueDate !== null &&
        startOfDay(task.dueDate) < startOfDay(now)
      )
    case "all":
    default:
      return true
  }
}
