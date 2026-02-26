"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import styles from "../page.module.css";
import { NavTabs } from "../components/NavTabs";
import { useI18n } from "../i18n/I18nProvider";

export default function MemoryPage() {
  const { locale, dict } = useI18n();
  const rawItems = useQuery("memories:list" as never);
  const [query, setQuery] = useState("");
  const items = useMemo(() => (rawItems ?? []) as any[], [rawItems]);
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      (item.tags ?? []).join(",").toLowerCase().includes(q)
    );
  }, [items, query]);
  const removeItem = useMutation("memories:remove" as never);

  const deleteItem = async (itemId: string) => {
    if (!confirm(dict.memoryPage.confirmDelete)) return;
    await removeItem({ id: itemId as never });
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>{dict.memoryPage.title}</h1>
        <p>{dict.memoryPage.subtitle}</p>
      </section>
      <NavTabs />

      <section className={styles.filterBar}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.memoryPage.searchMemories}
          aria-label={dict.memoryPage.searchMemories}
        />
      </section>

      <section className={styles.board}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h2>{dict.memoryPage.memories}</h2>
            <span>{items.length}</span>
          </div>
          <div className={styles.taskList}>
            {filteredItems.map((item) => (
              <article key={item._id} className={styles.taskCard}>
                <div className={styles.taskTopRow}>
                  <h3>{item.title}</h3>
                  {item.tags?.length ? (
                    <span className={styles.assignee}>{item.tags.join(", ")}</span>
                  ) : null}
                </div>
                <p>{item.content}</p>
                <div className={styles.actions}>
                  <span>{dict.memoryPage.createdAtLabel}: {new Date(item.createdAt).toLocaleString(locale)}</span>
                  <button
                    type="button"
                    className={`${styles.secondaryButton} ${styles.rightActionButton}`}
                    onClick={() => deleteItem(item._id)}
                  >
                    {dict.common.delete}
                  </button>
                </div>
              </article>
            ))}
            {filteredItems.length === 0 && <div className={styles.empty}>{dict.memoryPage.noMemories}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
