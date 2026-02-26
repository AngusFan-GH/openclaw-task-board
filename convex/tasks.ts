import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_SCHEDULE_OFFSET = 60 * 60 * 1000;

const statusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("blocked"),
  v.literal("waiting"),
  v.literal("done"),
  v.literal("failed"),
  v.literal("canceled"),
);

const assigneeValidator = v.union(v.literal("me"), v.literal("you"));
const sourceValidator = v.union(
  v.literal("user"),
  v.literal("agent"),
  v.literal("subagent"),
  v.literal("cron"),
);

async function maybeCreateMemory(ctx: any, task: any, overrides: { content?: string } = {}) {
  if (task.memoryId || task.status !== "done") return task.memoryId;
  const content = overrides.content || `Task completed. Last action: ${task.lastAction ?? "n/a"}. Status: ${task.status}.`;
  const memoryId = await ctx.db.insert("memories", {
    title: `Task completed: ${task.title}`,
    content,
    tags: ["task", "auto"],
    createdAt: Date.now(),
  });
  await ctx.db.patch(task._id, { memoryId });
  return memoryId;
}

const taskTypeValidator = v.union(
  v.literal("coding"),
  v.literal("browsing"),
  v.literal("message"),
  v.literal("ops"),
  v.literal("analysis"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    return tasks.sort((a, b) => {
      if (a.status === b.status) {
        return b.updatedAt - a.updatedAt;
      }
      return a.createdAt - b.createdAt;
    });
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(statusValidator),
    assignee: v.optional(assigneeValidator),
    source: v.optional(sourceValidator),
    taskType: v.optional(taskTypeValidator),
    lastAction: v.optional(v.string()),
    lastActionAt: v.optional(v.number()),
    relatedId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const calendarId = await ctx.db.insert("calendar", {
      title: args.title.trim(),
      description: args.description?.trim() || undefined,
      scheduledFor: now + DEFAULT_SCHEDULE_OFFSET,
      source: "auto",
      createdAt: now,
    });
    const taskId = await ctx.db.insert("tasks", {
      title: args.title.trim(),
      description: args.description?.trim() || undefined,
      source: args.source ?? "user",
      taskType: args.taskType ?? "coding",
      status: args.status ?? "todo",
      lastAction: args.lastAction?.trim() || "created",
      lastActionAt: args.lastActionAt ?? now,
      relatedId: args.relatedId?.trim() || undefined,
      errorMessage: args.errorMessage?.trim() || undefined,
      calendarId,
      assignee: args.assignee ?? "you",
      createdAt: now,
      updatedAt: now,
    });
    return taskId;
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(statusValidator),
    assignee: v.optional(assigneeValidator),
    source: v.optional(sourceValidator),
    taskType: v.optional(taskTypeValidator),
    lastAction: v.optional(v.string()),
    lastActionAt: v.optional(v.number()),
    relatedId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...changes } = args;
    const patch: {
      title?: string;
      description?: string | undefined;
      status?:
        | "todo"
        | "in_progress"
        | "blocked"
        | "waiting"
        | "done"
        | "failed"
        | "canceled";
      assignee?: "me" | "you";
      source?: "user" | "agent" | "subagent" | "cron";
      taskType?: "coding" | "browsing" | "message" | "ops" | "analysis";
      lastAction?: string | undefined;
      lastActionAt?: number | undefined;
      relatedId?: string | undefined;
      errorMessage?: string | undefined;
      updatedAt: number;
    } = { updatedAt: Date.now() };

    if (changes.title !== undefined) {
      patch.title = changes.title.trim();
    }
    if (changes.description !== undefined) {
      patch.description = changes.description.trim() || undefined;
    }
    if (changes.status !== undefined) {
      patch.status = changes.status;
    }
    if (changes.assignee !== undefined) {
      patch.assignee = changes.assignee;
    }
    if (changes.source !== undefined) {
      patch.source = changes.source;
    }
    if (changes.taskType !== undefined) {
      patch.taskType = changes.taskType;
    }
    if (changes.lastAction !== undefined) {
      patch.lastAction = changes.lastAction.trim() || undefined;
    }
    if (changes.lastActionAt !== undefined) {
      patch.lastActionAt = changes.lastActionAt;
    }
    if (changes.relatedId !== undefined) {
      patch.relatedId = changes.relatedId.trim() || undefined;
    }
    if (changes.errorMessage !== undefined) {
      patch.errorMessage = changes.errorMessage.trim() || undefined;
    }

    await ctx.db.patch(id, patch);
    if (changes.status === "done") {
      const task = await ctx.db.get(id);
      if (task) {
        await maybeCreateMemory(ctx, task);
      }
    }
  },
});

export const move = mutation({
  args: {
    id: v.id("tasks"),
    status: statusValidator,
    lastAction: v.optional(v.string()),
    relatedId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: args.status,
      lastAction: args.lastAction?.trim() || `status:${args.status}`,
      lastActionAt: now,
      relatedId: args.relatedId?.trim() || undefined,
      errorMessage: args.errorMessage?.trim() || undefined,
      updatedAt: now,
    });
    if (args.status === "done") {
      const task = await ctx.db.get(args.id);
      if (task) {
        await maybeCreateMemory(ctx, task);
      }
    }
  },
});

export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
