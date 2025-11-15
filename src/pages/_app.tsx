import AppSidebar from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BookSearchService } from "@/lib/bookSearch";
import { Suspense, use } from "react";
import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SidebarProvider>
        <AppSidebar />
        <main className="h-screen w-[calc(100vw-var(--sidebar-width))] flex-1">
          {/*<SidebarTrigger />*/}
          <Suspense fallback={<div>正在加载数据…</div>}>
            <Inner />
          </Suspense>
        </main>
      </SidebarProvider>
    </ThemeProvider>
  );
}

const loadPagesPromise = BookSearchService.loadPages();
function Inner() {
  use(loadPagesPromise);
  return <Outlet />;
}
