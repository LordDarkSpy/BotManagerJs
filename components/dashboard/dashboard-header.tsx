/**
 * ================================================================
 * COMPONENTE: HEADER DO DASHBOARD
 * ================================================================
 * 
 * Cabeçalho do dashboard com título da página e ações.
 */

'use client'

import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface DashboardHeaderProps {
  /** Título da página */
  titulo: string
  /** Descrição opcional */
  descricao?: string
  /** Callback para atualizar dados */
  onRefresh?: () => void
  /** Estado de carregamento do refresh */
  refreshing?: boolean
  /** Ações adicionais */
  children?: React.ReactNode
}

export function DashboardHeader({
  titulo,
  descricao,
  onRefresh,
  refreshing = false,
  children
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Título e descrição */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
        {descricao && (
          <p className="text-muted-foreground">{descricao}</p>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        )}
        {children}
      </div>
    </header>
  )
}
