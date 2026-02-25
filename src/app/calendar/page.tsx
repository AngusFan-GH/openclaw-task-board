"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import styles from "../page.module.css";
import { NavTabs } from "../components/NavTabs";

export default function CalendarPage() {
  const rawItems = useQuery("calendar:list" as never);
  const items = useMemo(() => (rawItems ?? []) as any[], [rawItems]);
  const createItem = useMutation("calendar:create" as never);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [source, setSource] = useState("");

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !scheduledFor) return;
    await createItem({
      title: title.trim(),
      description: description.trim() || undefined,
      scheduledFor: new Date(scheduledFor).getTime(),
      source: source.trim() || undefined,
    });
    setTitle("");
    setDescription("");
    setScheduledFor("");
    setSource("");
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>Calendar</h1>
        <p>All scheduled tasks and cron jobs in one timeline.</p>
      </section>
      <NavTabs />

      <form onSubmit={onCreate} className={styles.createForm}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          required
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <input
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
          required
        />
        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Source (cron/manual)"
        />
        <button type="submit">Add Event</button>
      </form>

      <section className={styles.board}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h2>Upcoming</h2>
            <span>{items.length}</span>
          </div>
          <div className={styles.taskList}>
            {items.map((item) => (
              <article key={item._id} className={styles.taskCard}>
                <div className={styles.taskTopRow}>
                  <h3>{item.title}</h3>
                  {item.source && <span className={styles.assignee}>{item.source}</span>}
                </div>
                {item.description && <p>{item.description}</p>}
                <div className={styles.actions}>
                  <span>
                    {new Date(item.scheduledFor).toLocaleString()}
                  </span>
                </div>
              </article>
            ))}
            {items.length === 0 && <div className={styles.empty}>No scheduled tasks.</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
