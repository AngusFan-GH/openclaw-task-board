"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavTabs.module.css";
import { useI18n } from "../i18n/I18nProvider";

export function NavTabs() {
  const pathname = usePathname();
  const { dict } = useI18n();
  const tabs = [
    { href: "/", label: dict.nav.tasks },
    { href: "/calendar", label: dict.nav.calendar },
    { href: "/memory", label: dict.nav.memory },
    { href: "/pipeline", label: dict.nav.pipeline },
    { href: "/team", label: dict.nav.team },
    { href: "/office", label: dict.nav.office },
  ];
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
