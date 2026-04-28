"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Globe,
  Newspaper,
  BookOpen,
  Microscope,
  MessageCircle,
  ChevronRight,
  Book,
  LogOut,
  Home,
  Dices,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { notes } from "@/lib/notes";

const NAV = [
  { to: "/news", label: "新闻专栏", icon: Newspaper, exact: false },
  { to: "/poetry", label: "古诗文专栏", icon: BookOpen, exact: false },
  {
    to: "/interdisciplinary",
    label: "跨学科专栏",
    icon: Microscope,
    exact: false,
  },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "/";
  const router = useRouter();
  const [currentNoteTitle, setCurrentNoteTitle] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Logout failed");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    if (pathname.startsWith("/notes/")) {
      const encodedTitle = pathname.slice("/notes/".length);
      setCurrentNoteTitle(decodeURIComponent(encodedTitle));
    } else {
      setCurrentNoteTitle(null);
    }
  }, [pathname]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-2.5">
            <Globe className="size-5 text-primary" />
            <span className="font-bold text-base tracking-wide">真 · 老彭</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/">
                      <Home />
                      <span>首页</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/chat">
                      <MessageCircle />
                      <span>来聊聊天吧</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/book">
                      <Book />
                      <span>教材</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/draw">
                      <Dices />
                      <span>抽签</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>智能体</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map(({ to, label, icon: Icon, exact }) => {
                  const active = exact
                    ? pathname === to
                    : pathname === to || pathname.startsWith(to + "/");
                  return (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link href={to}>
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <span>笔记</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {notes.map((note) => {
                  const isActive =
                    pathname === `/notes/${encodeURIComponent(note.title)}` &&
                    currentNoteTitle === note.title;
                  return (
                    <SidebarMenuItem key={note.title}>
                      <SidebarMenuButton
                        onClick={() =>
                          router.push(
                            `/notes/${encodeURIComponent(note.title)}`,
                          )
                        }
                        isActive={isActive}
                      >
                        <ChevronRight className="size-3.5 opacity-50" />
                        <span className="truncate">{note.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut />
                <span>退出登录</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-10 items-center gap-2 px-4 border-b border-border">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
