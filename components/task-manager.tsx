"use client"

import * as React from "react"
import { Check, Plus, Trash2 } from "lucide-react"

import type { TaskFilter } from "@/lib/types"
import { useTasks } from "@/hooks/use-tasks"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행중" },
  { value: "completed", label: "완료" },
]

export function TaskManager() {
  const { tasks, hydrated, addTask, toggleTask, removeTask, clearCompleted } =
    useTasks()
  const [draft, setDraft] = React.useState("")
  const [filter, setFilter] = React.useState<TaskFilter>("all")

  const remaining = tasks.filter((task) => !task.completed).length
  const completed = tasks.length - remaining

  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed
    if (filter === "completed") return task.completed
    return true
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    addTask(draft)
    setDraft("")
  }

  return (
    <div className="tm">
      <header className="tm__header">
        <h1 className="tm__title">할 일 관리</h1>
        <span className="tm__count">{remaining}개 남음</span>
      </header>

      <form onSubmit={handleSubmit} className="tm__form">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="할 일을 입력하세요…"
          aria-label="새 할 일"
          className="tm__input"
        />
        <Button type="submit" size="lg" disabled={!draft.trim()}>
          <Plus />
          추가
        </Button>
      </form>

      <div className="tm__toolbar">
        <div className="tm__filters">
          {FILTERS.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={filter === item.value ? "secondary" : "ghost"}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        {completed > 0 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clearCompleted}
          >
            완료 삭제
          </Button>
        )}
      </div>

      <ul className="tm__list">
        {!hydrated ? (
          <li className="tm__empty">불러오는 중…</li>
        ) : visibleTasks.length === 0 ? (
          <li className="tm__empty">
            {tasks.length === 0
              ? "아직 할 일이 없습니다. 위에서 추가해 보세요!"
              : "해당하는 할 일이 없습니다."}
          </li>
        ) : (
          visibleTasks.map((task) => (
            <li key={task.id} className="tm__item">
              <button
                type="button"
                role="checkbox"
                aria-checked={task.completed}
                aria-label={task.completed ? "완료 취소" : "완료로 표시"}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "tm__checkbox",
                  task.completed && "tm__checkbox--checked"
                )}
              >
                {task.completed && <Check />}
              </button>

              <span
                className={cn(
                  "tm__label",
                  task.completed && "tm__label--done"
                )}
              >
                {task.title}
              </span>

              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="삭제"
                className="tm__delete"
                onClick={() => removeTask(task.id)}
              >
                <Trash2 />
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
