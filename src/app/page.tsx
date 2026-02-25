"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import styles from "./page.module.css";
import { NavTabs } from "./components/NavTabs";

type TaskStatus = "todo" | "in_progress" | "done";
type Assignee = "me" | "you";

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: Assignee;
};

const statusColumns: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

const assigneeLabels: Record<Assignee, string> = {
  me: "Me",
  you: "You",
};

export default function Home() {
  const rawTasks = useQuery("tasks:list" as never);
  const tasks = useMemo(() => (rawTasks ?? []) as Task[], [rawTasks]);
  const createTask = useMutation("tasks:create" as never);
  const moveTask = useMutation("tasks:move" as never);
  const updateTask = useMutation("tasks:update" as never);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState<Assignee>("me");

  const grouped = useMemo(() => {
    return statusColumns.reduce<Record<TaskStatus, Task[]>>(
      (acc, column) => {
        acc[column.key] = tasks.filter((task) => task.status === column.key);
        return acc;
      },
      { todo: [], in_progress: [], done: [] },
    );
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
      assignee,
    });
    setTitle("");
    setDescription("");
    setAssignee("me");
  };

  const nextStatus = (status: TaskStatus): TaskStatus => {
    if (status === "todo") return "in_progress";
    if (status === "in_progress") return "done";
    return "todo";
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, taskId: string) => {
    event.dataTransfer.setData("text/plain", taskId);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = async (event: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    if (!taskId) return;
    await moveTask({ id: taskId as never, status });
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>Mission Control</h1>
        <p>Tasks, calendar, and memory in one place.</p>
      </section>
      <NavTabs />

      <form onSubmit={onCreateTask} className={styles.createForm}>
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
        <button type="submit">Add Task</button>
      </form>

      <section className={styles.board}>
        {statusColumns.map((column) => (
          <div
            key={column.key}
            className={styles.column}
            onDrop={(event) => onDrop(event, column.key)}
            onDragOver={onDragOver}
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
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={() => moveTask({ id: task._id as never, status: nextStatus(task.status) })}
                    >
                      Move to {statusColumns.find((s) => s.key === nextStatus(task.status))?.label}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateTask({
                          id: task._id as never,
                          assignee: task.assignee === "me" ? "you" : "me",
                        })
                      }
                    >
                      Assign to {task.assignee === "me" ? "You" : "Me"}
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
    </main>
  );
}
