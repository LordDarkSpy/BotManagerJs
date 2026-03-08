/**
 * ================================================================
 * COMPONENTE: SIDEBAR DO DASHBOARD
 * ================================================================
 * 
 * Navegação lateral do dashboard com links para todas as seções.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Wallet,
  UserX,
  ScrollText,
  Bot,
  AlertTriangle
} from 'lucide-react'

/**
 * Links de navegacao do dashboard
 */
const linksNavegacao = [
  {
    titulo: 'Dashboard',
    href: '/',
    icone: LayoutDashboard
  },
  {
    titulo: 'Membros',
    href: '/membros',
    icone: Users
  },
  {
    titulo: 'Cargos',
    href: '/cargos',
    icone: Briefcase
  },
  {
    titulo: 'Ausencias',
    href: '/ausencias',
    icone: Calendar
  },
  {
    titulo: 'FGTS',
    href: '/fgts',
    icone: Wallet
  },
  {
    titulo: 'Punicoes',
    href: '/punicoes',
    icone: AlertTriangle
  },
  {
    titulo: 'Blacklist',
    href: '/blacklist',
    icone: UserX
  },
  {
    titulo: 'Logs',
    href: '/logs',
    icone: ScrollText
  }
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      {/* Logo / Título */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Bot className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">BotManagerJs</span>
      </div>

      {/* Links de navegação */}
      <nav className="flex flex-col gap-1 p-4">
        {linksNavegacao.map((link) => {
          const isActive = pathname === link.href
          const Icone = link.icone

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icone className="h-4 w-4" />
              {link.titulo}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className="absolute bottom-0 left-0 right-0 border-t p-4">
        <p className="text-xs text-muted-foreground text-center">
          BotManagerJs v1.0.0
        </p>
      </div>
    </aside>
  )
}
