import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// --- QUERIES ---

/**
 * Fetches all threads for the currently authenticated user,
 * sorted by the most recent message.
 */
export const get = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // If the user is not authenticated, return no threads.
      return [];
    }

    // Fetch threads for the logged-in user using the index.
    // `identity.subject` is the user's ID from the `users` table.
    const threads = await ctx.db
      .query("threads")
      .withIndex("by_user_lastMessageAt", (q) =>
        q.eq("userId", identity.subject),
      )
      .order("desc")
      .collect();

    return threads;
  },
});

// --- MUTATIONS ---

/**
 * Creates a new chat thread for the currently logged-in user.
 */
export const create = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to create a thread.");
    }

    // Insert the new thread, associating it with the user's ID.
    const threadId = await ctx.db.insert("threads", {
      title: args.title ?? "New Chat",
      lastMessageAt: Date.now(),
      userId: identity.subject, // Associate the thread with the user
    });

    return threadId;
  },
});

/**
 * Updates the title of a specific thread, checking for ownership.
 */
export const updateTitle = mutation({
  args: {
    threadId: v.id("threads"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const thread = await ctx.db.get(args.threadId);

    // Ensure the thread exists and the user owns it.
    if (!thread || thread.userId !== identity.subject) {
      throw new Error("You do not have permission to update this thread.");
    }

    await ctx.db.patch(args.threadId, { title: args.title });
  },
});

/**
 * Deletes a thread and all of its associated messages, checking for ownership.
 */
export const remove = mutation({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const thread = await ctx.db.get(args.threadId);

    // Ensure the thread exists and the user owns it.
    if (!thread || thread.userId !== identity.subject) {
      throw new Error("You do not have permission to delete this thread.");
    }

    // Find all messages associated with the thread to delete them.
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();

    // Delete all found messages in parallel.
    await Promise.all(messages.map((message) => ctx.db.delete(message._id)));

    // Finally, delete the thread itself.
    await ctx.db.delete(args.threadId);
  },
});

/**
 * Deletes ALL threads and messages for the current user.
 * This is a safer alternative to deleting all data in the tables.
 */
export const removeAllForUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userThreads = await ctx.db
      .query("threads")
      .withIndex("by_user_lastMessageAt", (q) =>
        q.eq("userId", identity.subject),
      )
      .collect();

    for (const thread of userThreads) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_threadId", (q) => q.eq("threadId", thread._id))
        .collect();
      await Promise.all(messages.map((message) => ctx.db.delete(message._id)));
      await ctx.db.delete(thread._id);
    }
  },
});
