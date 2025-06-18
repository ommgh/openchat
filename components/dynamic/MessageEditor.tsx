import { UseChatHelpers, useCompletion } from "@ai-sdk/react";
import { useState, Dispatch, SetStateAction } from "react";
import { UIMessage } from "ai";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAPIKeyStore } from "@/dynamic/stores/APIKeyStore";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function MessageEditor({
  threadId,
  message,
  content,
  setMessages,
  setMode,
  stop,
}: {
  threadId: Id<"threads">;
  message: UIMessage & { _id: Id<"messages"> };
  content: string;
  setMessages: UseChatHelpers["setMessages"];
  setMode: Dispatch<SetStateAction<"view" | "edit">>;
  stop: UseChatHelpers["stop"];
}) {
  const [draftContent, setDraftContent] = useState(content);
  const getKey = useAPIKeyStore((state) => state.getKey);

  const deleteTrailing = useMutation(api.messages.deleteTrailing);
  const sendMessage = useMutation(api.messages.send);
  const createSummary = useMutation(api.messageSummaries.create);

  const { complete } = useCompletion({
    api: "/api/completion",
    ...(getKey("google") && {
      headers: { "X-Google-API-Key": getKey("google")! },
    }),
    onResponse: async (response) => {
      try {
        if (response.ok) {
          const payload = await response.json();
          await createSummary({
            threadId: payload.threadId,
            messageId: payload.messageId,
            content: payload.title,
          });
        } else {
          const payload = await response.json();
          toast.error(
            payload.error || "Failed to generate a summary for the message",
          );
        }
      } catch (error) {
        console.error("Error handling completion response:", error);
      }
    },
  });

  const handleSave = async () => {
    try {
      await deleteTrailing({ threadId, messageId: message._id });

      const newMessageId = await sendMessage({
        threadId,
        role: "user",
        content: draftContent,
        parts: [{ type: "text", text: draftContent }],
      });

      const updatedUIMessage: UIMessage = {
        id: newMessageId,
        role: "user",
        content: draftContent,
        createdAt: new Date(),
        parts: [{ type: "text", text: draftContent }],
      };

      setMessages((messages) => {
        const index = messages.findIndex((m) => m.id === message.id);
        return index !== -1
          ? [...messages.slice(0, index), updatedUIMessage]
          : [...messages, updatedUIMessage];
      });

      complete(draftContent, {
        body: {
          messageId: newMessageId,
          threadId,
        },
      });

      setMode("view");
      stop();
    } catch (error) {
      console.error("Failed to save message:", error);
      toast.error("Failed to save message. Please try again.");
    }
  };

  return (
    <div>
      <Textarea
        value={draftContent}
        onChange={(e) => setDraftContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
          }
        }}
        autoFocus
      />
      <div className="flex gap-2 mt-2">
        <Button onClick={handleSave}>Save & Submit</Button>
        <Button variant="outline" onClick={() => setMode("view")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
