"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavTabs.module.css";

const tabs = [
  { href: "/", label: "Tasks" },
  { href: "/calendar", label: "Calendar" },
  { href: "/memory", label: "Memory" },
  { href: "/pipeline", label: "Content Pipeline" },
  { href: "/team", label: "Team" },
  { href: "/office", label: "Office" },
];

export function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${active ? styles.active : ""}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
