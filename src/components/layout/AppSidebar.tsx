import { NavLink } from "react-router-dom"
import {
  BarChart3,
  Boxes,
  Briefcase,
  LayoutDashboard,
  Package,
  PackageSearch,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  Warehouse,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { storeSettings } from "@/config/storeSettings"

const navGroups = [
  {
    label: "Principal",
    items: [{ title: "Painel", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Compras",
    items: [
      { title: "Fornecedores", url: "/fornecedores", icon: Truck },
      { title: "Coleções", url: "/colecoes", icon: PackageSearch },
      { title: "Pedidos de Compra", url: "/pedidos-compra", icon: ShoppingBag },
      { title: "Recebimento", url: "/recebimento", icon: Boxes },
    ],
  },
  {
    label: "Operação",
    items: [
      { title: "Produtos", url: "/produtos", icon: Package },
      { title: "Estoque", url: "/estoque", icon: Warehouse },
    ],
  },
  {
    label: "Vendas",
    items: [
      { title: "Clientes", url: "/clientes", icon: Users },
      { title: "Malinha Amarelinha", url: "/malinha-amarelinha", icon: Briefcase },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
      { title: "Configurações", url: "/configuracoes", icon: Settings },
    ],
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-base">
            {storeSettings.logoEmoji}
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-extrabold text-foreground">{storeSettings.nomeCurto}</span>
            <span className="text-xs text-muted-foreground">Gestor</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
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
        ))}
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
        {storeSettings.nomeExibicao} {storeSettings.versao}
      </SidebarFooter>
    </Sidebar>
  )
}
