import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const stageValidator = v.union(
  v.literal("idea"),
  v.literal("drafting"),
  v.literal("review"),
  v.literal("published"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("pipeline").collect();
    return items.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    stage: stageValidator,
    owner: v.optional(v.string()),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("pipeline", {
      title: args.title.trim(),
      stage: args.stage,
      owner: args.owner?.trim() || undefined,
      dueAt: args.dueAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("pipeline"),
    title: v.optional(v.string()),
    stage: v.optional(stageValidator),
    owner: v.optional(v.string()),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...changes } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };

    if (changes.title !== undefined) patch.title = changes.title.trim();
    if (changes.stage !== undefined) patch.stage = changes.stage;
    if (changes.owner !== undefined) patch.owner = changes.owner.trim() || undefined;
    if (changes.dueAt !== undefined) patch.dueAt = changes.dueAt;

    await ctx.db.patch(id, patch);
  },
});
