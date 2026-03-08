/**
 * ================================================================
 * API ROUTE: LOGS DE AÇÕES
 * ================================================================
 * 
 * Endpoint: GET /api/dashboard/logs
 * 
 * Parâmetros de query:
 * - pagina: número da página (default: 1)
 * - limite: itens por página (default: 20)
 * - tipo: filtrar por tipo de ação
 * 
 * Retorna lista paginada de logs de ações do sistema.
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Extrai parâmetros da URL
    const searchParams = request.nextUrl.searchParams
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '20')
    const tipo = searchParams.get('tipo')

    // Calcula offset para paginação
    const offset = (pagina - 1) * limite

    // Monta filtro de tipo
    const where = tipo ? { tipo } : {}

    // Executa queries em paralelo
    const [logs, total] = await Promise.all([
      // Busca logs com paginação
      prisma.log.findMany({
        where,
        orderBy: {
          createdAt: 'desc' // Mais recentes primeiro
        },
        skip: offset,
        take: limite
      }),
      
      // Conta total para paginação
      prisma.log.count({ where })
    ])

    // Retorna dados paginados
    return NextResponse.json({
      dados: logs,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
      limite
    })
    
  } catch (error) {
    console.error('Erro ao buscar logs:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar logs' },
      { status: 500 }
    )
  }
}
