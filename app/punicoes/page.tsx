/**
 * ================================================================
 * PAGINA: GESTAO DE PUNICOES
 * ================================================================
 * 
 * Exibe e gerencia os tipos de punicao e historico de punicoes aplicadas.
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DataTable, type ColunaTabela } from '@/components/dashboard/data-table'
import { usePunicoes, useTiposPunicao } from '@/hooks/use-dashboard-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { AlertTriangle, Plus, Settings } from 'lucide-react'

/**
 * Tipo para punicao na tabela
 */
interface PunicaoTabela {
  id: string
  membro: {
    nome: string
    discordId: string
  }
  tipoPunicao: {
    codigo: string
    nome: string
    nivel: number
  }
  motivo: string
  ativo: boolean
  dataAplicacao: string
  dataExpiracao: string | null
  aplicadoPorNome: string
}

/**
 * Tipo para tipo de punicao
 */
interface TipoPunicaoTabela {
  id: string
  codigo: string
  nome: string
  descricao: string | null
  nivel: number
  diasValidade: number
  diasDuracao: number | null
  removerCargos: boolean
  aplicarCargo: string | null
  _count: {
    punicoes: number
  }
}

/**
 * Formata data para exibicao
 */
function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

export default function PunicoesPage() {
  const [pagina, setPagina] = useState(1)
  const [apenasAtivas, setApenasAtivas] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Busca dados
  const { punicoes, totalPaginas, carregando, revalidar } = usePunicoes(pagina, 10, apenasAtivas)
  const { tipos, carregando: carregandoTipos, revalidar: revalidarTipos } = useTiposPunicao()

  // Colunas da tabela de punicoes
  const colunasPunicoes: ColunaTabela<PunicaoTabela>[] = [
    {
      id: 'status',
      cabecalho: 'Status',
      celula: (p) => (
        <Badge variant={p.ativo ? 'destructive' : 'secondary'}>
          {p.ativo ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
      largura: 'w-24'
    },
    {
      id: 'membro',
      cabecalho: 'Membro',
      celula: (p) => (
        <div>
          <p className="font-medium">{p.membro.nome}</p>
          <p className="text-xs text-muted-foreground">{p.membro.discordId}</p>
        </div>
      )
    },
    {
      id: 'tipo',
      cabecalho: 'Punicao',
      celula: (p) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {p.tipoPunicao.codigo}
          </Badge>
          <span className="text-sm">{p.tipoPunicao.nome}</span>
        </div>
      )
    },
    {
      id: 'motivo',
      cabecalho: 'Motivo',
      celula: (p) => (
        <p className="max-w-xs truncate text-sm">{p.motivo}</p>
      )
    },
    {
      id: 'aplicadoPor',
      cabecalho: 'Aplicado por',
      celula: (p) => (
        <span className="text-sm text-muted-foreground">{p.aplicadoPorNome}</span>
      )
    },
    {
      id: 'data',
      cabecalho: 'Data',
      celula: (p) => (
        <div className="text-sm">
          <p>{formatarData(p.dataAplicacao)}</p>
          {p.dataExpiracao && (
            <p className="text-xs text-muted-foreground">
              Expira: {formatarData(p.dataExpiracao)}
            </p>
          )}
        </div>
      )
    }
  ]

  // Colunas da tabela de tipos
  const colunasTipos: ColunaTabela<TipoPunicaoTabela>[] = [
    {
      id: 'nivel',
      cabecalho: 'Nivel',
      celula: (t) => (
        <Badge variant="outline">{t.nivel}</Badge>
      ),
      largura: 'w-16'
    },
    {
      id: 'codigo',
      cabecalho: 'Codigo',
      celula: (t) => (
        <Badge className="font-mono">{t.codigo}</Badge>
      )
    },
    {
      id: 'nome',
      cabecalho: 'Nome',
      celula: (t) => (
        <div>
          <p className="font-medium">{t.nome}</p>
          {t.descricao && (
            <p className="text-xs text-muted-foreground">{t.descricao}</p>
          )}
        </div>
      )
    },
    {
      id: 'validade',
      cabecalho: 'Validade',
      celula: (t) => (
        <span className="text-sm">{t.diasValidade} dias</span>
      )
    },
    {
      id: 'duracao',
      cabecalho: 'Duracao',
      celula: (t) => (
        <span className="text-sm">
          {t.diasDuracao ? `${t.diasDuracao} dias` : 'Permanente'}
        </span>
      )
    },
    {
      id: 'acoes',
      cabecalho: 'Acoes Auto',
      celula: (t) => (
        <div className="flex gap-2">
          {t.removerCargos && (
            <Badge variant="secondary" className="text-xs">Remove cargos</Badge>
          )}
          {t.aplicarCargo && (
            <Badge variant="secondary" className="text-xs">Aplica cargo</Badge>
          )}
        </div>
      )
    },
    {
      id: 'total',
      cabecalho: 'Total',
      celula: (t) => (
        <Badge variant="outline">{t._count.punicoes}</Badge>
      )
    }
  ]

  return (
    <DashboardLayout>
      {/* Cabecalho */}
      <DashboardHeader
        titulo="Punicoes"
        descricao="Gerencie os tipos de punicao e historico de punicoes aplicadas"
        onRefresh={() => {
          revalidar()
          revalidarTipos()
        }}
        refreshing={carregando || carregandoTipos}
      />

      <Tabs defaultValue="historico" className="mt-6">
        <TabsList>
          <TabsTrigger value="historico">Historico de Punicoes</TabsTrigger>
          <TabsTrigger value="tipos">Tipos de Punicao</TabsTrigger>
        </TabsList>

        {/* Aba: Historico de Punicoes */}
        <TabsContent value="historico">
          {/* Filtros */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="apenas-ativas"
                checked={apenasAtivas}
                onCheckedChange={(checked) => {
                  setApenasAtivas(checked)
                  setPagina(1)
                }}
              />
              <Label htmlFor="apenas-ativas">Apenas ativas</Label>
            </div>
          </div>

          {/* Tabela de punicoes */}
          <div className="mt-4">
            <DataTable
              dados={punicoes as PunicaoTabela[]}
              colunas={colunasPunicoes}
              carregando={carregando}
              paginaAtual={pagina}
              totalPaginas={totalPaginas}
              onPaginaChange={setPagina}
              mensagemVazio="Nenhuma punicao encontrada"
              descricaoVazio={apenasAtivas 
                ? "Nao ha punicoes ativas no momento."
                : "Nenhuma punicao registrada."
              }
            />
          </div>
        </TabsContent>

        {/* Aba: Tipos de Punicao */}
        <TabsContent value="tipos">
          {/* Acoes */}
          <div className="mt-4 flex justify-end">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Tipo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Tipo de Punicao</DialogTitle>
                  <DialogDescription>
                    Configure um novo tipo de punicao para o sistema de escalonamento.
                  </DialogDescription>
                </DialogHeader>
                <FormNovoTipo 
                  onSuccess={() => {
                    setDialogOpen(false)
                    revalidarTipos()
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabela de tipos */}
          <div className="mt-4">
            <DataTable
              dados={tipos as TipoPunicaoTabela[]}
              colunas={colunasTipos}
              carregando={carregandoTipos}
              mensagemVazio="Nenhum tipo de punicao cadastrado"
              descricaoVazio="Cadastre tipos de punicao para o sistema de escalonamento funcionar."
            />
          </div>

          {/* Explicacao do sistema */}
          <div className="mt-6 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <h4 className="font-medium">Como funciona o escalonamento</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Quando um membro recebe uma punicao, o sistema verifica se ele ja possui 
                  punicoes recentes (dentro do periodo de validade). Se sim, a punicao e 
                  automaticamente escalada para o proximo nivel. Por exemplo: se o membro 
                  tem uma ADV-1 ativa e recebe outra punicao, automaticamente sera aplicada ADV-2.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

/**
 * Formulario para criar novo tipo de punicao
 */
function FormNovoTipo({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    nivel: 1,
    diasValidade: 30,
    diasDuracao: 0,
    removerCargos: false,
    aplicarCargo: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/dashboard/punicoes/tipos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          diasDuracao: formData.diasDuracao || null,
          aplicarCargo: formData.aplicarCargo || null
        })
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Erro ao criar tipo:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">Codigo</Label>
          <Input
            id="codigo"
            placeholder="ADV-1"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nivel">Nivel</Label>
          <Input
            id="nivel"
            type="number"
            min={1}
            value={formData.nivel}
            onChange={(e) => setFormData({ ...formData, nivel: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          placeholder="Advertencia Nivel 1"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descricao (opcional)</Label>
        <Input
          id="descricao"
          placeholder="Descricao da punicao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="diasValidade">Validade (dias)</Label>
          <Input
            id="diasValidade"
            type="number"
            min={1}
            value={formData.diasValidade}
            onChange={(e) => setFormData({ ...formData, diasValidade: parseInt(e.target.value) })}
            required
          />
          <p className="text-xs text-muted-foreground">
            Tempo para escalonamento
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="diasDuracao">Duracao (dias)</Label>
          <Input
            id="diasDuracao"
            type="number"
            min={0}
            value={formData.diasDuracao}
            onChange={(e) => setFormData({ ...formData, diasDuracao: parseInt(e.target.value) })}
          />
          <p className="text-xs text-muted-foreground">
            0 = permanente
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aplicarCargo">ID do Cargo (opcional)</Label>
        <Input
          id="aplicarCargo"
          placeholder="ID do cargo Discord"
          value={formData.aplicarCargo}
          onChange={(e) => setFormData({ ...formData, aplicarCargo: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="removerCargos"
          checked={formData.removerCargos}
          onCheckedChange={(checked) => setFormData({ ...formData, removerCargos: checked })}
        />
        <Label htmlFor="removerCargos">Remover todos os cargos ao aplicar</Label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Tipo de Punicao'}
      </Button>
    </form>
  )
}
