/**
 * ================================================================
 * API ROUTE: LISTAGEM DE MEMBROS
 * ================================================================
 * 
 * Endpoint: GET /api/dashboard/membros
 * 
 * Parâmetros de query:
 * - pagina: número da página (default: 1)
 * - limite: itens por página (default: 10)
 * - busca: termo de busca no nome
 * - ordenarPor: campo para ordenação (default: nome)
 * - ordem: asc ou desc (default: asc)
 * 
 * Retorna lista paginada de membros com seus cargos.
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
    const ordenarPor = searchParams.get('ordenarPor') || 'nome'
    const ordem = (searchParams.get('ordem') || 'asc') as 'asc' | 'desc'

    // Calcula offset para paginação
    const offset = (pagina - 1) * limite

    // Monta filtro de busca
    const where = busca ? {
      nome: {
        contains: busca,
        mode: 'insensitive' as const
      }
    } : {}

    // Executa queries em paralelo
    const [membros, total] = await Promise.all([
      // Busca membros com paginação
      prisma.membro.findMany({
        where,
        include: {
          cargo: true // Inclui dados do cargo
        },
        orderBy: {
          [ordenarPor]: ordem
        },
        skip: offset,
        take: limite
      }),
      
      // Conta total para paginação
      prisma.membro.count({ where })
    ])

    // Retorna dados paginados
    return NextResponse.json({
      dados: membros,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
      limite
    })
    
  } catch (error) {
    console.error('Erro ao buscar membros:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar membros' },
      { status: 500 }
    )
  }
}
