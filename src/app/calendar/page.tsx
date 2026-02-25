"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import styles from "../page.module.css";
import { NavTabs } from "../components/NavTabs";

export default function CalendarPage() {
  const rawItems = useQuery("calendar:list" as never);
  const [query, setQuery] = useState("");
  const items = useMemo(() => (rawItems ?? []) as any[], [rawItems]);
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      (item.description ?? "").toLowerCase().includes(q) ||
      (item.source ?? "").toLowerCase().includes(q)
    );
  }, [items, query]);
  const createItem = useMutation("calendar:create" as never);
  const updateItem = useMutation("calendar:update" as never);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [source, setSource] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editScheduledFor, setEditScheduledFor] = useState("");
  const [editSource, setEditSource] = useState("");

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

  const openEdit = (item: any) => {
    setEditing(item);
    setEditTitle(item.title);
    setEditDescription(item.description ?? "");
    setEditScheduledFor(new Date(item.scheduledFor).toISOString().slice(0,16));
    setEditSource(item.source ?? "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    await updateItem({
      id: editing._id as never,
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      scheduledFor: new Date(editScheduledFor).getTime(),
      source: editSource.trim() || undefined,
    });
    setEditing(null);
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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events"
        />
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
            {filteredItems.map((item) => (
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
                  <button type="button" onClick={() => openEdit(item)}>Edit</button>
                </div>
              </article>
            ))}
            {filteredItems.length === 0 && <div className={styles.empty}>No scheduled tasks.</div>}
          </div>
        </div>
      </section>

      {editing && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Edit Event</h3>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            <input
              type="datetime-local"
              value={editScheduledFor}
              onChange={(e) => setEditScheduledFor(e.target.value)}
            />
            <input value={editSource} onChange={(e) => setEditSource(e.target.value)} />
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
