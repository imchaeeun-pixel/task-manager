"use client"

import * as React from "react"
import {
  Check,
  ClipboardList,
  ListTodo,
  Pencil,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react"

import type { Task, TaskFilter } from "@/lib/types"
import { useTasks } from "@/hooks/use-tasks"
import { useNow } from "@/hooks/use-now"
import { cn } from "@/lib/utils"
import { formatDue, parseDateInput, toDateInputValue } from "@/lib/date"
import { matchesFilter } from "@/lib/filter"
import { matchesProject, projectNames } from "@/lib/project"
import { Button } from "@/components/ui/button"

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행중" },
  { value: "completed", label: "완료" },
]

interface TaskManagerProps {
  filter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
  projectFilter: string | null
  onProjectFilterChange: (project: string | null) => void
}

export function TaskManager({
  filter,
  onFilterChange,
  projectFilter,
  onProjectFilterChange,
}: TaskManagerProps) {
  const {
    tasks,
    hydrated,
    addTask,
    updateTask,
    toggleTask,
    removeTask,
    clearCompleted,
  } = useTasks()
  const [draft, setDraft] = React.useState("")
  const [due, setDue] = React.useState("")
  const [project, setProject] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editTitle, setEditTitle] = React.useState("")
  const [editDue, setEditDue] = React.useState("")
  const [editProject, setEditProject] = React.useState("")

  const total = tasks.length
  const completed = tasks.filter((task) => task.completed).length
  const remaining = total - completed
  const now = useNow()

  const knownProjects = projectNames(tasks)
  const visibleTasks = tasks.filter(
    (task) =>
      matchesFilter(task, filter, now) && matchesProject(task, projectFilter)
  )

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    addTask(draft, parseDateInput(due), project)
    setDraft("")
    setDue("")
    setProject("")
  }

  function startEdit(task: Task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDue(task.dueDate !== null ? toDateInputValue(task.dueDate) : "")
    setEditProject(task.project)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle("")
    setEditDue("")
    setEditProject("")
  }

  function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (editingId === null || !editTitle.trim()) {
      return
    }
    updateTask(editingId, {
      title: editTitle,
      dueDate: parseDateInput(editDue),
      project: editProject,
    })
    cancelEdit()
  }

  return (
    <div className="tm">
      <header className="tm__header">
        <div className="tm__logo">
          <ListTodo />
        </div>
        <div className="tm__heading">
          <h1 className="tm__title">할 일 관리</h1>
          <p className="tm__subtitle">
            {total === 0
              ? "오늘 할 일을 추가해 보세요"
              : `${remaining}개 남음 · 총 ${total}개`}
          </p>
        </div>
      </header>

      <datalist id="tm-projects">
        {knownProjects.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <form onSubmit={handleSubmit} className="tm__form">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="할 일을 입력하세요…"
          aria-label="새 할 일"
          className="tm__input"
        />
        <input
          value={project}
          onChange={(event) => setProject(event.target.value)}
          placeholder="프로젝트 (선택)"
          aria-label="프로젝트 (선택)"
          list="tm-projects"
          className="tm__project-input"
        />
        <input
          type="date"
          value={due}
          onChange={(event) => setDue(event.target.value)}
          aria-label="마감일 (선택)"
          className="tm__date"
        />
        <Button type="submit" size="lg" disabled={!draft.trim()}>
          <Plus />
          추가
        </Button>
      </form>

      <div className="tm__toolbar">
        <div className="tm__filters" role="tablist">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              className={cn(
                "tm__filter",
                filter === item.value && "tm__filter--active"
              )}
              onClick={() => onFilterChange(item.value)}
            >
              {item.label}
            </button>
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

      {(filter === "today" || filter === "overdue") && (
        <div className="tm__viewbar">
          <span>
            <strong>{filter === "today" ? "오늘 마감" : "지연"}</strong> 작업만
            표시 중
          </span>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => onFilterChange("all")}
          >
            전체 보기
          </Button>
        </div>
      )}

      {projectFilter !== null && (
        <div className="tm__viewbar">
          <span>
            프로젝트 <strong>{projectFilter}</strong> 작업만 표시 중
          </span>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => onProjectFilterChange(null)}
          >
            전체 보기
          </Button>
        </div>
      )}

      <ul className="tm__list">
        {!hydrated ? (
          <li className="tm__empty">불러오는 중…</li>
        ) : visibleTasks.length === 0 ? (
          <li className="tm__empty">
            <ClipboardList />
            {tasks.length === 0
              ? "아직 할 일이 없습니다. 위에서 추가해 보세요!"
              : "해당하는 할 일이 없습니다."}
          </li>
        ) : (
          visibleTasks.map((task) => {
            if (editingId === task.id) {
              return (
                <li key={task.id} className="tm__item tm__item--editing">
                  <form className="tm__edit" onSubmit={saveEdit}>
                    <input
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") cancelEdit()
                      }}
                      aria-label="할 일 수정"
                      className="tm__input tm__edit-title"
                      autoFocus
                    />
                    <input
                      value={editProject}
                      onChange={(event) => setEditProject(event.target.value)}
                      placeholder="프로젝트"
                      aria-label="프로젝트 수정"
                      list="tm-projects"
                      className="tm__project-input tm__edit-project"
                    />
                    <input
                      type="date"
                      value={editDue}
                      onChange={(event) => setEditDue(event.target.value)}
                      aria-label="마감일 수정"
                      className="tm__date tm__edit-date"
                    />
                    <div className="tm__edit-actions">
                      <Button
                        type="submit"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="저장"
                        disabled={!editTitle.trim()}
                      >
                        <Check />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="취소"
                        onClick={cancelEdit}
                      >
                        <X />
                      </Button>
                    </div>
                  </form>
                </li>
              )
            }

            const dueInfo =
              task.dueDate !== null && !task.completed && now > 0
                ? formatDue(task.dueDate, now)
                : null

            return (
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
                  onDoubleClick={() => startEdit(task)}
                  title="더블클릭하여 수정"
                >
                  {task.title}
                </span>

                {task.project && (
                  <button
                    type="button"
                    className="tm__tag"
                    onClick={() => onProjectFilterChange(task.project)}
                    title={`${task.project} 작업만 보기`}
                  >
                    <Tag />
                    {task.project}
                  </button>
                )}

                {dueInfo && (
                  <span className={`tm__due tm__due--${dueInfo.tone}`}>
                    {dueInfo.text}
                  </span>
                )}

                <div className="tm__actions">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="수정"
                    className="tm__action"
                    onClick={() => startEdit(task)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="삭제"
                    className="tm__action tm__action--danger"
                    onClick={() => removeTask(task.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            )
          })
        )}
      </ul>

      <p className="tm__hint">
        <kbd>d</kbd> 키로 다크 모드를 켜고 끌 수 있어요
      </p>
    </div>
  )
}
