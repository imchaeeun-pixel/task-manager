export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: number
  /** Local-midnight timestamp of the due date, or null if none. */
  dueDate: number | null
  /** Timestamp when the task was marked complete, or null. */
  completedAt: number | null
}

export type TaskFilter =
  | "all"
  | "active"
  | "completed"
  | "today"
  | "overdue"
