"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Shield,
  Brain,
  MessageSquare,
  History,
  Settings,
  Code,
  BarChart3,
  FileText,
  Activity,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

interface AppSidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function AppSidebar({ onNavigate, currentPage }: AppSidebarProps) {
  const { signOut } = useAuth();

  const mainMenuItems = [
    {
      title: "Tableau de bord",
      icon: LayoutDashboard,
      page: "dashboard",
    },
    {
      title: "Smart Contracts",
      icon: Code,
      page: "smart-contracts",
    },
    {
      title: "Agents IA",
      icon: Brain,
      page: "ai-agents",
    },
    {
      title: "Assistant IA",
      icon: MessageSquare,
      page: "chatbot",
    },
    {
      title: "Historique",
      icon: History,
      page: "history",
    },
  ];

  const projectMenuItems = [
    {
      title: "Vue d'ensemble",
      icon: BarChart3,
      page: "project-overview",
    },
    {
      title: "Documentation",
      icon: FileText,
      page: "documentation",
    },
    {
      title: "Monitoring",
      icon: Activity,
      page: "monitoring",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Shield className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-lg font-bold text-green-800">AgriSure</h2>
            <p className="text-xs text-muted-foreground">
              Assurance Climatique IA
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.page}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.page)}
                    isActive={currentPage === item.page}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projet</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectMenuItems.map((item) => (
                <SidebarMenuItem key={item.page}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.page)}
                    isActive={currentPage === item.page}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Système</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onNavigate("settings")}>
                  <Settings className="h-4 w-4" />
                  <span>Paramètres</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={async () => {
                    await signOut();
                    // Optionally, redirect to login or landing page if needed
                  }}
                >
                  <span className="h-4 w-4 flex items-center justify-center">
                    <LogOut className="h-4 w-4 mr-1" />
                  </span>
                  <span>Déconnexion</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
