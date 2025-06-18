import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// A helper function to verify user ownership of a thread.
// Throws an error if the user is not authenticated or does not own the thread.
const checkThreadOwnership = async (ctx: any, threadId: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated.");
  }
  const thread = await ctx.db.get(threadId);
  if (!thread || thread.userId !== identity.subject) {
    throw new Error("You do not have permission to access this thread.");
  }
};

// --- QUERY ---

/**
 * Fetches all message summaries for a given thread, if the user has access.
 */
export const get = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    // First, verify the user owns the thread.
    await checkThreadOwnership(ctx, args.threadId);

    // If ownership is verified, fetch the summaries using the index.
    const summaries = await ctx.db
      .query("messageSummaries")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();

    // Convex automatically sorts by creation time, which is usually desired.
    return summaries;
  },
});

// --- MUTATION ---

/**
 * Creates a new summary for a message.
 */
export const create = mutation({
  args: {
    threadId: v.id("threads"),
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Ensure the user owns the thread they're adding a summary to.
    await checkThreadOwnership(ctx, args.threadId);

    await ctx.db.insert("messageSummaries", {
      threadId: args.threadId,
      messageId: args.messageId,
      content: args.content,
    });
  },
});
