import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("calendar").collect();
    return items.sort((a, b) => a.scheduledFor - b.scheduledFor);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    scheduledFor: v.number(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("calendar", {
      title: args.title.trim(),
      description: args.description?.trim() || undefined,
      scheduledFor: args.scheduledFor,
      source: args.source?.trim() || undefined,
      createdAt: now,
    });
  },
});
