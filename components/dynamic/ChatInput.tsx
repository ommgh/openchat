import { ChevronDown, Check, ArrowUpIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAutoResizeTextarea from "@/hooks/useAutoResizeTextArea";
import { UseChatHelpers } from "@ai-sdk/react";
import { useParams, useNavigate } from "react-router";
import { useAPIKeyStore } from "@/dynamic/stores/APIKeyStore";
import { useModelStore } from "@/dynamic/stores/ModelStore";
import { AI_MODELS, AIModel, getModelConfig } from "@/lib/models";
import KeyPrompt from "@/components/dynamic/KeyPrompt";
import { UIMessage } from "ai";
import { StopIcon } from "@/components/ui/icons";
import { useMessageSummary } from "@/dynamic/hooks/useMessageSummary";

// --- CONVEX: Import hooks, API, and ID type
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ChatInputProps {
  // `threadId` can be undefined when starting a new chat
  threadId: Id<"threads"> | undefined;
  input: UseChatHelpers["input"];
  status: UseChatHelpers["status"];
  setInput: UseChatHelpers["setInput"];
  append: UseChatHelpers["append"];
  stop: UseChatHelpers["stop"];
}

interface StopButtonProps {
  stop: UseChatHelpers["stop"];
}

interface SendButtonProps {
  onSubmit: () => void;
  disabled: boolean;
}

// This helper creates the message object for the `append` function.
const createUserMessage = (text: string): Omit<UIMessage, "id"> => ({
  role: "user",
  content: text,
  parts: [{ type: "text", text }],
});

function PureChatInput({
  threadId,
  input,
  status,
  setInput,
  append,
  stop,
}: ChatInputProps) {
  const canChat = useAPIKeyStore((state) => state.hasRequiredKeys());
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 200,
  });
  const navigate = useNavigate();
  const { id: paramId } = useParams(); // URL param can be different from prop `threadId`

  // --- CONVEX: Prepare mutations
  const createThread = useMutation(api.threads.create);
  const sendMessage = useMutation(api.messages.send);

  const isDisabled = useMemo(
    () => !input.trim() || status === "streaming" || status === "submitted",
    [input, status],
  );

  const { generateSummary, isLoading } = useMessageSummary();

  const handleSubmit = useCallback(async () => {
    const currentInput = (textareaRef.current?.value || input).trim();
    if (!currentInput || status === "streaming" || status === "submitted")
      return;

    // The message object for the Vercel AI SDK
    const userMessage = createUserMessage(currentInput);

    try {
      if (paramId && threadId) {
        // --- Scenario 1: We are in an existing chat ---
        const newMessageId = await sendMessage({
          threadId,
          content: currentInput,
          role: "user",
        });
        append(userMessage, { data: { messageId: newMessageId } });
        // Generate summary for this message
        generateSummary(currentInput, newMessageId, threadId);
      } else {
        // --- Scenario 2: This is the first message of a new chat ---
        const newThreadId = await createThread({
          title: "New Chat",
        });
        const newMessageId = await sendMessage({
          threadId: newThreadId,
          content: currentInput,
          role: "user",
        });
        append(userMessage, { data: { messageId: newMessageId } });
        // Generate a title for the new thread
        generateSummary(currentInput, newMessageId, newThreadId);
        // Navigate to the new chat's URL
        navigate(`/chat/${newThreadId}`);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally show a toast error
    } finally {
      setInput("");
      adjustHeight(true);
    }
  }, [
    input,
    status,
    setInput,
    adjustHeight,
    append,
    paramId,
    textareaRef,
    threadId,
    createThread,
    sendMessage,
    navigate,
  ]);

  if (!canChat) {
    return <KeyPrompt />;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustHeight();
  };

  return (
    <div className="bg-white/10 backdrop-blur-md flex -ml-5 mr-0 sm:mr-5 rounded-xl">
      <div className="p-2 w-full">
        <div className="relative">
          <div className="flex flex-col">
            <Textarea
              id="chat-input"
              value={input}
              placeholder="What can I do for you?"
              className={cn(
                "w-full px-4 py-3 border-none shadow-none dark:bg-transparent",
                "placeholder:text-muted-foreground resize-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/30",
                "scrollbar-thumb-rounded-full",
                "min-h-[72px]",
              )}
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              onChange={handleInputChange}
              aria-label="Chat message input"
              aria-describedby="chat-input-description"
            />
            <span id="chat-input-description" className="sr-only">
              Press Enter to send, Shift+Enter for new line
            </span>
            <div className="h-14 flex items-center px-2">
              <div className="flex items-center justify-between w-full">
                <ChatModelDropdown />
                {status === "streaming" ? (
                  <StopButton stop={stop} />
                ) : (
                  <SendButton onSubmit={handleSubmit} disabled={isDisabled} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ChatInput = memo(PureChatInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.status !== nextProps.status) return false;
  return true;
});

const PureChatModelDropdown = () => {
  const getKey = useAPIKeyStore((state) => state.getKey);
  const { selectedModel, setModel } = useModelStore();

  const isModelEnabled = useCallback(
    (model: AIModel) => {
      const modelConfig = getModelConfig(model);
      const apiKey = getKey(modelConfig.provider);
      return !!apiKey;
    },
    [getKey],
  );

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-1 h-8 pl-2 pr-2 text-xs rounded-md text-foreground hover:bg-primary/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
            aria-label={`Selected model: ${selectedModel}`}
          >
            <div className="flex items-center gap-1">
              {selectedModel}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn("min-w-[10rem]", "border-border", "bg-popover")}
        >
          {AI_MODELS.map((model) => {
            const isEnabled = isModelEnabled(model);
            return (
              <DropdownMenuItem
                key={model}
                onSelect={() => isEnabled && setModel(model)}
                disabled={!isEnabled}
                className={cn(
                  "flex items-center justify-between gap-2",
                  "cursor-pointer",
                )}
              >
                <span>{model}</span>
                {selectedModel === model && (
                  <Check
                    className="w-4 h-4 text-blue-500"
                    aria-label="Selected"
                  />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const ChatModelDropdown = memo(PureChatModelDropdown);

function PureStopButton({ stop }: StopButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={stop}
      aria-label="Stop generating response"
    >
      <StopIcon size={20} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

const PureSendButton = ({ onSubmit, disabled }: SendButtonProps) => {
  return (
    <Button
      onClick={onSubmit}
      variant="default"
      size="icon"
      disabled={disabled}
      aria-label="Send message"
    >
      <ArrowUpIcon size={18} />
    </Button>
  );
};

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  return prevProps.disabled === nextProps.disabled;
});

export default ChatInput;
