/**
 * ================================================================
 * API ROUTE: LISTAGEM DE CARGOS
 * ================================================================
 * 
 * Endpoint: GET /api/dashboard/cargos
 * 
 * Retorna lista de cargos ordenados por hierarquia,
 * incluindo contagem de membros em cada cargo.
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Busca todos os cargos com contagem de membros
    const cargos = await prisma.cargo.findMany({
      include: {
        _count: {
          select: { membros: true }
        }
      },
      orderBy: {
        hierarquia: 'asc' // Ordena por hierarquia (menor = mais importante)
      }
    })

    // Retorna lista de cargos
    return NextResponse.json({
      dados: cargos,
      total: cargos.length
    })
    
  } catch (error) {
    console.error('Erro ao buscar cargos:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar cargos' },
      { status: 500 }
    )
  }
}
