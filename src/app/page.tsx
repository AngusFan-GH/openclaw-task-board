"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import styles from "./page.module.css";
import { NavTabs } from "./components/NavTabs";
import { createTaskLogApi } from "./lib/taskLog";

type TaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "waiting"
  | "done"
  | "failed"
  | "canceled";
type Assignee = "me" | "you";
type TaskSource = "user" | "agent" | "subagent" | "cron";
type TaskType = "coding" | "browsing" | "message" | "ops" | "analysis";

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: Assignee;
  source: TaskSource;
  taskType: TaskType;
  lastAction?: string;
  lastActionAt?: number;
  relatedId?: string;
  errorMessage?: string;
  updatedAt: number;
};

const statusColumns: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "blocked", label: "Blocked" },
  { key: "waiting", label: "Waiting" },
  { key: "done", label: "Done" },
  { key: "failed", label: "Failed" },
  { key: "canceled", label: "Canceled" },
];

const assigneeLabels: Record<Assignee, string> = {
  me: "Me",
  you: "You",
};
const sourceLabels: Record<TaskSource, string> = {
  user: "User",
  agent: "Agent",
  subagent: "Subagent",
  cron: "Cron",
};
const typeLabels: Record<TaskType, string> = {
  coding: "Coding",
  browsing: "Browsing",
  message: "Message",
  ops: "Ops",
  analysis: "Analysis",
};

