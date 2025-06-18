import { useCompletion } from "@ai-sdk/react";
import { useAPIKeyStore } from "@/dynamic/stores/APIKeyStore";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface MessageSummaryPayload {
  title: string;
  isTitle?: boolean;
  messageId: Id<"messages">;
  threadId: Id<"threads">;
}

export const useMessageSummary = () => {
  const getKey = useAPIKeyStore((state) => state.getKey);
  const updateThreadTitle = useMutation(api.threads.updateTitle);
  const createSummary = useMutation(api.messageSummaries.create);

  const { complete, isLoading } = useCompletion({
    api: "/api/completion",
    ...(getKey("google") && {
      headers: { "X-Google-API-Key": getKey("google")! },
    }),
    onFinish: async (prompt, completion) => {
      console.log("Completion finished:", completion);
    },
  });

  const processMessageSummary = async (payload: MessageSummaryPayload) => {
    try {
      const { title, isTitle, messageId, threadId } = payload;

      if (isTitle) {
        await updateThreadTitle({ threadId, title });
      }

      await createSummary({
        threadId,
        messageId,
        content: title,
      });

      toast.success("Message summary saved successfully");
    } catch (error) {
      console.error("Error updating thread or creating summary:", error);
      toast.error("Failed to save message summary");
    }
  };

  const generateSummary = async (
    prompt: string,
    messageId: Id<"messages">,
    threadId: Id<"threads">,
    isTitle: boolean = false,
  ) => {
    try {
      const completion = await complete(prompt);

      if (completion) {
        await processMessageSummary({
          title: completion,
          isTitle,
          messageId,
          threadId,
        });
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate message summary");
    }
  };

  return {
    generateSummary,
    isLoading,
  };
};
