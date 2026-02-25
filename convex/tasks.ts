import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const statusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("done"),
);

const assigneeValidator = v.union(v.literal("me"), v.literal("you"));

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
    status: statusValidator,
    assignee: assigneeValidator,
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("tasks", {
      title: args.title.trim(),
      description: args.description?.trim() || undefined,
      status: args.status,
      assignee: args.assignee,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(statusValidator),
    assignee: v.optional(assigneeValidator),
  },
  handler: async (ctx, args) => {
    const { id, ...changes } = args;
    const patch: {
      title?: string;
      description?: string | undefined;
      status?: "todo" | "in_progress" | "done";
      assignee?: "me" | "you";
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

    await ctx.db.patch(id, patch);
  },
});

export const move = mutation({
  args: {
    id: v.id("tasks"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
