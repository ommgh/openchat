import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ChatSidebar from "@/components/dynamic/ChatSidebar";
import { Outlet } from "react-router";

export default function ChatLayout() {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 bg-white/5 rounded-t-lg">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 mt-2 fixed bg-white/5 h-10 w-10 rounded-tl-xl" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-white/5">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
