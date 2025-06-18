import Chat from "@/components/dynamic/Chat";
import { useParams } from "react-router";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { UIMessage } from "ai";
import { Id } from "@/convex/_generated/dataModel";
type MessageWithId = UIMessage & { _id: Id<"messages"> };
interface ConvexMessage {
  _id: string;
  role: "user" | "assistant" | "system" | "data";
  parts?: any;
  content: string;
  _creationTime: number;
}

export default function Thread() {
  const { id } = useParams();
  const threadId = id as Id<"threads">;
  if (!id) throw new Error("Thread ID is required");

  const messages = useQuery(api.messages.get, {
    threadId,
  });

  const convertToUIMessages = (msgs: ConvexMessage[] = []): MessageWithId[] => {
    return msgs.map((message) => ({
      _id: message._id as Id<"messages">,
      id: message._id,
      role: message.role,
      parts: message.parts as UIMessage["parts"],
      content: message.content || "",
      createdAt: new Date(message._creationTime),
    }));
  };

  return (
    <Chat
      key={id}
      threadId={threadId}
      initialMessages={convertToUIMessages(messages)}
    />
  );
}
