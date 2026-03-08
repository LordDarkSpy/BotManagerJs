/**
 * ================================================================
 * PÁGINA: LISTAGEM DE MEMBROS
 * ================================================================
 * 
 * Exibe tabela paginada com todos os membros cadastrados,
 * seus cargos e saldos de FGTS.
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DataTable, type ColunaTabela } from '@/components/dashboard/data-table'
import { useMembros } from '@/hooks/use-dashboard-data'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

/**
 * Tipo para membro na tabela
 */
interface MembroTabela {
  id: string
  nome: string
  discordId: string
  cargo: {
    nome: string
    salario: number
  } | null
  saldoFgts: number
  createdAt: string
}

/**
 * Formata valor monetário em Real brasileiro
 */
function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

/**
 * Formata data para exibição
 */
function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

export default function MembrosPage() {
  // Estados de paginação e busca
  const [pagina, setPagina] = useState(1)
  const [busca, setBusca] = useState('')

  // Busca dados de membros
  const { membros, totalPaginas, carregando, revalidar } = useMembros(pagina, 10, busca)

  // Definição das colunas da tabela
  const colunas: ColunaTabela<MembroTabela>[] = [
    {
      id: 'nome',
      cabecalho: 'Nome',
      celula: (membro) => (
        <div>
          <p className="font-medium">{membro.nome}</p>
          <p className="text-xs text-muted-foreground">{membro.discordId}</p>
        </div>
      )
    },
    {
      id: 'cargo',
      cabecalho: 'Cargo',
      celula: (membro) => membro.cargo ? (
        <Badge variant="secondary">{membro.cargo.nome}</Badge>
      ) : (
        <span className="text-muted-foreground">Sem cargo</span>
      )
    },
    {
      id: 'salario',
      cabecalho: 'Salário',
      celula: (membro) => membro.cargo ? (
        formatarMoeda(membro.cargo.salario)
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
    {
      id: 'fgts',
      cabecalho: 'Saldo FGTS',
      celula: (membro) => (
        <span className="font-medium text-emerald-600">
          {formatarMoeda(membro.saldoFgts)}
        </span>
      )
    },
    {
      id: 'cadastro',
      cabecalho: 'Cadastrado em',
      celula: (membro) => formatarData(membro.createdAt)
    }
  ]

  // Handler de busca com debounce
  const handleBusca = (valor: string) => {
    setBusca(valor)
    setPagina(1) // Volta para primeira página ao buscar
  }

  return (
    <DashboardLayout>
      {/* Cabeçalho */}
      <DashboardHeader
        titulo="Membros"
        descricao="Gerencie os membros cadastrados no sistema"
        onRefresh={() => revalidar()}
        refreshing={carregando}
      />

      {/* Barra de busca */}
      <div className="mt-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => handleBusca(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabela de membros */}
      <div className="mt-6">
        <DataTable
          dados={membros as MembroTabela[]}
          colunas={colunas}
          carregando={carregando}
          paginaAtual={pagina}
          totalPaginas={totalPaginas}
          onPaginaChange={setPagina}
          mensagemVazio="Nenhum membro encontrado"
          descricaoVazio="Não há membros cadastrados ou sua busca não retornou resultados."
        />
      </div>
    </DashboardLayout>
  )
}
