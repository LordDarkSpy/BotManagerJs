/**
 * ================================================================
 * COMPONENTE: LAYOUT DO DASHBOARD
 * ================================================================
 * 
 * Layout principal que envolve todas as páginas do dashboard.
 * Inclui sidebar e área de conteúdo principal.
 */

'use client'

import { DashboardSidebar } from './dashboard-sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar fixa à esquerda */}
      <DashboardSidebar />

      {/* Área de conteúdo principal */}
      <main className="pl-64">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
