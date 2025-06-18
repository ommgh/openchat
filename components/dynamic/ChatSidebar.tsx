import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button, buttonVariants } from "../ui/button";
import { Link, useNavigate, useParams } from "react-router";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ChatSidebar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const threads = useQuery(api.threads.get);
  const removeThread = useMutation(api.threads.remove);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "o"
      ) {
        e.preventDefault();
        document.getElementById("new-chat-button")?.click();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Sidebar variant="inset">
      {/* Header Section */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex items-center gap-2">
                <Sparkles className="size-10 mt-1" />
                <div className="text-xl font-bold">openchat.one</div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                id="new-chat-button"
                variant="default"
                className="w-full mt-2"
              >
                New Chat
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Scrollable Content Section */}
      <SidebarContent className="no-scrollbar">
        {threads === undefined && (
          <div className="px-3 text-muted-foreground">Loading threads...</div>
        )}

        <SidebarMenu>
          {threads?.map((thread) => (
            <SidebarMenuItem key={thread._id}>
              <div
                className={cn(
                  "cursor-pointer group/thread h-9 flex items-center px-2 py-1 rounded-md overflow-hidden w-full hover:bg-[#98CEDF]/25",
                  id === thread._id && "",
                )}
                onClick={() => {
                  if (id !== thread._id) {
                    navigate(`/chat/${thread._id}`);
                  }
                }}
              >
                <span className="truncate block">{thread.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden group-hover/thread:flex ml-auto h-7 w-7"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await removeThread({ threadId: thread._id });
                    if (id === thread._id) navigate(`/chat`);
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer Section */}
      <SidebarFooter>
        <Link
          to={{
            pathname: "/settings",
            search: id ? `?from=${encodeURIComponent(id)}` : "",
          }}
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Settings
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
