import { NavLink } from "react-router-dom"
import {
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  Warehouse,
} from "lucide-react"

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
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Painel", url: "/", icon: LayoutDashboard },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Estoque", url: "/estoque", icon: Warehouse },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-lg">
            🧸
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-extrabold text-foreground">Amarelinha</span>
            <span className="text-xs text-muted-foreground">Gestor</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary/15 font-semibold text-primary-foreground/90"
                          : ""
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
        Amarelinha Gestor v1.0
      </SidebarFooter>
    </Sidebar>
  )
}
