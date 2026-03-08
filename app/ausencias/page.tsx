/**
 * ================================================================
 * PÁGINA: LISTAGEM DE AUSÊNCIAS
 * ================================================================
 * 
 * Exibe tabela paginada com todas as ausências registradas,
 * com filtro por status.
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DataTable, type ColunaTabela } from '@/components/dashboard/data-table'
import { useAusencias } from '@/hooks/use-dashboard-data'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Tipo para ausência na tabela
 */
interface AusenciaTabela {
  id: string
  membro: {
    id: string
    nome: string
    discordId: string
  }
  motivo: string
  dataInicio: string
  dataFim: string
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'CONCLUIDA'
  aprovadoPor: string | null
  createdAt: string
}

/**
 * Formata data para exibição
 */
function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

/**
 * Retorna variante e texto do badge de status
 */
function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDENTE':
      return { variant: 'outline' as const, texto: 'Pendente' }
    case 'APROVADA':
      return { variant: 'default' as const, texto: 'Aprovada' }
    case 'REJEITADA':
      return { variant: 'destructive' as const, texto: 'Rejeitada' }
    case 'CONCLUIDA':
      return { variant: 'secondary' as const, texto: 'Concluída' }
    default:
      return { variant: 'outline' as const, texto: status }
  }
}

export default function AusenciasPage() {
  // Estados de paginação e filtro
  const [pagina, setPagina] = useState(1)
  const [status, setStatus] = useState<string>('')

  // Busca dados de ausências
  const { ausencias, totalPaginas, carregando, revalidar } = useAusencias(
    pagina,
    10,
    status || undefined
  )

  // Definição das colunas da tabela
  const colunas: ColunaTabela<AusenciaTabela>[] = [
    {
      id: 'membro',
      cabecalho: 'Membro',
      celula: (ausencia) => (
        <div>
          <p className="font-medium">{ausencia.membro.nome}</p>
          <p className="text-xs text-muted-foreground">{ausencia.membro.discordId}</p>
        </div>
      )
    },
    {
      id: 'periodo',
      cabecalho: 'Período',
      celula: (ausencia) => (
        <div className="text-sm">
          <p>{formatarData(ausencia.dataInicio)}</p>
          <p className="text-muted-foreground">até {formatarData(ausencia.dataFim)}</p>
        </div>
      )
    },
    {
      id: 'motivo',
      cabecalho: 'Motivo',
      celula: (ausencia) => (
        <p className="max-w-xs truncate">{ausencia.motivo}</p>
      )
    },
    {
      id: 'status',
      cabecalho: 'Status',
      celula: (ausencia) => {
        const { variant, texto } = getStatusBadge(ausencia.status)
        return <Badge variant={variant}>{texto}</Badge>
      }
    },
    {
      id: 'solicitado',
      cabecalho: 'Solicitado em',
      celula: (ausencia) => formatarData(ausencia.createdAt)
    }
  ]

  // Handler de filtro de status
  const handleStatusChange = (valor: string) => {
    setStatus(valor === 'todos' ? '' : valor)
    setPagina(1)
  }

  return (
    <DashboardLayout>
      {/* Cabeçalho */}
      <DashboardHeader
        titulo="Ausências"
        descricao="Acompanhe as ausências registradas pelos membros"
        onRefresh={() => revalidar()}
        refreshing={carregando}
      />

      {/* Filtros */}
      <div className="mt-6 flex items-center gap-4">
        <Select value={status || 'todos'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="PENDENTE">Pendente</SelectItem>
            <SelectItem value="APROVADA">Aprovada</SelectItem>
            <SelectItem value="REJEITADA">Rejeitada</SelectItem>
            <SelectItem value="CONCLUIDA">Concluída</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de ausências */}
      <div className="mt-6">
        <DataTable
          dados={ausencias as AusenciaTabela[]}
          colunas={colunas}
          carregando={carregando}
          paginaAtual={pagina}
          totalPaginas={totalPaginas}
          onPaginaChange={setPagina}
          mensagemVazio="Nenhuma ausência encontrada"
          descricaoVazio="Não há ausências registradas ou o filtro não retornou resultados."
        />
      </div>
    </DashboardLayout>
  )
}
