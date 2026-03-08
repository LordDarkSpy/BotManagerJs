/**
 * ================================================================
 * PAGINA: LISTAGEM DE CARGOS
 * ================================================================
 * 
 * Exibe todos os cargos configurados na hierarquia
 * e quantidade de membros em cada um.
 */

'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DataTable, type ColunaTabela } from '@/components/dashboard/data-table'
import { useCargos } from '@/hooks/use-dashboard-data'
import { Badge } from '@/components/ui/badge'

/**
 * Tipo para cargo na tabela
 */
interface CargoTabela {
  id: string
  nome: string
  discordRoleId: string
  hierarquia: number
  cor: string | null
  _count: {
    membros: number
  }
}

export default function CargosPage() {
  // Busca dados de cargos
  const { cargos, carregando, revalidar } = useCargos()

  // Definicao das colunas da tabela
  const colunas: ColunaTabela<CargoTabela>[] = [
    {
      id: 'hierarquia',
      cabecalho: 'Nivel',
      celula: (cargo) => (
        <Badge variant="outline">{cargo.hierarquia}</Badge>
      ),
      largura: 'w-16'
    },
    {
      id: 'nome',
      cabecalho: 'Nome do Cargo',
      celula: (cargo) => (
        <div className="flex items-center gap-2">
          {cargo.cor && (
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: cargo.cor }}
            />
          )}
          <div>
            <p className="font-medium">{cargo.nome}</p>
            {cargo.discordRoleId && (
              <p className="text-xs text-muted-foreground">ID: {cargo.discordRoleId}</p>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'membros',
      cabecalho: 'Membros',
      celula: (cargo) => (
        <Badge variant="secondary">
          {cargo._count.membros} {cargo._count.membros === 1 ? 'membro' : 'membros'}
        </Badge>
      )
    }
  ]

  return (
    <DashboardLayout>
      {/* Cabecalho */}
      <DashboardHeader
        titulo="Cargos"
        descricao="Visualize a hierarquia de cargos da organizacao"
        onRefresh={() => revalidar()}
        refreshing={carregando}
      />

      {/* Tabela de cargos */}
      <div className="mt-6">
        <DataTable
          dados={cargos as CargoTabela[]}
          colunas={colunas}
          carregando={carregando}
          mensagemVazio="Nenhum cargo cadastrado"
          descricaoVazio="Utilize o comando /cargo-cadastrar no Discord para adicionar cargos."
        />
      </div>

      {/* Informacao adicional */}
      <div className="mt-6 rounded-lg border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Dica:</strong> Os cargos sao ordenados por hierarquia. 
          Quanto maior o numero, maior a importancia do cargo.
          Para adicionar ou editar cargos, utilize os comandos do bot no Discord.
        </p>
      </div>
    </DashboardLayout>
  )
}
