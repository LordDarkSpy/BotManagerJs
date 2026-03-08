/**
 * ================================================================
 * API ROUTE: BLACKLIST
 * ================================================================
 * 
 * Endpoint: GET /api/dashboard/blacklist
 * 
 * Parâmetros de query:
 * - pagina: número da página (default: 1)
 * - limite: itens por página (default: 10)
 * - busca: termo de busca no nome do usuário
 * 
 * Retorna lista paginada de usuários na blacklist.
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Extrai parâmetros da URL
    const searchParams = request.nextUrl.searchParams
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '10')
    const busca = searchParams.get('busca') || ''

    // Calcula offset para paginação
    const offset = (pagina - 1) * limite

    // Monta filtro de busca
    const where = busca ? {
      nomeUsuario: {
        contains: busca,
        mode: 'insensitive' as const
      }
    } : {}

    // Executa queries em paralelo
    const [itens, total] = await Promise.all([
      // Busca itens da blacklist com paginação
      prisma.blacklist.findMany({
        where,
        orderBy: {
          createdAt: 'desc' // Mais recentes primeiro
        },
        skip: offset,
        take: limite
      }),
      
      // Conta total para paginação
      prisma.blacklist.count({ where })
    ])

    // Retorna dados paginados
    return NextResponse.json({
      dados: itens,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
      limite
    })
    
  } catch (error) {
    console.error('Erro ao buscar blacklist:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar blacklist' },
      { status: 500 }
    )
  }
}