export default function Home() {
  const rawTasks = useQuery("tasks:list" as never);
  const tasks = useMemo(() => (rawTasks ?? []) as Task[], [rawTasks]);
  const createTask = useMutation("tasks:create" as never);
  const moveTask = useMutation("tasks:move" as never);
  const updateTask = useMutation("tasks:update" as never);
  const taskLog = useMemo(() => {
    const createTaskMutation = (args: {
      title: string;
      description?: string;
      status?: TaskStatus;
      assignee?: Assignee;
      source?: TaskSource;
      taskType?: TaskType;
      lastAction?: string;
      lastActionAt?: number;
      relatedId?: string;
      errorMessage?: string;
    }) => createTask(args as never);
    const updateTaskMutation = (args: {
      id: string;
      title?: string;
      description?: string;
      status?: TaskStatus;
      assignee?: Assignee;
      source?: TaskSource;
      taskType?: TaskType;
      lastAction?: string;
      lastActionAt?: number;
      relatedId?: string;
      errorMessage?: string;
    }) => updateTask(args as never);
    const moveTaskMutation = (args: {
      id: string;
      status: TaskStatus;
      lastAction?: string;
      relatedId?: string;
      errorMessage?: string;
    }) => moveTask(args as never);

    return createTaskLogApi(createTaskMutation, updateTaskMutation, moveTaskMutation);
  }, [createTask, moveTask, updateTask]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState<Assignee>("me");
  const [source, setSource] = useState<TaskSource>("user");
  const [taskType, setTaskType] = useState<TaskType>("coding");
  const [relatedId, setRelatedId] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAssignee, setEditAssignee] = useState<Assignee>("me");
  const [editStatus, setEditStatus] = useState<TaskStatus>("todo");
  const [editSource, setEditSource] = useState<TaskSource>("user");
  const [editTaskType, setEditTaskType] = useState<TaskType>("coding");
  const [editLastAction, setEditLastAction] = useState("");
  const [editRelatedId, setEditRelatedId] = useState("");
  const [editErrorMessage, setEditErrorMessage] = useState("");

  const [query, setQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | Assignee>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | TaskSource>("all");
  const [taskTypeFilter, setTaskTypeFilter] = useState<"all" | TaskType>("all");

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesAssignee = assigneeFilter === "all" || task.assignee === assigneeFilter;
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesSource = sourceFilter === "all" || task.source === sourceFilter;
      const matchesType = taskTypeFilter === "all" || task.taskType === taskTypeFilter;
      const matchesQuery = !q || task.title.toLowerCase().includes(q) || (task.description ?? "").toLowerCase().includes(q);
      return matchesAssignee && matchesStatus && matchesSource && matchesType && matchesQuery;
    });
  }, [tasks, query, assigneeFilter, statusFilter, sourceFilter, taskTypeFilter]);

  const grouped = useMemo(() => {
    return statusColumns.reduce<Record<TaskStatus, Task[]>>(
      (acc, column) => {
        acc[column.key] = filteredTasks.filter((task) => task.status === column.key);
        return acc;
      },
      {
        todo: [],
        in_progress: [],
        blocked: [],
        waiting: [],
        done: [],
        failed: [],
        canceled: [],
      },
    );
  }, [filteredTasks]);

  const runningProcesses = useMemo(() => {
    return tasks.filter((task) => task.status === "in_progress" && task.relatedId);
  }, [tasks]);

  const latestTaskUpdateAt = useMemo(() => {
    if (tasks.length === 0) return undefined;
    return Math.max(...tasks.map((t) => t.updatedAt ?? 0));
  }, [tasks]);

  const latestActionAt = useMemo(() => {
    const values = tasks.map((t) => t.lastActionAt ?? 0);
    const max = Math.max(0, ...values);
    return max || undefined;
  }, [tasks]);

  const onCreateTask = async (event: FormEvent) => {
    event.preventDefault();
    const cleanedTitle = title.trim();
    if (!cleanedTitle) {
      return;
    }
    await taskLog.logTask({
      title: cleanedTitle,
      description: description.trim() || undefined,
      status: "todo",
      assignee,
      source,
      taskType,
      relatedId: relatedId.trim() || undefined,
      lastAction: "created",
    });
    setTitle("");
    setDescription("");
    setAssignee("me");
    setSource("user");
    setTaskType("coding");
    setRelatedId("");
  };

  const nextStatus = (status: TaskStatus): TaskStatus => {
    if (status === "todo") return "in_progress";
    if (status === "in_progress") return "done";
    if (status === "blocked") return "in_progress";
    if (status === "waiting") return "in_progress";
    if (status === "done") return "todo";
    if (status === "failed") return "todo";
    return "todo";
  };

  const onDragStart = (event: React.DragEvent<HTMLElement>, taskId: string) => {
    event.dataTransfer.setData("text/plain", taskId);
    event.dataTransfer.effectAllowed = "move";
  };

  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  const onDrop = async (event: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    setDragOver(null);
    if (!taskId) return;
    await moveTask({ id: taskId as never, status });
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDragEnter = (status: TaskStatus) => setDragOver(status);
  const onDragLeave = () => setDragOver(null);

  const openEdit = (task: Task) => {
    setEditing(task);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditAssignee(task.assignee);
    setEditStatus(task.status);
    setEditSource(task.source);
    setEditTaskType(task.taskType);
    setEditLastAction(task.lastAction ?? "");
    setEditRelatedId(task.relatedId ?? "");
    setEditErrorMessage(task.errorMessage ?? "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    await taskLog.updateTaskLog({
      id: editing._id as never,
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      status: editStatus,
      assignee: editAssignee,
      source: editSource,
      taskType: editTaskType,
      lastAction: editLastAction.trim() || undefined,
      relatedId: editRelatedId.trim() || undefined,
      errorMessage: editErrorMessage.trim() || undefined,
      lastActionAt: Date.now(),
    });
    setEditing(null);
  };

  const formatTime = (value?: number) =>
    value ? new Date(value).toLocaleString() : "n/a";

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>Mission Control</h1>
        <p>Tasks, calendar, and memory in one place.</p>
      </section>
      <NavTabs />

      <form onSubmit={onCreateTask} className={styles.createForm}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks"
          aria-label="Search tasks"
        />
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value as "all" | Assignee)}
          aria-label="Filter assignee"
        >
          <option value="all">All</option>
          <option value="me">Assigned to Me</option>
          <option value="you">Assigned to You</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | TaskStatus)} aria-label="Filter status">
          <option value="all">All Statuses</option>
          {statusColumns.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as "all" | TaskSource)} aria-label="Filter source">
          <option value="all">All Sources</option>
          {Object.entries(sourceLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={taskTypeFilter} onChange={(e) => setTaskTypeFilter(e.target.value as "all" | TaskType)} aria-label="Filter type">
          <option value="all">All Types</option>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          aria-label="Task title"
          required
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          aria-label="Task description"
        />
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value as Assignee)}
          aria-label="Assignee"
        >
          <option value="me">Assign to Me</option>
          <option value="you">Assign to You</option>
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value as TaskSource)} aria-label="Task source">
          {Object.entries(sourceLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={taskType} onChange={(e) => setTaskType(e.target.value as TaskType)} aria-label="Task type">
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <input
          value={relatedId}
          onChange={(e) => setRelatedId(e.target.value)}
          placeholder="Related ID (optional)"
          aria-label="Related ID"
        />
        <button type="submit">Add Task</button>
      </form>

      <section className={styles.systemStatus}>
        <h2>System Status</h2>
        <p>Latest task update: {formatTime(latestTaskUpdateAt)}</p>
        <p>Latest action update: {formatTime(latestActionAt)}</p>
        <p>Running processes: {runningProcesses.length}</p>
        <div className={styles.processList}>
          {runningProcesses.length === 0 && <span className={styles.emptyInline}>No running process IDs found.</span>}
          {runningProcesses.map((task) => (
            <span key={task._id} className={styles.processItem}>
              {task.relatedId} ({task.title})
            </span>
          ))}
        </div>
      </section>

      <section className={styles.board}>
        {statusColumns.map((column) => (
          <div
            key={column.key}
            className={`${styles.column} ${dragOver === column.key ? styles.columnActive : ""}`}
            onDrop={(event) => onDrop(event, column.key)}
            onDragOver={onDragOver}
            onDragEnter={() => onDragEnter(column.key)}
            onDragLeave={onDragLeave}
          >
            <div className={styles.columnHeader}>
              <h2>{column.label}</h2>
              <span>{grouped[column.key].length}</span>
            </div>
            <div className={styles.taskList}>
              {grouped[column.key].map((task) => (
                <article
                  key={task._id}
                  className={styles.taskCard}
                  draggable
                  onDragStart={(event) => onDragStart(event, task._id)}
                >
                  <div className={styles.taskTopRow}>
                    <h3>{task.title}</h3>
                    <span className={styles.assignee}>{assigneeLabels[task.assignee]}</span>
                  </div>
                  {task.description && <p>{task.description}</p>}
                  <div className={styles.meta}>
                    <span>Source: {sourceLabels[task.source]}</span>
                    <span>Type: {typeLabels[task.taskType]}</span>
                    <span>Status: {task.status}</span>
                    <span>Last action: {task.lastAction ?? "n/a"}</span>
                    <span>Action at: {formatTime(task.lastActionAt)}</span>
                    <span>Related ID: {task.relatedId ?? "n/a"}</span>
                    <span className={task.errorMessage ? styles.errorText : ""}>
                      Error: {task.errorMessage ?? "none"}
                    </span>
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={() =>
                        taskLog.setTaskStatus({
                          id: task._id as never,
                          status: nextStatus(task.status),
                          lastAction: `moved_to:${nextStatus(task.status)}`,
                          relatedId: task.relatedId,
                          errorMessage: task.errorMessage,
                        })
                      }
                    >
                      Move to {statusColumns.find((s) => s.key === nextStatus(task.status))?.label}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        taskLog.updateTaskLog({
                          id: task._id as never,
                          assignee: task.assignee === "me" ? "you" : "me",
                          lastAction: "assignee_changed",
                          lastActionAt: Date.now(),
                        })
                      }
                    >
                      Assign to {task.assignee === "me" ? "You" : "Me"}
                    </button>
                    <button type="button" onClick={() => openEdit(task)}>
                      Edit
                    </button>
                  </div>
                </article>
              ))}
              {grouped[column.key].length === 0 && (
                <div className={styles.empty}>No tasks in this column.</div>
              )}
            </div>
          </div>
        ))}
      </section>

      {editing && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Edit Task</h3>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            <select value={editAssignee} onChange={(e) => setEditAssignee(e.target.value as Assignee)}>
              <option value="me">Me</option>
              <option value="you">You</option>
            </select>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as TaskStatus)}>
              {statusColumns.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <select value={editSource} onChange={(e) => setEditSource(e.target.value as TaskSource)}>
              {Object.entries(sourceLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select value={editTaskType} onChange={(e) => setEditTaskType(e.target.value as TaskType)}>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input
              value={editLastAction}
              onChange={(e) => setEditLastAction(e.target.value)}
              placeholder="Last action"
            />
            <input
              value={editRelatedId}
              onChange={(e) => setEditRelatedId(e.target.value)}
              placeholder="Related ID"
            />
            <input
              value={editErrorMessage}
              onChange={(e) => setEditErrorMessage(e.target.value)}
              placeholder="Error message"
            />
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setEditing(null)}>Cancel</button>
              <button type="button" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
