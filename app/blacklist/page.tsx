/**
 * ================================================================
 * PÁGINA: BLACKLIST
 * ================================================================
 * 
 * Exibe tabela com todos os usuários na lista negra,
 * seus motivos e quem os adicionou.
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DataTable, type ColunaTabela } from '@/components/dashboard/data-table'
import { useBlacklist } from '@/hooks/use-dashboard-data'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, UserX } from 'lucide-react'

/**
 * Tipo para item da blacklist na tabela
 */
interface BlacklistTabela {
  id: string
  discordIdUsuario: string
  nomeUsuario: string
  motivo: string
  adicionadoPor: string
  nomeAdicionador: string
  createdAt: string
}

/**
 * Formata data para exibição
 */
function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

export default function BlacklistPage() {
  // Estados de paginação e busca
  const [pagina, setPagina] = useState(1)
  const [busca, setBusca] = useState('')

  // Busca dados da blacklist
  const { itens, totalPaginas, carregando, revalidar } = useBlacklist(pagina, 10, busca)

  // Definição das colunas da tabela
  const colunas: ColunaTabela<BlacklistTabela>[] = [
    {
      id: 'usuario',
      cabecalho: 'Usuário',
      celula: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-destructive/10">
            <UserX className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <p className="font-medium">{item.nomeUsuario}</p>
            <p className="text-xs text-muted-foreground">{item.discordIdUsuario}</p>
          </div>
        </div>
      )
    },
    {
      id: 'motivo',
      cabecalho: 'Motivo',
      celula: (item) => (
        <p className="max-w-md">{item.motivo}</p>
      )
    },
    {
      id: 'adicionadoPor',
      cabecalho: 'Adicionado por',
      celula: (item) => (
        <Badge variant="secondary">{item.nomeAdicionador}</Badge>
      )
    },
    {
      id: 'data',
      cabecalho: 'Data',
      celula: (item) => formatarData(item.createdAt)
    }
  ]

  // Handler de busca
  const handleBusca = (valor: string) => {
    setBusca(valor)
    setPagina(1)
  }

  return (
    <DashboardLayout>
      {/* Cabeçalho */}
      <DashboardHeader
        titulo="Blacklist"
        descricao="Usuários bloqueados e seus motivos"
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

      {/* Tabela de blacklist */}
      <div className="mt-6">
        <DataTable
          dados={itens as BlacklistTabela[]}
          colunas={colunas}
          carregando={carregando}
          paginaAtual={pagina}
          totalPaginas={totalPaginas}
          onPaginaChange={setPagina}
          mensagemVazio="Nenhum usuário na blacklist"
          descricaoVazio="A lista negra está vazia. Nenhum usuário foi bloqueado."
        />
      </div>

      {/* Aviso */}
      <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">
          <strong>Atenção:</strong> Usuários na blacklist estão permanentemente
          bloqueados de participar das atividades do servidor. Para remover um
          usuário da lista, utilize o comando <code className="bg-destructive/10 px-1 rounded">/blacklist-remove</code> no Discord.
        </p>
      </div>
    </DashboardLayout>
  )
}
