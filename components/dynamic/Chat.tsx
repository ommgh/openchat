import { useChat } from "@ai-sdk/react";
import Messages from "./Messages";
import ChatInput from "./ChatInput";
import ChatNavigator from "./ChatNavigator";
import { UIMessage } from "ai";
import { useAPIKeyStore } from "@/dynamic/stores/APIKeyStore";
import { useModelStore } from "@/dynamic/stores/ModelStore";
import ThemeToggler from "@/components/ThemeToggler";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { MessageSquareMore } from "lucide-react";
import { useChatNavigator } from "@/dynamic/hooks/useChatNavigator";

// --- CONVEX: Import hooks, API, and ID type
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
type MessageWithId = UIMessage & { _id: Id<"messages"> };
interface ChatProps {
  // This component should always be rendered with a valid threadId
  threadId: Id<"threads">;
  initialMessages: MessageWithId[];
}

export default function Chat({ threadId, initialMessages }: ChatProps) {
  const { getKey } = useAPIKeyStore();
  const selectedModel = useModelStore((state) => state.selectedModel);
  const modelConfig = useModelStore((state) => state.getModelConfig());

  // --- CONVEX: Prepare the mutation to save the assistant's message
  const saveAssistantMessage = useMutation(api.messages.send);

  const {
    isNavigatorVisible,
    handleToggleNavigator,
    closeNavigator,
    registerRef,
    scrollToMessage,
  } = useChatNavigator();

  const {
    messages,
    input,
    status,
    setInput,
    setMessages,
    append,
    stop,
    reload,
    error,
  } = useChat({
    id: threadId,
    initialMessages,
    // --- CONVEX: Use the onFinish callback to persist the AI's response ---
    onFinish: async (message) => {
      // The `message` object contains the final, complete response from the AI
      try {
        await saveAssistantMessage({
          threadId: threadId,
          role: "assistant",
          content: message.content,
          parts: message.parts,
        });
      } catch (error) {
        console.error("Failed to save assistant's message:", error);
        // Optionally show a toast error to the user
      }
    },
    headers: {
      [modelConfig.headerKey]: getKey(modelConfig.provider) || "",
    },
    body: {
      model: selectedModel,
    },
  });

  return (
    <div className="relative w-full h-full flex flex-col">
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 px-8 mt-4 flex items-center justify-end gap-2 z-10">
        <Button
          onClick={handleToggleNavigator}
          variant="outline"
          size="icon"
          className="rounded-bl-xl"
          aria-label={
            isNavigatorVisible
              ? "Hide message navigator"
              : "Show message navigator"
          }
        >
          <MessageSquareMore className="h-5 w-5" />
        </Button>
        <ThemeToggler />
      </header>

      <main className="flex flex-col w-full max-w-3xl pt-20 pb-44 mx-auto flex-1">
        <Messages
          threadId={threadId}
          messages={messages as MessageWithId[]}
          status={status}
          setMessages={setMessages}
          reload={reload}
          error={error}
          registerRef={registerRef}
          stop={stop}
        />
      </main>

      <div className="fixed sm:bottom-1.5 sm:mb-0.5 bottom-0 mb-0 left-0 lg:left-72 right-0 flex justify-center bg-transparent pointer-events-none">
        <div className="w-full max-w-3xl pointer-events-auto">
          <ChatInput
            threadId={threadId}
            input={input}
            status={status}
            append={append}
            setInput={setInput}
            stop={stop}
          />
        </div>
      </div>

      <ChatNavigator
        threadId={threadId}
        scrollToMessage={scrollToMessage}
        isVisible={isNavigatorVisible}
        onClose={closeNavigator}
      />
    </div>
  );
}
