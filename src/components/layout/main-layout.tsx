"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { DashboardPage } from "../pages/dashboard-page"
import { SmartContractsPage } from "../pages/smart-contracts-page"
import { AIAgentsPage } from "../pages/ai-agents-page"
import { ChatbotPage } from "../pages/chatbot-page"
import { ProjectOverviewPage } from "../pages/project-overview-page"
import { HistoryPage } from "../pages/history-page"

export function MainLayout() {
  const [currentPage, setCurrentPage] = useState("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onNavigate={setCurrentPage} />
      case "smart-contracts":
        return <SmartContractsPage />
      case "ai-agents":
        return <AIAgentsPage />
      case "chatbot":
        return <ChatbotPage />
      case "history":
        return <HistoryPage />
      case "project-overview":
        return <ProjectOverviewPage />
      default:
        return <DashboardPage onNavigate={setCurrentPage} />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar onNavigate={setCurrentPage} currentPage={currentPage} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              {currentPage === "dashboard" && "Tableau de bord"}
              {currentPage === "smart-contracts" && "Smart Contracts"}
              {currentPage === "ai-agents" && "Agents IA"}
              {currentPage === "chatbot" && "Assistant IA"}
              {currentPage === "history" && "Historique"}
              {currentPage === "project-overview" && "Vue d'ensemble du Projet"}
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{renderPage()}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
