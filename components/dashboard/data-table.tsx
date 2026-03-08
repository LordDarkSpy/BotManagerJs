/**
 * ================================================================
 * COMPONENTE: TABELA DE DADOS GENÉRICA
 * ================================================================
 * 
 * Componente de tabela reutilizável com suporte a:
 * - Paginação
 * - Estado de carregamento
 * - Estado vazio
 * - Colunas customizáveis
 */

'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyDescription, EmptyTitle } from '@/components/ui/empty'
import { ChevronLeft, ChevronRight, Database } from 'lucide-react'

/**
 * Definição de coluna da tabela
 */
export interface ColunaTabela<T> {
  /** Identificador único da coluna */
  id: string
  /** Texto do cabeçalho */
  cabecalho: string
  /** Função para renderizar a célula */
  celula: (item: T) => React.ReactNode
  /** Largura da coluna (classe Tailwind) */
  largura?: string
}

interface DataTableProps<T> {
  /** Array de dados para exibir */
  dados: T[]
  /** Definição das colunas */
  colunas: ColunaTabela<T>[]
  /** Estado de carregamento */
  carregando?: boolean
  /** Página atual */
  paginaAtual?: number
  /** Total de páginas */
  totalPaginas?: number
  /** Callback para mudança de página */
  onPaginaChange?: (pagina: number) => void
  /** Mensagem quando não há dados */
  mensagemVazio?: string
  /** Descrição quando não há dados */
  descricaoVazio?: string
}

export function DataTable<T>({
  dados,
  colunas,
  carregando = false,
  paginaAtual = 1,
  totalPaginas = 1,
  onPaginaChange,
  mensagemVazio = 'Nenhum dado encontrado',
  descricaoVazio = 'Não há registros para exibir no momento.'
}: DataTableProps<T>) {
  
  // Renderiza skeletons durante carregamento
  if (carregando) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {colunas.map((coluna) => (
                <TableHead key={coluna.id} className={coluna.largura}>
                  {coluna.cabecalho}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {colunas.map((coluna) => (
                  <TableCell key={coluna.id}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Renderiza estado vazio
  if (dados.length === 0) {
    return (
      <div className="rounded-md border p-8">
        <Empty>
          <Database className="h-10 w-10 text-muted-foreground" />
          <EmptyTitle>{mensagemVazio}</EmptyTitle>
          <EmptyDescription>{descricaoVazio}</EmptyDescription>
        </Empty>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabela de dados */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {colunas.map((coluna) => (
                <TableHead key={coluna.id} className={coluna.largura}>
                  {coluna.cabecalho}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dados.map((item, index) => (
              <TableRow key={index}>
                {colunas.map((coluna) => (
                  <TableCell key={coluna.id}>
                    {coluna.celula(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Controles de paginação */}
      {totalPaginas > 1 && onPaginaChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {paginaAtual} de {totalPaginas}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginaChange(paginaAtual - 1)}
              disabled={paginaAtual <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginaChange(paginaAtual + 1)}
              disabled={paginaAtual >= totalPaginas}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
