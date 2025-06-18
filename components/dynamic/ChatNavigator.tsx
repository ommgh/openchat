import { memo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- CONVEX: Import hooks, API, and ID type
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface MessageNavigatorProps {
  threadId: Id<"threads"> | undefined; // Use Convex ID type, allow undefined
  scrollToMessage: (id: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

function PureChatNavigator({
  threadId,
  scrollToMessage,
  isVisible,
  onClose,
}: MessageNavigatorProps) {
  // --- CONVEX: Use the `useQuery` hook.
  // It will only run the query if `threadId` is defined.
  // Otherwise, it skips the query and returns `undefined`.
  const messageSummaries = useQuery(
    api.messageSummaries.get,
    threadId ? { threadId } : "skip",
  );

  return (
    <>
      {isVisible && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed right-0 top-0 backdrop-blur-md bg-[#182B43]/25 h-full w-80 border-l z-50 transform transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4">
            <h3 className="text-sm font-medium">Chat Navigator</h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Close navigator"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden p-2">
            <ul className="flex flex-col gap-2 p-4 prose prose-sm dark:prose-invert list-disc pl-5 h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/30 scrollbar-thumb-rounded-full">
              {/* Add a loading state for a better user experience */}
              {messageSummaries === undefined && <li>Loading...</li>}

              {messageSummaries?.map((summary) => (
                <li
                  // --- CONVEX: Use `summary._id` for the key
                  key={summary._id}
                  onClick={() => {
                    // --- CONVEX: `summary.messageId` is the correct field
                    scrollToMessage(summary.messageId);
                    onClose(); // Close navigator on click
                  }}
                  className="cursor-pointer hover:text-foreground transition-colors"
                >
                  {summary.content.slice(0, 100)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}

export default memo(PureChatNavigator, (prevProps, nextProps) => {
  return (
    prevProps.threadId === nextProps.threadId &&
    prevProps.isVisible === nextProps.isVisible
  );
});
