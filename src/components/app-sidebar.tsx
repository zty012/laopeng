import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@/router";
import { Home } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
] as const;

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="text-xl">真·老彭</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex gap-2">
        <ModeToggle />
        <span className="text-sm opacity-50">初二20班 罐装知识小组</span>
      </SidebarFooter>
    </Sidebar>
  );
}
