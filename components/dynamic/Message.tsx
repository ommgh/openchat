import { memo, useState } from "react";
import MarkdownRenderer from "@/components/dynamic/MemoizedMarkdown";
import { cn } from "@/lib/utils";
import { UIMessage } from "ai";
import equal from "fast-deep-equal";
import MessageControls from "@/components/dynamic/MessageControls";
import { UseChatHelpers } from "@ai-sdk/react";
import { Id } from "@/convex/_generated/dataModel";
import MessageEditor from "@/components/dynamic/MessageEditor";
import MessageReasoning from "@/components/dynamic/MessageReasoning";

function PureMessage({
  threadId,
  message,
  setMessages,
  isStreaming,
  registerRef,
  stop,
}: {
  threadId: Id<"threads">;
  message: UIMessage & { _id: Id<"messages"> };
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  isStreaming: boolean;
  registerRef: (id: string, ref: HTMLDivElement | null) => void;
  stop: UseChatHelpers["stop"];
}) {
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <div
      role="article"
      className={cn(
        "flex flex-col w-full max-w-3xl mx-auto",
        message.role === "user" ? "items-end" : "items-start",
      )}
    >
      {message.parts.map((part, index) => {
        const { type } = part;
        const key = `message-${message._id}-part-${index}`;

        if (type === "reasoning") {
          return (
            <MessageReasoning
              key={key}
              reasoning={part.reasoning}
              id={message._id}
            />
          );
        }

        if (type === "text") {
          return message.role === "user" ? (
            <div
              key={key}
              className="relative group px-4 py-3 rounded-xl bg-[#98CEDF]/25 border border-secondary-foreground/2"
              ref={(el) => registerRef(message._id, el)}
            >
              {mode === "edit" && (
                <MessageEditor
                  threadId={threadId}
                  message={message}
                  content={part.text}
                  setMessages={setMessages}
                  setMode={setMode}
                  stop={stop}
                />
              )}
              {mode === "view" && <p>{part.text}</p>}

              {mode === "view" && (
                <MessageControls
                  threadId={threadId}
                  content={part.text}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  stop={stop}
                />
              )}
            </div>
          ) : (
            <div
              key={key}
              className="group flex flex-col gap-2 w-full max-w-3xl mx-auto"
            >
              <MarkdownRenderer content={part.text} id={message._id} />
              {!isStreaming && (
                <MessageControls
                  threadId={threadId}
                  content={part.text}
                  message={message}
                  setMessages={setMessages}
                  stop={stop}
                />
              )}
            </div>
          );
        }
      })}
    </div>
  );
}

const PreviewMessage = memo(PureMessage, (prevProps, nextProps) => {
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;
  if (prevProps.message._id !== nextProps.message._id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
  return true;
});

PreviewMessage.displayName = "PreviewMessage";

export default PreviewMessage;
