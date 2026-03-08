/**
 * ================================================================
 * PAGINA: MOVIMENTACOES DO CAIXA
 * ================================================================
 * 
 * Exibe o historico de movimentacoes do caixa (entradas e saidas).
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DataTable, type ColunaTabela } from '@/components/dashboard/data-table'
import { useCaixa } from '@/hooks/use-dashboard-data'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TrendingDown, TrendingUp } from 'lucide-react'

/**
 * Tipo para movimentacao na tabela
 */
interface MovimentacaoTabela {
  id: string
  tipo: 'ENTRADA' | 'SAIDA'
  valor: number
  descricao: string
  categoria: string | null
  membro: {
    nome: string
  }
  createdAt: string
}

/**
 * Formata valor monetario em Real brasileiro
 */
function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

/**
 * Formata data e hora para exibicao
 */
function formatarDataHora(data: string): string {
  return new Date(data).toLocaleString('pt-BR')
}

export default function CaixaPage() {
  // Estados de paginacao e filtro
  const [pagina, setPagina] = useState(1)
  const [tipo, setTipo] = useState<string>('')

  // Busca dados de movimentacoes
  const { movimentacoes, totalPaginas, carregando, revalidar } = useCaixa(
    pagina,
    10,
    tipo || undefined
  )

  // Definicao das colunas da tabela
  const colunas: ColunaTabela<MovimentacaoTabela>[] = [
    {
      id: 'tipo',
      cabecalho: 'Tipo',
      celula: (mov) => (
        <div className="flex items-center gap-2">
          {mov.tipo === 'ENTRADA' ? (
            <>
              <div className="p-1 rounded bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                Entrada
              </Badge>
            </>
          ) : (
            <>
              <div className="p-1 rounded bg-red-500/10">
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <Badge variant="outline" className="text-red-600 border-red-600">
                Saida
              </Badge>
            </>
          )}
        </div>
      ),
      largura: 'w-32'
    },
    {
      id: 'valor',
      cabecalho: 'Valor',
      celula: (mov) => (
        <span className={`font-bold ${mov.tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-red-600'}`}>
          {mov.tipo === 'ENTRADA' ? '+' : '-'}{formatarMoeda(mov.valor)}
        </span>
      )
    },
    {
      id: 'categoria',
      cabecalho: 'Categoria',
      celula: (mov) => (
        mov.categoria ? <Badge variant="secondary">{mov.categoria}</Badge> : <span className="text-muted-foreground">-</span>
      )
    },
    {
      id: 'descricao',
      cabecalho: 'Descricao',
      celula: (mov) => (
        <p className="max-w-xs truncate">{mov.descricao}</p>
      )
    },
    {
      id: 'realizadoPor',
      cabecalho: 'Realizado por',
      celula: (mov) => (
        <span className="text-sm text-muted-foreground">{mov.membro?.nome || '-'}</span>
      )
    },
    {
      id: 'data',
      cabecalho: 'Data',
      celula: (mov) => (
        <span className="text-sm">{formatarDataHora(mov.createdAt)}</span>
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
      {/* Cabecalho */}
      <DashboardHeader
        titulo="Caixa"
        descricao="Historico de movimentacoes financeiras"
        onRefresh={() => revalidar()}
        refreshing={carregando}
      />

      {/* Filtros */}
      <div className="mt-6 flex items-center gap-4">
        <Select value={tipo || 'todos'} onValueChange={handleTipoChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="ENTRADA">Entradas</SelectItem>
            <SelectItem value="SAIDA">Saidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de movimentacoes */}
      <div className="mt-6">
        <DataTable
          dados={movimentacoes as MovimentacaoTabela[]}
          colunas={colunas}
          carregando={carregando}
          paginaAtual={pagina}
          totalPaginas={totalPaginas}
          onPaginaChange={setPagina}
          mensagemVazio="Nenhuma movimentacao encontrada"
          descricaoVazio="Nao ha movimentacoes registradas no caixa."
        />
      </div>
    </DashboardLayout>
  )
}
