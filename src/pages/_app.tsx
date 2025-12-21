import AppSidebar from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { BookSearchService } from "@/lib/bookSearch";
import { ConversationProvider } from "@/lib/conversationContext";
import { Suspense, use, useState } from "react";
import { Outlet } from "react-router";

export default function AppLayout() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {showWelcome ? (
        <WelcomeOverlay onComplete={() => setShowWelcome(false)} />
      ) : (
        <ConversationProvider>
          <SidebarProvider>
            <AppSidebar />
            <main className="h-screen w-[calc(100vw-var(--sidebar-width))] flex-1">
              {/*<SidebarTrigger />*/}
              <Suspense fallback={<div>正在加载数据…</div>}>
                <Inner />
              </Suspense>
            </main>
          </SidebarProvider>
        </ConversationProvider>
      )}
    </ThemeProvider>
  );
}

const loadPagesPromise = BookSearchService.loadPages();
function Inner() {
  use(loadPagesPromise);
  return <Outlet />;
}
