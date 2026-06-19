import { Dashboard } from "@/components/dashboard"
import { TaskManager } from "@/components/task-manager"

export default function Page() {
  return (
    <main className="app-main">
      <div className="app-shell">
        <Dashboard />
        <TaskManager />
      </div>
    </main>
  )
}
