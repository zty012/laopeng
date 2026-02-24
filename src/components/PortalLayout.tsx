import { Link, useLocation } from 'react-router-dom';
import { Globe, Newspaper, BookOpen, Microscope, MessageCircle } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const NAV = [
  { to: '/', label: '首页', icon: Globe, exact: true },
  { to: '/news', label: '新闻专栏', icon: Newspaper, exact: false },
  { to: '/poetry', label: '古诗文专栏', icon: BookOpen, exact: false },
  { to: '/interdisciplinary', label: '跨学科专栏', icon: Microscope, exact: false },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-2.5">
            <Globe className="size-5 text-primary" />
            <span className="font-bold text-base tracking-wide">真 · 老彭</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map(({ to, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + '/');
                  return (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link to={to}>
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
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/chat">
                  <MessageCircle />
                  <span>来聊聊天吧</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-10 items-center gap-2 px-4 border-b border-border">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
