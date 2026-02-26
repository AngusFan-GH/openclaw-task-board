"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import styles from "../page.module.css";
import { NavTabs } from "../components/NavTabs";
import { Id } from "../../../convex/_generated/dataModel";

type Stage = "idea" | "drafting" | "review" | "published";

const stageLabels: Record<Stage, string> = {
  idea: "Idea",
  drafting: "Drafting",
  review: "Review",
  published: "Published",
};

type PipelineItem = {
  _id: Id<"pipeline">;
  title: string;
  stage: Stage;
  owner?: string;
  dueAt?: number;
};

export default function PipelinePage() {
  const rawItems = useQuery("pipeline:list" as never);
  const createItem = useMutation("pipeline:create" as never);
  const updateItem = useMutation("pipeline:update" as never);

  const [query, setQuery] = useState("");
  const items = useMemo(() => (rawItems ?? []) as PipelineItem[], [rawItems]);
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      (item.owner ?? "").toLowerCase().includes(q) ||
      item.stage.toLowerCase().includes(q)
    );
  }, [items, query]);

  const [title, setTitle] = useState("");
  const [stage, setStage] = useState<Stage>("idea");
  const [owner, setOwner] = useState("");
  const [dueAt, setDueAt] = useState("");

  const [editing, setEditing] = useState<PipelineItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStage, setEditStage] = useState<Stage>("idea");
  const [editOwner, setEditOwner] = useState("");
  const [editDueAt, setEditDueAt] = useState("");

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    await createItem({
      title: title.trim(),
      stage,
      owner: owner.trim() || undefined,
      dueAt: dueAt ? new Date(dueAt).getTime() : undefined,
    });
    setTitle("");
    setStage("idea");
    setOwner("");
    setDueAt("");
  };

  const openEdit = (item: PipelineItem) => {
    setEditing(item);
    setEditTitle(item.title);
    setEditStage(item.stage);
    setEditOwner(item.owner ?? "");
    setEditDueAt(item.dueAt ? new Date(item.dueAt).toISOString().slice(0, 16) : "");
  };

  const saveEdit = async () => {
    if (!editing || !editTitle.trim()) return;
    await updateItem({
      id: editing._id as never,
      title: editTitle.trim(),
      stage: editStage,
      owner: editOwner.trim() || undefined,
      dueAt: editDueAt ? new Date(editDueAt).getTime() : undefined,
    });
    setEditing(null);
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>Content Pipeline</h1>
        <p>Track content from idea to publish in one queue.</p>
      </section>
      <NavTabs />

      <form onSubmit={onCreate} className={styles.createForm}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search pipeline" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <select value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
          {Object.entries(stageLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Owner" />
        <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        <button type="submit">Add Item</button>
      </form>

      <section className={styles.board}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h2>Pipeline</h2>
            <span>{items.length}</span>
          </div>
          <div className={styles.taskList}>
            {filteredItems.map((item) => (
              <article key={item._id} className={styles.taskCard}>
                <div className={styles.taskTopRow}>
                  <h3>{item.title}</h3>
                  <span className={styles.assignee}>{stageLabels[item.stage as Stage]}</span>
                </div>
                <div className={styles.actions}>
                  <span>{item.owner || "Unassigned"}</span>
                  <span>{item.dueAt ? new Date(item.dueAt).toLocaleString() : "No deadline"}</span>
                  <button type="button" onClick={() => openEdit(item)}>Edit</button>
                </div>
              </article>
            ))}
            {filteredItems.length === 0 && <div className={styles.empty}>No pipeline items yet.</div>}
          </div>
        </div>
      </section>

      {editing && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Edit Pipeline Item</h3>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <select value={editStage} onChange={(e) => setEditStage(e.target.value as Stage)}>
              {Object.entries(stageLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input value={editOwner} onChange={(e) => setEditOwner(e.target.value)} placeholder="Owner" />
            <input type="datetime-local" value={editDueAt} onChange={(e) => setEditDueAt(e.target.value)} />
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
