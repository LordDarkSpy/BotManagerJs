/**
 * ================================================================
 * TIPOS TYPESCRIPT PARA O DASHBOARD
 * ================================================================
 * 
 * Define os tipos utilizados no dashboard Next.js para
 * garantir tipagem segura em toda a aplicação.
 */

// Estatisticas gerais do dashboard
export interface DashboardStats {
  totalMembros: number
  totalCargos: number
  ausenciasAtivas: number
  fgtsPagosMes: number
  fgtsPendentesMes: number
  blacklistCount: number
}

// Tipo para membro com relacionamentos
export interface MembroComCargo {
  id: string
  discordId: string
  nome: string
  cargo: {
    id: string
    nome: string
  } | null
  createdAt: Date
  updatedAt: Date
}

// Tipo para ausência com membro
export interface AusenciaComMembro {
  id: string
  membro: {
    id: string
    nome: string
    discordId: string
  }
  motivo: string
  dataInicio: Date
  dataFim: Date
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'CONCLUIDA'
  aprovadoPor: string | null
  createdAt: Date
}

// Tipo para pagamento FGTS (taxa obrigatoria mensal)
export interface PagamentoFgts {
  id: string
  membro: {
    id: string
    nome: string
  }
  mesReferencia: number
  anoReferencia: number
  valor: number
  idTransacao: string
  observacao: string | null
  dataPagamento: Date
  createdAt: Date
}

// Tipo para item da blacklist
export interface ItemBlacklist {
  id: string
  odiscordIdUsuario: string
  nomeUsuario: string
  motivo: string
  adicionadoPor: string
  nomeAdicionador: string
  createdAt: Date
}

// Tipo para log de ações
export interface LogAcao {
  id: string
  tipo: string
  descricao: string
  executorId: string
  executorNome: string
  alvoId: string | null
  alvoNome: string | null
  detalhes: Record<string, unknown> | null
  createdAt: Date
}

// Tipo para cargo
export interface Cargo {
  id: string
  nome: string
  discordRoleId: string | null
  cor: string | null
  hierarquia: number
  _count?: {
    membros: number
  }
}

// Props para componentes de tabela
export interface TabelaProps<T> {
  dados: T[]
  carregando?: boolean
  erro?: string | null
}

// Tipo para filtros
export interface FiltrosPaginacao {
  pagina: number
  limite: number
  ordenarPor?: string
  ordem?: 'asc' | 'desc'
  busca?: string
}

// Resposta paginada
export interface RespostaPaginada<T> {
  dados: T[]
  total: number
  pagina: number
  totalPaginas: number
  limite: number
}
