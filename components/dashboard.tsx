"use client"

import * as React from "react"
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  LayoutDashboard,
  ListTodo,
} from "lucide-react"

import { useTasks } from "@/hooks/use-tasks"
import { useNow } from "@/hooks/use-now"
import { DAY_MS, startOfDay, WEEKDAYS_KO } from "@/lib/date"

interface TrendPoint {
  label: string
  count: number
  isToday: boolean
}

interface Stats {
  total: number
  completed: number
  dueToday: number
  overdue: number
  pct: number
  trend: TrendPoint[]
  max: number
}

const EMPTY_STATS: Stats = {
  total: 0,
  completed: 0,
  dueToday: 0,
  overdue: 0,
  pct: 0,
  trend: Array.from({ length: 7 }, () => ({
    label: "",
    count: 0,
    isToday: false,
  })),
  max: 1,
}

export function Dashboard() {
  const { tasks, hydrated } = useTasks()
  const now = useNow()

  const stats = React.useMemo<Stats>(() => {
    // Avoid date math before hydration so the first client render matches the
    // server-rendered (empty) output.
    if (!hydrated || now === 0) {
      return EMPTY_STATS
    }

    const today = startOfDay(now)
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const dueToday = tasks.filter(
      (t) => !t.completed && t.dueDate !== null && startOfDay(t.dueDate) === today
    ).length
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate !== null && startOfDay(t.dueDate) < today
    ).length
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100)

    const days = Array.from({ length: 7 }, (_, i) => today - (6 - i) * DAY_MS)
    const trend: TrendPoint[] = days.map((dayStart) => ({
      label: WEEKDAYS_KO[new Date(dayStart).getDay()],
      count: tasks.filter(
        (t) => t.completedAt !== null && startOfDay(t.completedAt) === dayStart
      ).length,
      isToday: dayStart === today,
    }))
    const max = Math.max(1, ...trend.map((d) => d.count))

    return { total, completed, dueToday, overdue, pct, trend, max }
  }, [tasks, hydrated, now])

  const cards = [
    {
      key: "total",
      label: "전체 작업",
      value: stats.total,
      tone: "brand",
      icon: <ListTodo />,
    },
    {
      key: "completed",
      label: "완료 작업",
      value: stats.completed,
      tone: "success",
      icon: <CheckCircle2 />,
    },
    {
      key: "dueToday",
      label: "오늘 마감",
      value: stats.dueToday,
      tone: "warning",
      icon: <CalendarClock />,
    },
    {
      key: "overdue",
      label: "지연",
      value: stats.overdue,
      tone: "danger",
      icon: <AlertTriangle />,
    },
  ] as const

  const weekTotal = stats.trend.reduce((sum, d) => sum + d.count, 0)

  return (
    <section className="dash" aria-label="대시보드">
      <header className="dash__header">
        <div className="dash__logo">
          <LayoutDashboard />
        </div>
        <div className="dash__heading">
          <h2 className="dash__title">대시보드</h2>
          <p className="dash__subtitle">한눈에 보는 작업 현황</p>
        </div>
      </header>

      <div className="dash__stats">
        {cards.map((card) => (
          <div key={card.key} className={`stat stat--${card.tone}`}>
            <div className="stat__icon">{card.icon}</div>
            <div className="stat__value">{card.value}</div>
            <div className="stat__label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="dash__progress">
        <div className="dash__progress-top">
          <span>전체 진행률</span>
          <span className="dash__progress-pct">{stats.pct}%</span>
        </div>
        <div
          className="dash__progress-track"
          role="progressbar"
          aria-valuenow={stats.pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="dash__progress-fill"
            style={{ width: `${stats.pct}%` }}
          />
        </div>
        <div className="dash__progress-meta">
          {stats.completed} / {stats.total} 완료
        </div>
      </div>

      <div className="dash__trend">
        <div className="dash__trend-top">
          <span>최근 7일 완료 추세</span>
          <span className="dash__trend-sum">{weekTotal}건</span>
        </div>
        <div className="chart" role="img" aria-label={`최근 7일간 ${weekTotal}건 완료`}>
          {stats.trend.map((point, i) => (
            <div key={i} className="chart__col">
              <div className="chart__bar-wrap">
                {point.count > 0 && (
                  <span className="chart__count">{point.count}</span>
                )}
                <div
                  className={`chart__bar${point.isToday ? " chart__bar--today" : ""}`}
                  style={{
                    height: `${(point.count / stats.max) * 100}%`,
                  }}
                />
              </div>
              <span
                className={`chart__label${point.isToday ? " chart__label--today" : ""}`}
              >
                {point.label || "·"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
