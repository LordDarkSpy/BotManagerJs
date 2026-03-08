/**
 * ================================================================
 * COMPONENTE: CARD DE ESTATÍSTICA
 * ================================================================
 * 
 * Card reutilizável para exibir estatísticas no dashboard.
 * Mostra um ícone, título, valor e variação opcional.
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  /** Título do card */
  titulo: string
  /** Valor a ser exibido */
  valor: string | number
  /** Ícone do Lucide */
  icone: LucideIcon
  /** Descrição adicional */
  descricao?: string
  /** Cor de fundo do ícone */
  corIcone?: 'primary' | 'success' | 'warning' | 'destructive' | 'muted'
  /** Estado de carregamento */
  carregando?: boolean
}

/**
 * Mapeamento de cores para classes Tailwind
 */
const coresIcone = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/10 text-emerald-500',
  warning: 'bg-amber-500/10 text-amber-500',
  destructive: 'bg-destructive/10 text-destructive',
  muted: 'bg-muted text-muted-foreground'
}

export function StatCard({
  titulo,
  valor,
  icone: Icone,
  descricao,
  corIcone = 'primary',
  carregando = false
}: StatCardProps) {
  // Exibe skeleton durante carregamento
  if (carregando) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {titulo}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', coresIcone[corIcone])}>
          <Icone className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{valor}</div>
        {descricao && (
          <p className="text-xs text-muted-foreground mt-1">{descricao}</p>
        )}
      </CardContent>
    </Card>
  )
}
