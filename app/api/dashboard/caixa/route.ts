/**
 * ================================================================
 * API ROUTE: MOVIMENTACOES DO CAIXA
 * ================================================================
 * 
 * Endpoint: GET /api/dashboard/caixa
 * 
 * Parametros de query:
 * - pagina: numero da pagina (default: 1)
 * - limite: itens por pagina (default: 10)
 * - tipo: filtrar por tipo (ENTRADA, SAIDA)
 * - categoria: filtrar por categoria
 * 
 * Retorna lista paginada de movimentacoes do caixa.
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Extrai parametros da URL
    const searchParams = request.nextUrl.searchParams
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '10')
    const tipo = searchParams.get('tipo')
    const categoria = searchParams.get('categoria')

    // Calcula offset para paginacao
    const offset = (pagina - 1) * limite

    // Monta filtros
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (tipo) where.tipo = tipo
    if (categoria) where.categoria = categoria

    // Executa queries em paralelo
    const [movimentacoes, total] = await Promise.all([
      // Busca movimentacoes com paginacao
      prisma.movimentacaoCaixa.findMany({
        where,
        include: {
          membro: {
            select: { nome: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limite
      }),
      
      // Conta total para paginacao
      prisma.movimentacaoCaixa.count({ where })
    ])

    // Retorna dados paginados
    return NextResponse.json({
      dados: movimentacoes,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
      limite
    })
    
  } catch (error) {
    console.error('Erro ao buscar movimentacoes do caixa:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar movimentacoes do caixa' },
      { status: 500 }
    )
  }
}
