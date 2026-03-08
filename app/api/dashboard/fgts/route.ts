/**
 * ================================================================
 * API ROUTE: PAGAMENTOS DE FGTS
 * ================================================================
 * 
 * Endpoint: GET /api/dashboard/fgts
 * 
 * Parametros de query:
 * - pagina: numero da pagina (default: 1)
 * - limite: itens por pagina (default: 10)
 * - mes: mes de referencia (1-12)
 * - ano: ano de referencia
 * - membroId: filtrar por membro especifico
 * 
 * Retorna lista paginada de pagamentos de FGTS com info de pendentes.
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Extrai parametros da URL
    const searchParams = request.nextUrl.searchParams
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '10')
    const mes = searchParams.get('mes') ? parseInt(searchParams.get('mes')!) : null
    const ano = searchParams.get('ano') ? parseInt(searchParams.get('ano')!) : null
    const membroId = searchParams.get('membroId')

    // Calcula offset para paginacao
    const offset = (pagina - 1) * limite

    // Monta filtros
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (mes) where.mesReferencia = mes
    if (ano) where.anoReferencia = ano
    if (membroId) where.membroId = membroId

    // Executa queries em paralelo
    const [pagamentos, total, membrosAtivos] = await Promise.all([
      // Busca pagamentos com paginacao
      prisma.pagamentoFgts.findMany({
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
        orderBy: [
          { anoReferencia: 'desc' },
          { mesReferencia: 'desc' },
          { dataPagamento: 'desc' }
        ],
        skip: offset,
        take: limite
      }),
      
      // Conta total para paginacao
      prisma.pagamentoFgts.count({ where }),

      // Conta membros ativos para calcular pendentes
      prisma.membro.count({
        where: {
          status: { in: ['ATIVO', 'AUSENTE'] }
        }
      })
    ])

    // Se tem filtro de mes/ano, calcula pendentes
    let totalPendentes = 0
    if (mes && ano) {
      const pagamentosPeriodo = await prisma.pagamentoFgts.count({
        where: {
          mesReferencia: mes,
          anoReferencia: ano
        }
      })
      totalPendentes = membrosAtivos - pagamentosPeriodo
    }

    // Retorna dados paginados
    return NextResponse.json({
      dados: pagamentos,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
      limite,
      membrosAtivos,
      totalPendentes: totalPendentes > 0 ? totalPendentes : 0
    })
    
  } catch (error) {
    console.error('Erro ao buscar pagamentos FGTS:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar pagamentos FGTS' },
      { status: 500 }
    )
  }
}
