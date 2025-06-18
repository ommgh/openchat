import { memo } from "react";
import PreviewMessage from "./Message";
import { UIMessage } from "ai";
import { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import MessageLoading from "./MessageLoading";
import Error from "./Error";
import { Id } from "@/convex/_generated/dataModel";
type MessageWithId = UIMessage & { _id: Id<"messages"> };
function PureMessages({
  threadId,
  messages,
  status,
  setMessages,
  reload,
  error,
  stop,
  registerRef,
}: {
  threadId: Id<"threads">;
  messages: MessageWithId[];
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  status: UseChatHelpers["status"];
  error: UseChatHelpers["error"];
  stop: UseChatHelpers["stop"];
  registerRef: (id: string, ref: HTMLDivElement | null) => void;
}) {
  return (
    <section className="flex flex-col w-full space-y-10 max-w-3xl mx-auto">
      {messages.map((message, index) => (
        <PreviewMessage
          key={message._id}
          threadId={threadId}
          message={message}
          isStreaming={status === "streaming" && messages.length - 1 === index}
          setMessages={setMessages}
          reload={reload}
          registerRef={registerRef}
          stop={stop}
        />
      ))}
      {status === "submitted" && <MessageLoading />}
      {error && <Error message={error.message} />}
    </section>
  );
}

const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.error !== nextProps.error) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  return true;
});

Messages.displayName = "Messages";

export default Messages;
