import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import APIKeyManager from "@/components/dynamic/APIKeyForm";
import Chat from "@/components/dynamic/Chat";
import { useAPIKeyStore } from "../stores/APIKeyStore";
import { useModelStore } from "../stores/ModelStore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function Home() {
  const navigate = useNavigate();
  const createThread = useMutation(api.threads.create);
  const [isCreating, setIsCreating] = useState(false);
  const [threadId, setThreadId] = useState<Id<"threads">>();
  const hasRequiredKeys = useAPIKeyStore((state) => state.hasRequiredKeys());

  const isAPIKeysHydrated = useAPIKeyStore.persist?.hasHydrated();
  const isModelStoreHydrated = useModelStore.persist?.hasHydrated();

  useEffect(() => {
    if (hasRequiredKeys && !isCreating && !threadId) {
      const createNewThread = async () => {
        setIsCreating(true);
        try {
          const newThreadId = await createThread({ title: "New Chat" });
          setThreadId(newThreadId);
          navigate(`/chat/${newThreadId}`, { replace: true });
        } catch (error) {
          console.error("Failed to create thread:", error);
        } finally {
          setIsCreating(false);
        }
      };
      createNewThread();
    }
  }, [hasRequiredKeys, isCreating, threadId, createThread, navigate]);

  if (!isAPIKeysHydrated || !isModelStoreHydrated) return null;

  if (!hasRequiredKeys) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full max-w-3xl pt-10 pb-44 mx-auto">
        <APIKeyManager />
      </div>
    );
  }

  // Show loading state while creating a new thread
  if (isCreating || !threadId) {
    return (
      <div className="flex items-center justify-center w-full h-dvh">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl flex mx-auto">
      <Chat threadId={threadId} initialMessages={[]} />
    </div>
  );
}
