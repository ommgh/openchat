import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy, RefreshCcw, SquarePen } from "lucide-react";
import { UIMessage } from "ai";
import { UseChatHelpers } from "@ai-sdk/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAPIKeyStore } from "@/dynamic/stores/APIKeyStore";

interface MessageControlsProps {
  threadId: Id<"threads">;
  message: UIMessage & { _id: Id<"messages"> };
  setMessages: UseChatHelpers["setMessages"];
  content: string;
  setMode?: Dispatch<SetStateAction<"view" | "edit">>;
  stop: UseChatHelpers["stop"];
}

export default function MessageControls({
  threadId,
  message,
  setMessages,
  content,
  setMode,
  stop,
}: MessageControlsProps) {
  const [copied, setCopied] = useState(false);
  const hasRequiredKeys = useAPIKeyStore((state) => state.hasRequiredKeys());
  const deleteTrailingMessages = useMutation(api.messages.deleteTrailing);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleRegenerate = async () => {
    stop();

    if (message.role === "user") {
      await deleteTrailingMessages({
        threadId: threadId as Id<"threads">,
        messageId: message.id as Id<"messages">,
      });

      setMessages((messages) => {
        const index = messages.findIndex((m) => m.id === message.id);
        return index !== -1 ? [...messages.slice(0, index + 1)] : messages;
      });
    } else {
      await deleteTrailingMessages({
        threadId: threadId as Id<"threads">,
        messageId: message.id as Id<"messages">,
      });
    }
  };

  return (
    <div
      className={cn(
        "opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex gap-1",
        {
          "absolute mt-5 right-2": message.role === "user",
        },
      )}
    >
      <Button variant="ghost" size="icon" onClick={handleCopy}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
      {setMode && hasRequiredKeys && (
        <Button variant="ghost" size="icon" onClick={() => setMode("edit")}>
          <SquarePen className="w-4 h-4" />
        </Button>
      )}
      {hasRequiredKeys && (
        <Button variant="ghost" size="icon" onClick={handleRegenerate}>
          <RefreshCcw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
