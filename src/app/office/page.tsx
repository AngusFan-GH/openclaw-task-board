"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import styles from "../page.module.css";
import { NavTabs } from "../components/NavTabs";
import { Id } from "../../../convex/_generated/dataModel";

type Category = "policy" | "tool" | "link" | "note";

const categoryLabels: Record<Category, string> = {
  policy: "Policy",
  tool: "Tool",
  link: "Link",
  note: "Note",
};

type OfficeItem = {
  _id: Id<"office">;
  title: string;
  category: Category;
  detail: string;
  location?: string;
};

export default function OfficePage() {
  const rawItems = useQuery("office:list" as never);
  const createItem = useMutation("office:create" as never);
  const updateItem = useMutation("office:update" as never);

  const [query, setQuery] = useState("");
  const items = useMemo(() => (rawItems ?? []) as OfficeItem[], [rawItems]);
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.detail.toLowerCase().includes(q) ||
      (item.location ?? "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("note");
  const [detail, setDetail] = useState("");
  const [location, setLocation] = useState("");

  const [editing, setEditing] = useState<OfficeItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("note");
  const [editDetail, setEditDetail] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !detail.trim()) return;
    await createItem({
      title: title.trim(),
      category,
      detail: detail.trim(),
      location: location.trim() || undefined,
    });
    setTitle("");
    setCategory("note");
    setDetail("");
    setLocation("");
  };

  const openEdit = (item: OfficeItem) => {
    setEditing(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditDetail(item.detail);
    setEditLocation(item.location ?? "");
  };

  const saveEdit = async () => {
    if (!editing || !editTitle.trim() || !editDetail.trim()) return;
    await updateItem({
      id: editing._id as never,
      title: editTitle.trim(),
      category: editCategory,
      detail: editDetail.trim(),
      location: editLocation.trim() || undefined,
    });
    setEditing(null);
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>Office</h1>
        <p>Quick access to shared references, tools, and working notes.</p>
      </section>
      <NavTabs />

      <form onSubmit={onCreate} className={styles.createForm}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search office" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Detail" required />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location / URL" />
        <button type="submit">Add Item</button>
      </form>

      <section className={styles.board}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h2>Office Board</h2>
            <span>{items.length}</span>
          </div>
          <div className={styles.taskList}>
            {filteredItems.map((item) => (
              <article key={item._id} className={styles.taskCard}>
                <div className={styles.taskTopRow}>
                  <h3>{item.title}</h3>
                  <span className={styles.assignee}>{categoryLabels[item.category as Category]}</span>
                </div>
                <p>{item.detail}</p>
                <div className={styles.actions}>
                  <span>{item.location || "General"}</span>
                  <button type="button" onClick={() => openEdit(item)}>Edit</button>
                </div>
              </article>
            ))}
            {filteredItems.length === 0 && <div className={styles.empty}>No office items yet.</div>}
          </div>
        </div>
      </section>

      {editing && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Edit Office Item</h3>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as Category)}>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input value={editDetail} onChange={(e) => setEditDetail(e.target.value)} />
            <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Location / URL" />
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
