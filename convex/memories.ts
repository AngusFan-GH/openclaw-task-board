import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("memories").collect();
    return items.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("memories", {
      title: args.title.trim(),
      content: args.content.trim(),
      tags: args.tags && args.tags.length ? args.tags : undefined,
      createdAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("memories"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...changes } = args;
    const patch: Record<string, any> = {};
    if (changes.title !== undefined) patch.title = changes.title.trim();
    if (changes.content !== undefined) patch.content = changes.content.trim();
    if (changes.tags !== undefined) patch.tags = changes.tags.length ? changes.tags : undefined;
    await ctx.db.patch(id, patch);
  },
});
