import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * A helper function to verify user ownership of a thread.
 * Throws an error if the user is not authenticated or does not own the thread.
 * @param ctx - The query or mutation context.
 * @param threadId - The ID of the thread to check.
 */
const checkThreadOwnership = async (ctx: any, threadId: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated.");
  }

  const thread = await ctx.db.get(threadId);
  if (!thread || thread.userId !== identity.subject) {
    throw new Error("You do not have permission to access this thread.");
  }

  return { identity, thread };
};

// --- QUERIES ---

/**
 * Fetches all messages for a given thread, but ONLY if the user owns the thread.
 */
export const get = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    // This will throw an error if the user doesn't have access,
    // which prevents any data from being returned.
    await checkThreadOwnership(ctx, args.threadId);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();

    return messages;
  },
});

// --- MUTATIONS ---

/**
 * Adds a new message to a thread and updates the thread's 'lastMessageAt'
 * timestamp, after verifying ownership.
 */
export const send = mutation({
  args: {
    threadId: v.id("threads"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
      v.literal("data"),
    ),
    content: v.string(),
    parts: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await checkThreadOwnership(ctx, args.threadId);
    const messageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      role: args.role,
      content: args.content,
      parts: args.parts,
    });
    await ctx.db.patch(args.threadId, { lastMessageAt: Date.now() });
    return messageId;
  },
});

/**
 * Deletes all messages in a thread from a certain point onwards, after verifying ownership.
 */
export const deleteTrailing = mutation({
  args: {
    threadId: v.id("threads"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await checkThreadOwnership(ctx, args.threadId);

    const messageToDeleteFrom = await ctx.db.get(args.messageId);
    if (
      !messageToDeleteFrom ||
      messageToDeleteFrom.threadId !== args.threadId
    ) {
      throw new Error("Message not found in this thread.");
    }

    const cutoffTime = messageToDeleteFrom._creationTime;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.gte(q.field("_creationTime"), cutoffTime))
      .collect();

    await Promise.all(messages.map((message) => ctx.db.delete(message._id)));
  },
});
