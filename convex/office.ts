import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const categoryValidator = v.union(
  v.literal("policy"),
  v.literal("tool"),
  v.literal("link"),
  v.literal("note"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("office").collect();
    return items.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    category: categoryValidator,
    detail: v.string(),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("office", {
      title: args.title.trim(),
      category: args.category,
      detail: args.detail.trim(),
      location: args.location?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("office"),
    title: v.optional(v.string()),
    category: v.optional(categoryValidator),
    detail: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...changes } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };

    if (changes.title !== undefined) patch.title = changes.title.trim();
    if (changes.category !== undefined) patch.category = changes.category;
    if (changes.detail !== undefined) patch.detail = changes.detail.trim();
    if (changes.location !== undefined) patch.location = changes.location.trim() || undefined;

    await ctx.db.patch(id, patch);
  },
});
