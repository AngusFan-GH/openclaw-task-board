"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import styles from "../page.module.css";
import { NavTabs } from "../components/NavTabs";

export default function MemoryPage() {
  const rawItems = useQuery("memories:list" as never);
  const items = useMemo(() => (rawItems ?? []) as any[], [rawItems]);
  const createItem = useMutation("memories:create" as never);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await createItem({
      title: title.trim(),
      content: content.trim(),
      tags: tagList.length ? tagList : undefined,
    });
    setTitle("");
    setContent("");
    setTags("");
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>Memory</h1>
        <p>Searchable memory library for decisions and context.</p>
      </section>
      <NavTabs />

      <form onSubmit={onCreate} className={styles.createForm}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
        />
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Memory content"
          required
        />
        <button type="submit">Add Memory</button>
      </form>

      <section className={styles.board}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h2>Memories</h2>
            <span>{items.length}</span>
          </div>
          <div className={styles.taskList}>
            {items.map((item) => (
              <article key={item._id} className={styles.taskCard}>
                <div className={styles.taskTopRow}>
                  <h3>{item.title}</h3>
                  {item.tags?.length ? (
                    <span className={styles.assignee}>{item.tags.join(", ")}</span>
                  ) : null}
                </div>
                <p>{item.content}</p>
                <div className={styles.actions}>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </article>
            ))}
            {items.length === 0 && <div className={styles.empty}>No memories yet.</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
