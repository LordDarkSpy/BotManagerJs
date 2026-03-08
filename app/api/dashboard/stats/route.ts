/**
 * ================================================================
 * API ROUTE: ESTATISTICAS DO DASHBOARD
 * ================================================================
 * 
 * Endpoint: GET /api/dashboard/stats
 * 
 * Retorna estatisticas gerais para exibicao no dashboard:
 * - Total de membros cadastrados
 * - Total de cargos
 * - Ausencias ativas
 * - Total arrecadado FGTS no mes atual
 * - Quantidade na blacklist
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Obtem mes/ano atual para filtrar FGTS
    const hoje = new Date()
    const mesAtual = hoje.getMonth() + 1
    const anoAtual = hoje.getFullYear()
    
    // Executa todas as queries em paralelo para performance
    const [
      totalMembros,
      totalCargos,
      ausenciasAtivas,
      pagamentosFgtsMes,
      blacklistCount
    ] = await Promise.all([
      // Conta total de membros
      prisma.membro.count(),
      
      // Conta total de cargos
      prisma.cargo.count(),
      
      // Conta ausencias ativas
      prisma.ausencia.count({
        where: {
          status: 'ATIVA',
          dataFim: {
            gte: new Date()
          }
        }
      }),
      
      // Conta pagamentos de FGTS do mes atual
      prisma.pagamentoFgts.count({
        where: {
          mesReferencia: mesAtual,
          anoReferencia: anoAtual
        }
      }),
      
      // Conta itens na blacklist
      prisma.blacklist.count()
    ])

    // Calcula pendentes de FGTS
    const membrosPendentes = totalMembros - pagamentosFgtsMes

    // Retorna as estatisticas formatadas
    return NextResponse.json({
      totalMembros,
      totalCargos,
      ausenciasAtivas,
      fgtsPagosMes: pagamentosFgtsMes,
      fgtsPendentesMes: membrosPendentes > 0 ? membrosPendentes : 0,
      blacklistCount
    })
    
  } catch (error) {
    console.error('Erro ao buscar estatisticas:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar estatisticas' },
      { status: 500 }
    )
  }
}
