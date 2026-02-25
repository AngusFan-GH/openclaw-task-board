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
