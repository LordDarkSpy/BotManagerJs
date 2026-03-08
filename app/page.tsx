/**
 * ================================================================
 * PAGINA PRINCIPAL: DASHBOARD
 * ================================================================
 * 
 * Exibe visao geral do sistema com cards de estatisticas
 * e resumos das principais funcionalidades.
 */

'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { useStats } from '@/hooks/use-dashboard-data'
import {
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  AlertCircle,
  UserX
} from 'lucide-react'

export default function DashboardPage() {
  // Busca estatisticas do dashboard
  const { stats, carregando, revalidar } = useStats()

  return (
    <DashboardLayout>
      {/* Cabecalho da pagina */}
      <DashboardHeader
        titulo="Dashboard"
        descricao="Visao geral do sistema de gerenciamento"
        onRefresh={() => revalidar()}
        refreshing={carregando}
      />

      {/* Grid de cards de estatisticas */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total de Membros */}
        <StatCard
          titulo="Total de Membros"
          valor={stats?.totalMembros ?? 0}
          icone={Users}
          descricao="Membros cadastrados no sistema"
          corIcone="primary"
          carregando={carregando}
        />

        {/* Total de Cargos */}
        <StatCard
          titulo="Cargos"
          valor={stats?.totalCargos ?? 0}
          icone={Briefcase}
          descricao="Cargos configurados"
          corIcone="muted"
          carregando={carregando}
        />

        {/* Ausencias Ativas */}
        <StatCard
          titulo="Ausencias Ativas"
          valor={stats?.ausenciasAtivas ?? 0}
          icone={Calendar}
          descricao="Membros em ausencia no momento"
          corIcone="warning"
          carregando={carregando}
        />

        {/* FGTS Pagos no Mes */}
        <StatCard
          titulo="FGTS Pagos (Mes)"
          valor={stats?.fgtsPagosMes ?? 0}
          icone={CheckCircle}
          descricao="Membros que pagaram FGTS este mes"
          corIcone="success"
          carregando={carregando}
        />

        {/* FGTS Pendentes */}
        <StatCard
          titulo="FGTS Pendentes"
          valor={stats?.fgtsPendentesMes ?? 0}
          icone={AlertCircle}
          descricao="Membros que ainda nao pagaram"
          corIcone="warning"
          carregando={carregando}
        />

        {/* Blacklist */}
        <StatCard
          titulo="Blacklist"
          valor={stats?.blacklistCount ?? 0}
          icone={UserX}
          descricao="Usuarios na lista negra"
          corIcone="destructive"
          carregando={carregando}
        />
      </div>

      {/* Secao de informacoes */}
      <div className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Sobre o BotManagerJs</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Este dashboard fornece uma visao completa do sistema de gerenciamento
            do bot Discord. Utilize o menu lateral para navegar entre as secoes.
          </p>
          <ul className="list-disc list-inside space-y-1 mt-4">
            <li><strong>Membros:</strong> Visualize e gerencie os membros cadastrados</li>
            <li><strong>Cargos:</strong> Configure a hierarquia de cargos</li>
            <li><strong>Ausencias:</strong> Acompanhe as ausencias dos membros</li>
            <li><strong>FGTS:</strong> Controle os pagamentos da taxa obrigatoria</li>
            <li><strong>Punicoes:</strong> Gerencie advertencias e suspensoes</li>
            <li><strong>Blacklist:</strong> Visualize usuarios bloqueados</li>
            <li><strong>Logs:</strong> Acompanhe todas as acoes do sistema</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
