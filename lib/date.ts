export const DAY_MS = 86_400_000

export const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"]

/** Local-midnight timestamp for the day containing `ts`. */
export function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** "YYYY-MM-DD" (local) suitable for an <input type="date"> value. */
export function toDateInputValue(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Parse "YYYY-MM-DD" into a local-midnight timestamp, or null. */
export function parseDateInput(value: string): number | null {
  if (!value) {
    return null
  }
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) {
    return null
  }
  return new Date(y, m - 1, d).getTime()
}

export type DueTone = "overdue" | "today" | "soon" | "normal"

/** Human-friendly due label relative to `now`, with a tone for styling. */
export function formatDue(
  dueTs: number,
  now: number
): { text: string; tone: DueTone } {
  const diffDays = Math.round((startOfDay(dueTs) - startOfDay(now)) / DAY_MS)

  if (diffDays < 0) {
    return { text: `${-diffDays}일 지남`, tone: "overdue" }
  }
  if (diffDays === 0) {
    return { text: "오늘", tone: "today" }
  }
  if (diffDays === 1) {
    return { text: "내일", tone: "soon" }
  }

  const d = new Date(dueTs)
  return {
    text: `${d.getMonth() + 1}/${d.getDate()}`,
    tone: diffDays <= 3 ? "soon" : "normal",
  }
}
