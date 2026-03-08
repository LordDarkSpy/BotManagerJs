/**
 * ================================================================
 * API ROUTE: TIPOS DE PUNICAO
 * ================================================================
 * 
 * Endpoint: GET /api/dashboard/tipos-punicao
 * 
 * Retorna lista de tipos de punicao configurados.
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Busca tipos de punicao ordenados por nivel
    const tiposPunicao = await prisma.tipoPunicao.findMany({
      orderBy: { nivel: 'asc' },
      include: {
        _count: {
          select: { punicoes: true }
        }
      }
    })

    return NextResponse.json({
      dados: tiposPunicao
    })
    
  } catch (error) {
    console.error('Erro ao buscar tipos de punicao:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar tipos de punicao' },
      { status: 500 }
    )
  }
}
