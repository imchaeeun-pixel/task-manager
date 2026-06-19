export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: number
  /** Local-midnight timestamp of the due date, or null if none. */
  dueDate: number | null
  /** Timestamp when the task was marked complete, or null. */
  completedAt: number | null
  /** Project / category name. Empty string means uncategorized. */
  project: string
}

export type TaskFilter =
  | "all"
  | "active"
  | "completed"
  | "today"
  | "overdue"
