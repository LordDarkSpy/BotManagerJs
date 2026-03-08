/**
 * ================================================================
 * HOOK: DADOS DO DASHBOARD
 * ================================================================
 * 
 * Hooks customizados usando SWR para buscar dados do dashboard.
 * Fornece cache, revalidação automática e estados de loading/error.
 */

import useSWR from 'swr'
import type { DashboardStats, RespostaPaginada } from '@/types/dashboard'

/**
 * Fetcher padrão para SWR
 * Faz requisição GET e retorna JSON
 */
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Erro ao carregar dados')
  }
  return res.json()
}

/**
 * Hook para buscar estatísticas do dashboard
 */
export function useStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    '/api/dashboard/stats',
    fetcher,
    {
      refreshInterval: 30000, // Atualiza a cada 30 segundos
      revalidateOnFocus: true
    }
  )

  return {
    stats: data,
    carregando: isLoading,
    erro: error?.message,
    revalidar: mutate
  }
}

/**
 * Hook para buscar membros com paginação
 */
export function useMembros(pagina = 1, limite = 10, busca = '') {
  const params = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
    ...(busca && { busca })
  })

  const { data, error, isLoading, mutate } = useSWR<RespostaPaginada<unknown>>(
    `/api/dashboard/membros?${params}`,
    fetcher
  )

  return {
    membros: data?.dados || [],
    total: data?.total || 0,
    totalPaginas: data?.totalPaginas || 1,
    carregando: isLoading,
    erro: error?.message,
    revalidar: mutate
  }
}

/**
 * Hook para buscar ausências com paginação
 */
export function useAusencias(pagina = 1, limite = 10, status?: string) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
    ...(status && { status })
  })

  const { data, error, isLoading, mutate } = useSWR<RespostaPaginada<unknown>>(
    `/api/dashboard/ausencias?${params}`,
    fetcher
  )

  return {
    ausencias: data?.dados || [],
    total: data?.total || 0,
    totalPaginas: data?.totalPaginas || 1,
    carregando: isLoading,
    erro: error?.message,
    revalidar: mutate
  }
}

/**
 * Hook para buscar pagamentos de FGTS
 * FGTS e uma taxa obrigatoria mensal que todos os membros devem pagar
 */
export function useFgts(pagina = 1, limite = 10, mes?: number, ano?: number) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
    ...(mes && { mes: String(mes) }),
    ...(ano && { ano: String(ano) })
  })

  const { data, error, isLoading, mutate } = useSWR<RespostaPaginada<unknown> & { membrosAtivos: number, totalPendentes: number }>(
    `/api/dashboard/fgts?${params}`,
    fetcher
  )

  return {
    pagamentos: data?.dados || [],
    total: data?.total || 0,
    totalPaginas: data?.totalPaginas || 1,
    membrosAtivos: data?.membrosAtivos || 0,
    totalPendentes: data?.totalPendentes || 0,
    carregando: isLoading,
    erro: error?.message,
    revalidar: mutate
  }
}



/**
 * Hook para buscar blacklist
 */
export function useBlacklist(pagina = 1, limite = 10, busca = '') {
  const params = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
    ...(busca && { busca })
  })

  const { data, error, isLoading, mutate } = useSWR<RespostaPaginada<unknown>>(
    `/api/dashboard/blacklist?${params}`,
    fetcher
  )

  return {
    itens: data?.dados || [],
    total: data?.total || 0,
    totalPaginas: data?.totalPaginas || 1,
    carregando: isLoading,
    erro: error?.message,
    revalidar: mutate
  }
}

/**
 * Hook para buscar logs
 */
export function useLogs(pagina = 1, limite = 20, tipo?: string) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
    ...(tipo && { tipo })
  })

  const { data, error, isLoading, mutate } = useSWR<RespostaPaginada<unknown>>(
    `/api/dashboard/logs?${params}`,
    fetcher
  )

  return {
    logs: data?.dados || [],
    total: data?.total || 0,
    totalPaginas: data?.totalPaginas || 1,
    carregando: isLoading,
    erro: error?.message,
    revalidar: mutate
  }
}

/**
 * Hook para buscar cargos
 */
export function useCargos() {
  const { data, error, isLoading, mutate } = useSWR<{ dados: unknown[], total: number }>(
    '/api/dashboard/cargos',
    fetcher
  )

  return {
    cargos: data?.dados || [],
    total: data?.total || 0,
    carregando: isLoading,
    erro: error?.message,
    revalidar: mutate
  }
}

/**
 * Hook para buscar punicoes com paginacao
 */
export function usePunicoes(pagina = 1, limite = 10, ativo?: boolean) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
    ...(ativo !== undefined && { ativo: String(ativo) })
  })

  const { data, error, isLoading, mutate } = useSWR<RespostaPaginada<unknown> & { tiposPunicao: unknown[] }>(
    `/api/dashboard/punicoes?${params}`,
    fetcher
  )

  return {
    punicoes: data?.dados || [],
    total: data?.total || 0,
    totalPaginas: data?.totalPaginas || 1,
    tiposPunicao: data?.tiposPunicao || [],
    carregando: isLoading,
    erro: error?.message,
    revalidar: mutate
  }
}

/**
 * Hook para buscar tipos de punicao
 */
export function useTiposPunicao() {
  const { data, error, isLoading, mutate } = useSWR<{ dados: unknown[] }>(
    '/api/dashboard/tipos-punicao',
    fetcher
  )

  return {
    tipos: data?.dados || [],
    carregando: isLoading,
    erro: error?.message,
    revalidar: mutate
  }
}
