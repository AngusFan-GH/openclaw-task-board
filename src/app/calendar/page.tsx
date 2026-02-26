"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import styles from "../page.module.css";
import { NavTabs } from "../components/NavTabs";
import { useI18n } from "../i18n/I18nProvider";

export default function CalendarPage() {
  const { locale, dict } = useI18n();
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
  const removeItem = useMutation("calendar:remove" as never);

  const deleteItem = async (itemId: string) => {
    if (!confirm(dict.calendarPage.confirmDelete)) return;
    await removeItem({ id: itemId as never });
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>{dict.calendarPage.title}</h1>
        <p>{dict.calendarPage.subtitle}</p>
      </section>
      <NavTabs />

      <section className={styles.filterBar}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.calendarPage.searchEvents}
          aria-label={dict.calendarPage.searchEvents}
        />
      </section>

      <section className={styles.board}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h2>{dict.calendarPage.upcoming}</h2>
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
                  <span>{dict.calendarPage.scheduledForLabel}: {new Date(item.scheduledFor).toLocaleString(locale)}</span>
                  <span>{dict.calendarPage.sourceLabel}: {item.source || dict.common.notAvailable}</span>
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
            {filteredItems.length === 0 && <div className={styles.empty}>{dict.calendarPage.noScheduledTasks}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
