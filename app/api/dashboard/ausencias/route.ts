/**
 * ================================================================
 * API ROUTE: LISTAGEM DE AUSÊNCIAS
 * ================================================================
 * 
 * Endpoint: GET /api/dashboard/ausencias
 * 
 * Parâmetros de query:
 * - pagina: número da página (default: 1)
 * - limite: itens por página (default: 10)
 * - status: filtrar por status (PENDENTE, APROVADA, REJEITADA, CONCLUIDA)
 * 
 * Retorna lista paginada de ausências com dados do membro.
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Extrai parâmetros da URL
    const searchParams = request.nextUrl.searchParams
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '10')
    const status = searchParams.get('status')

    // Calcula offset para paginação
    const offset = (pagina - 1) * limite

    // Monta filtro de status se fornecido
    const where = status ? { status } : {}

    // Executa queries em paralelo
    const [ausencias, total] = await Promise.all([
      // Busca ausências com paginação
      prisma.ausencia.findMany({
        where,
        include: {
          membro: {
            select: {
              id: true,
              nome: true,
              discordId: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc' // Mais recentes primeiro
        },
        skip: offset,
        take: limite
      }),
      
      // Conta total para paginação
      prisma.ausencia.count({ where })
    ])

    // Retorna dados paginados
    return NextResponse.json({
      dados: ausencias,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
      limite
    })
    
  } catch (error) {
    console.error('Erro ao buscar ausências:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar ausências' },
      { status: 500 }
    )
  }
}
