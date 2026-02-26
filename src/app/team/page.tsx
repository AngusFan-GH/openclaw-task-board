"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import styles from "../page.module.css";
import { NavTabs } from "../components/NavTabs";
import { Id } from "../../../convex/_generated/dataModel";

type TeamStatus = "active" | "away";

const statusLabels: Record<TeamStatus, string> = {
  active: "Active",
  away: "Away",
};

type TeamMember = {
  _id: Id<"team">;
  name: string;
  role: string;
  focus?: string;
  status: TeamStatus;
  notes?: string;
};

export default function TeamPage() {
  const rawMembers = useQuery("team:list" as never);
  const createMember = useMutation("team:create" as never);
  const updateMember = useMutation("team:update" as never);

  const [query, setQuery] = useState("");
  const members = useMemo(() => (rawMembers ?? []) as TeamMember[], [rawMembers]);
  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((member) =>
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      (member.focus ?? "").toLowerCase().includes(q)
    );
  }, [members, query]);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [focus, setFocus] = useState("");
  const [status, setStatus] = useState<TeamStatus>("active");
  const [notes, setNotes] = useState("");

  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editFocus, setEditFocus] = useState("");
  const [editStatus, setEditStatus] = useState<TeamStatus>("active");
  const [editNotes, setEditNotes] = useState("");

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !role.trim()) return;
    await createMember({
      name: name.trim(),
      role: role.trim(),
      focus: focus.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
    });
    setName("");
    setRole("");
    setFocus("");
    setStatus("active");
    setNotes("");
  };

  const openEdit = (member: TeamMember) => {
    setEditing(member);
    setEditName(member.name);
    setEditRole(member.role);
    setEditFocus(member.focus ?? "");
    setEditStatus(member.status);
    setEditNotes(member.notes ?? "");
  };

  const saveEdit = async () => {
    if (!editing || !editName.trim() || !editRole.trim()) return;
    await updateMember({
      id: editing._id as never,
      name: editName.trim(),
      role: editRole.trim(),
      focus: editFocus.trim() || undefined,
      status: editStatus,
      notes: editNotes.trim() || undefined,
    });
    setEditing(null);
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>Team</h1>
        <p>Current owners, roles, and availability.</p>
      </section>
      <NavTabs />

      <form onSubmit={onCreate} className={styles.createForm}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search team" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" required />
        <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Focus area" />
        <select value={status} onChange={(e) => setStatus(e.target.value as TeamStatus)}>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button type="submit">Add Member</button>
      </form>

      <section className={styles.board}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h2>Roster</h2>
            <span>{members.length}</span>
          </div>
          <div className={styles.taskList}>
            {filteredMembers.map((member) => (
              <article key={member._id} className={styles.taskCard}>
                <div className={styles.taskTopRow}>
                  <h3>{member.name}</h3>
                  <span className={styles.assignee}>{statusLabels[member.status as TeamStatus]}</span>
                </div>
                <p>{member.role}{member.focus ? ` · ${member.focus}` : ""}</p>
                <div className={styles.actions}>
                  <span>{member.notes || "No notes"}</span>
                  <button type="button" onClick={() => openEdit(member)}>Edit</button>
                </div>
              </article>
            ))}
            {filteredMembers.length === 0 && <div className={styles.empty}>No team members yet.</div>}
          </div>
        </div>
      </section>

      {editing && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Edit Member</h3>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} />
            <input value={editRole} onChange={(e) => setEditRole(e.target.value)} />
            <input value={editFocus} onChange={(e) => setEditFocus(e.target.value)} />
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as TeamStatus)}>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notes" />
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
