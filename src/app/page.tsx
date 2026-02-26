"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import styles from "./page.module.css";
import { NavTabs } from "./components/NavTabs";
import { useI18n } from "./i18n/I18nProvider";

type TaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "waiting"
  | "done"
  | "failed"
  | "canceled";
type TaskSource = "user" | "agent" | "subagent" | "cron";
type TaskType = "coding" | "browsing" | "message" | "ops" | "analysis";

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  source: TaskSource;
  taskType: TaskType;
  lastAction?: string;
  lastActionAt?: number;
  relatedId?: string;
  errorMessage?: string;
  updatedAt: number;
};

const statusKeys: TaskStatus[] = ["todo", "in_progress", "blocked", "waiting", "done", "failed", "canceled"];

export default function Home() {
  const { locale, setLocale, dict } = useI18n();
  const statusColumns = useMemo(
    () => statusKeys.map((key) => ({ key, label: dict.statuses[key] })),
    [dict],
  );
  const sourceLabels: Record<TaskSource, string> = dict.sources;
  const typeLabels: Record<TaskType, string> = dict.taskTypes;

  const rawTasks = useQuery("tasks:list" as never);
  const tasks = useMemo(() => {
    const list = (rawTasks ?? []) as Task[];
    return list.map((task) => ({
      ...task,
      source: task.source ?? "agent",
      taskType: task.taskType ?? "ops",
    }));
  }, [rawTasks]);
  const createTask = useMutation("tasks:create" as never);
  const removeTask = useMutation("tasks:remove" as never);

  const deleteTask = async (taskId: string) => {
    if (!confirm(dict.taskBoard.confirmDelete)) return;
    await removeTask({ id: taskId as never });
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState<TaskSource>("user");
  const [taskType, setTaskType] = useState<TaskType>("coding");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | TaskSource>("all");
  const [taskTypeFilter, setTaskTypeFilter] = useState<"all" | TaskType>("all");

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesSource = sourceFilter === "all" || task.source === sourceFilter;
      const matchesType = taskTypeFilter === "all" || task.taskType === taskTypeFilter;
      const matchesQuery = !q || task.title.toLowerCase().includes(q) || (task.description ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesSource && matchesType && matchesQuery;
    });
  }, [tasks, query, statusFilter, sourceFilter, taskTypeFilter]);

  const grouped = useMemo(() => {
    return statusKeys.reduce<Record<TaskStatus, Task[]>>(
      (acc, key) => {
        acc[key] = filteredTasks.filter((task) => task.status === key);
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
    await createTask({
      title: cleanedTitle,
      description: description.trim() || undefined,
      status: "todo",
      source,
      taskType,
    });
    setTitle("");
    setDescription("");
    setSource("user");
    setTaskType("coding");
  };



  const formatTime = (value?: number) =>
    value ? new Date(value).toLocaleString(locale) : dict.common.notAvailable;

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div className={styles.headerTop}>
          <h1>{dict.taskBoard.title}</h1>
          <div className={styles.localeToggle}>
          </div>
        </div>
        <p>{dict.taskBoard.subtitle}</p>
      </section>
      <NavTabs />

      <section className={styles.filterBar}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.taskBoard.searchTasks}
          aria-label={dict.taskBoard.searchTasks}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | TaskStatus)} aria-label={dict.taskBoard.filterStatus}>
          <option value="all">{dict.taskBoard.allStatuses}</option>
          {statusColumns.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as "all" | TaskSource)} aria-label={dict.taskBoard.filterSource}>
          <option value="all">{dict.taskBoard.allSources}</option>
          {Object.entries(sourceLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={taskTypeFilter} onChange={(e) => setTaskTypeFilter(e.target.value as "all" | TaskType)} aria-label={dict.taskBoard.filterType}>
          <option value="all">{dict.taskBoard.allTypes}</option>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </section>

      <form onSubmit={onCreateTask} className={styles.createForm}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={dict.taskBoard.taskTitle}
          aria-label={dict.taskBoard.taskTitle}
          required
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={dict.taskBoard.taskDescription}
          aria-label={dict.taskBoard.taskDescription}
        />
        <select value={source} onChange={(e) => setSource(e.target.value as TaskSource)} aria-label={dict.taskBoard.filterSource}>
          {Object.entries(sourceLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={taskType} onChange={(e) => setTaskType(e.target.value as TaskType)} aria-label={dict.taskBoard.filterType}>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button type="submit">{dict.taskBoard.addTask}</button>
      </form>

      <section className={styles.board}>
        <details className={styles.systemStatus} open={false}>
          <summary>{dict.taskBoard.systemStatus}</summary>
          <div className={styles.systemStatusBody}>
            <p>{dict.taskBoard.latestTaskUpdate}: {formatTime(latestTaskUpdateAt)}</p>
            <p>{dict.taskBoard.latestActionUpdate}: {formatTime(latestActionAt)}</p>
            <p>{dict.taskBoard.runningProcesses}: {runningProcesses.length}</p>
            <div className={styles.processList}>
              {runningProcesses.length === 0 && <span className={styles.emptyInline}>{dict.taskBoard.noRunningProcessIds}</span>}
              {runningProcesses.map((task) => (
                <span key={task._id} className={styles.processItem}>
                  {task.relatedId} ({task.title})
                </span>
              ))}
            </div>
          </div>
        </details>
        {statusColumns.map((column) => (
          <div
            key={column.key}
            className={`${styles.column} ${dragOver === column.key ? styles.columnActive : ""}`}
            onDrop={(event) => onDrop(event, column.key)}
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
                >
                  <div className={styles.taskTopRow}>
                    <h3>{task.title}</h3>
                  </div>
                  {task.description && <p>{task.description}</p>}
                  <div className={styles.meta}>
                    <span>{dict.taskBoard.source}: {sourceLabels[task.source]}</span>
                    <span>{dict.taskBoard.type}: {typeLabels[task.taskType]}</span>
                    <span>{dict.taskBoard.status}: {dict.statuses[task.status]}</span>
                    <span>{dict.taskBoard.lastAction}: {task.lastAction ?? dict.common.notAvailable}</span>
                    <span>{dict.taskBoard.actionAt}: {formatTime(task.lastActionAt)}</span>
                    <span>{dict.taskBoard.relatedId}: {task.relatedId ?? dict.common.notAvailable}</span>
                    <span className={task.errorMessage ? styles.errorText : ""}>
                      {dict.taskBoard.error}: {task.errorMessage ?? dict.common.none}
                    </span>
                  </div>
                  <div className={styles.actions}>
                    <button type="button" onClick={() => deleteTask(task._id)}>
                      {dict.common.delete}
                    </button>
                  </div>
                </article>
              ))}
              {grouped[column.key].length === 0 && (
                <div className={styles.empty}>{dict.taskBoard.noTasksInColumn}</div>
              )}
            </div>
          </div>
        ))}
      </section>

            </select>
          </div>
        </div>
      )}
    </main>
  );
}
