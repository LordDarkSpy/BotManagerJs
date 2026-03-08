/**
 * ================================================================
 * API ROUTE: PUNICOES
 * ================================================================
 * 
 * Endpoint: GET /api/dashboard/punicoes
 * 
 * Parametros de query:
 * - pagina: numero da pagina (default: 1)
 * - limite: itens por pagina (default: 10)
 * - ativo: filtrar por status (true/false)
 * - membroId: filtrar por membro
 * 
 * Retorna lista paginada de punicoes.
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Extrai parametros da URL
    const searchParams = request.nextUrl.searchParams
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '10')
    const ativoParam = searchParams.get('ativo')
    const membroId = searchParams.get('membroId')

    // Calcula offset para paginacao
    const offset = (pagina - 1) * limite

    // Monta filtros
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    
    if (ativoParam !== null) {
      where.ativo = ativoParam === 'true'
    }
    
    if (membroId) {
      where.membroId = membroId
    }

    // Executa queries em paralelo
    const [punicoes, total, tiposPunicao] = await Promise.all([
      // Busca punicoes com paginacao
      prisma.punicao.findMany({
        where,
        include: {
          membro: {
            select: { 
              id: true, 
              nome: true, 
              discordId: true 
            }
          },
          tipoPunicao: {
            select: {
              codigo: true,
              nome: true,
              nivel: true
            }
          }
        },
        orderBy: {
          dataAplicacao: 'desc'
        },
        skip: offset,
        take: limite
      }),
      
      // Conta total para paginacao
      prisma.punicao.count({ where }),
      
      // Busca tipos de punicao para filtros
      prisma.tipoPunicao.findMany({
        orderBy: { nivel: 'asc' },
        select: {
          id: true,
          codigo: true,
          nome: true,
          nivel: true
        }
      })
    ])

    // Retorna dados paginados
    return NextResponse.json({
      dados: punicoes,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
      limite,
      tiposPunicao
    })
    
  } catch (error) {
    console.error('Erro ao buscar punicoes:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar punicoes' },
      { status: 500 }
    )
  }
}
