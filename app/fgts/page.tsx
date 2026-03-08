/**
 * ================================================================
 * PAGINA: PAGAMENTOS DE FGTS
 * ================================================================
 * 
 * Exibe tabela paginada com todos os pagamentos de FGTS
 * e resumo de quem pagou/pendente por periodo.
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DataTable, type ColunaTabela } from '@/components/dashboard/data-table'
import { useFgts } from '@/hooks/use-dashboard-data'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle, AlertCircle, Users, DollarSign } from 'lucide-react'

/**
 * Tipo para pagamento na tabela
 */
interface PagamentoTabela {
  id: string
  membro: {
    id: string
    nome: string
    discordId: string
  }
  mesReferencia: number
  anoReferencia: number
  valor: number
  idTransacao: string
  observacao: string | null
  dataPagamento: string
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
 * Formata data para exibicao
 */
function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

/**
 * Retorna nome do mes
 */
function getNomeMes(mes: number): string {
  const meses = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return meses[mes - 1] || 'Mes invalido'
}

export default function FgtsPage() {
  const hoje = new Date()
  
  // Estados de paginacao e filtro
  const [pagina, setPagina] = useState(1)
  const [mes, setMes] = useState<number>(hoje.getMonth() + 1)
  const [ano, setAno] = useState<number>(hoje.getFullYear())

  // Busca dados de pagamentos
  const { pagamentos, totalPaginas, membrosAtivos, totalPendentes, carregando, revalidar } = useFgts(
    pagina,
    10,
    mes,
    ano
  )

  // Calcula total arrecadado
  const totalArrecadado = pagamentos?.reduce((sum: number, p: PagamentoTabela) => sum + p.valor, 0) || 0
  const totalPagaram = (membrosAtivos || 0) - (totalPendentes || 0)

  // Definicao das colunas da tabela
  const colunas: ColunaTabela<PagamentoTabela>[] = [
    {
      id: 'membro',
      cabecalho: 'Membro',
      celula: (pagamento) => (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <p className="font-medium">{pagamento.membro.nome}</p>
        </div>
      )
    },
    {
      id: 'referencia',
      cabecalho: 'Referencia',
      celula: (pagamento) => (
        <Badge variant="outline">
          {getNomeMes(pagamento.mesReferencia)}/{pagamento.anoReferencia}
        </Badge>
      )
    },
    {
      id: 'valor',
      cabecalho: 'Valor',
      celula: (pagamento) => (
        <span className="font-bold text-emerald-600">
          {formatarMoeda(pagamento.valor)}
        </span>
      )
    },
    {
      id: 'idTransacao',
      cabecalho: 'ID Pagamento',
      celula: (pagamento) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {pagamento.idTransacao}
        </code>
      )
    },
    {
      id: 'dataPagamento',
      cabecalho: 'Data Pagamento',
      celula: (pagamento) => (
        <span className="text-sm">{formatarData(pagamento.dataPagamento)}</span>
      )
    }
  ]

  // Gera opcoes de mes
  const meses = Array.from({ length: 12 }, (_, i) => ({
    valor: i + 1,
    label: getNomeMes(i + 1)
  }))

  // Gera opcoes de ano (ultimos 3 anos)
  const anos = Array.from({ length: 3 }, (_, i) => hoje.getFullYear() - i)

  return (
    <DashboardLayout>
      {/* Cabecalho */}
      <DashboardHeader
        titulo="Pagamentos FGTS"
        descricao="Controle de pagamentos da taxa FGTS obrigatoria"
        onRefresh={() => revalidar()}
        refreshing={carregando}
      />

      {/* Cards de resumo */}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membrosAtivos || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagaram</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{totalPagaram}</div>
            <p className="text-xs text-muted-foreground">
              {getNomeMes(mes)}/{ano}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalPendentes || 0}</div>
            <p className="text-xs text-muted-foreground">
              {getNomeMes(mes)}/{ano}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arrecadado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(totalArrecadado)}</div>
            <p className="text-xs text-muted-foreground">
              {getNomeMes(mes)}/{ano}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="mt-6 flex items-center gap-4">
        <Select value={String(mes)} onValueChange={(v) => { setMes(parseInt(v)); setPagina(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Selecione o mes" />
          </SelectTrigger>
          <SelectContent>
            {meses.map((m) => (
              <SelectItem key={m.valor} value={String(m.valor)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(ano)} onValueChange={(v) => { setAno(parseInt(v)); setPagina(1); }}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Selecione o ano" />
          </SelectTrigger>
          <SelectContent>
            {anos.map((a) => (
              <SelectItem key={a} value={String(a)}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de pagamentos */}
      <div className="mt-6">
        <DataTable
          dados={pagamentos as PagamentoTabela[]}
          colunas={colunas}
          carregando={carregando}
          paginaAtual={pagina}
          totalPaginas={totalPaginas}
          onPaginaChange={setPagina}
          mensagemVazio="Nenhum pagamento encontrado"
          descricaoVazio={`Nenhum pagamento de FGTS registrado para ${getNomeMes(mes)}/${ano}.`}
        />
      </div>
    </DashboardLayout>
  )
}
