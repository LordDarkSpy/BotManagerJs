/**
 * ================================================================
 * PÁGINA: LOGS DE AÇÕES
 * ================================================================
 * 
 * Exibe histórico de todas as ações realizadas no sistema,
 * incluindo quem executou e detalhes da operação.
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DataTable, type ColunaTabela } from '@/components/dashboard/data-table'
import { useLogs } from '@/hooks/use-dashboard-data'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Tipo para log na tabela
 */
interface LogTabela {
  id: string
  tipo: string
  descricao: string
  executorId: string
  executorNome: string
  alvoId: string | null
  alvoNome: string | null
  detalhes: Record<string, unknown> | null
  createdAt: string
}

/**
 * Tipos de log disponiveis
 */
const tiposLog = [
  'SET_SOLICITADO',
  'SET_APROVADO',
  'SET_REPROVADO',
  'CARGO_ALTERADO',
  'CARGO_CRIADO',
  'AUSENCIA_REGISTRADA',
  'AUSENCIA_FINALIZADA',
  'FGTS_PAGO',
  'BLACKLIST_ADICIONADO',
  'BLACKLIST_REMOVIDO',
  'PUNICAO_APLICADA',
  'PUNICAO_REMOVIDA'
]

/**
 * Formata data e hora para exibição
 */
function formatarDataHora(data: string): string {
  return new Date(data).toLocaleString('pt-BR')
}

/**
 * Retorna cor do badge baseado no tipo de log
 */
function getCorTipo(tipo: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (tipo.includes('APROVADO') || tipo.includes('PAGO') || tipo.includes('FINALIZADA')) {
    return 'default'
  }
  if (tipo.includes('REPROVADO') || tipo.includes('REMOVIDO') || tipo.includes('PUNICAO_APLICADA')) {
    return 'destructive'
  }
  return 'secondary'
}

export default function LogsPage() {
  // Estados de paginação e filtro
  const [pagina, setPagina] = useState(1)
  const [tipo, setTipo] = useState<string>('')

  // Busca dados de logs
  const { logs, totalPaginas, carregando, revalidar } = useLogs(
    pagina,
    20,
    tipo || undefined
  )

  // Definição das colunas da tabela
  const colunas: ColunaTabela<LogTabela>[] = [
    {
      id: 'data',
      cabecalho: 'Data/Hora',
      celula: (log) => (
        <span className="text-sm whitespace-nowrap">
          {formatarDataHora(log.createdAt)}
        </span>
      ),
      largura: 'w-40'
    },
    {
      id: 'tipo',
      cabecalho: 'Tipo',
      celula: (log) => (
        <Badge variant={getCorTipo(log.tipo)}>
          {log.tipo.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      id: 'descricao',
      cabecalho: 'Descrição',
      celula: (log) => (
        <p className="max-w-md">{log.descricao}</p>
      )
    },
    {
      id: 'executor',
      cabecalho: 'Executado por',
      celula: (log) => (
        <div>
          <p className="font-medium text-sm">{log.executorNome}</p>
          <p className="text-xs text-muted-foreground">{log.executorId}</p>
        </div>
      )
    },
    {
      id: 'alvo',
      cabecalho: 'Alvo',
      celula: (log) => log.alvoNome ? (
        <div>
          <p className="font-medium text-sm">{log.alvoNome}</p>
          <p className="text-xs text-muted-foreground">{log.alvoId}</p>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    }
  ]

  // Handler de filtro de tipo
  const handleTipoChange = (valor: string) => {
    setTipo(valor === 'todos' ? '' : valor)
    setPagina(1)
  }

  return (
    <DashboardLayout>
      {/* Cabeçalho */}
      <DashboardHeader
        titulo="Logs"
        descricao="Histórico de todas as ações realizadas no sistema"
        onRefresh={() => revalidar()}
        refreshing={carregando}
      />

      {/* Filtros */}
      <div className="mt-6 flex items-center gap-4">
        <Select value={tipo || 'todos'} onValueChange={handleTipoChange}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {tiposLog.map((t) => (
              <SelectItem key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de logs */}
      <div className="mt-6">
        <DataTable
          dados={logs as LogTabela[]}
          colunas={colunas}
          carregando={carregando}
          paginaAtual={pagina}
          totalPaginas={totalPaginas}
          onPaginaChange={setPagina}
          mensagemVazio="Nenhum log encontrado"
          descricaoVazio="Não há registros de ações no sistema."
        />
      </div>
    </DashboardLayout>
  )
}
