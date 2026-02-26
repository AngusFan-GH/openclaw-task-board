import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const statusValidator = v.union(v.literal("active"), v.literal("away"));

export const list = query({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query("team").collect();
    return members.sort((a, b) => {
      if (a.status === b.status) {
        return b.updatedAt - a.updatedAt;
      }
      return a.status === "active" ? -1 : 1;
    });
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    focus: v.optional(v.string()),
    status: statusValidator,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("team", {
      name: args.name.trim(),
      role: args.role.trim(),
      focus: args.focus?.trim() || undefined,
      status: args.status,
      notes: args.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("team"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    focus: v.optional(v.string()),
    status: v.optional(statusValidator),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...changes } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };

    if (changes.name !== undefined) patch.name = changes.name.trim();
    if (changes.role !== undefined) patch.role = changes.role.trim();
    if (changes.focus !== undefined) patch.focus = changes.focus.trim() || undefined;
    if (changes.status !== undefined) patch.status = changes.status;
    if (changes.notes !== undefined) patch.notes = changes.notes.trim() || undefined;

    await ctx.db.patch(id, patch);
  },
});
