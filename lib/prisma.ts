/**
 * ================================================================
 * CONFIGURACAO DO PRISMA CLIENT PARA O DASHBOARD NEXT.JS
 * ================================================================
 * 
 * Este arquivo configura o cliente Prisma para uso no dashboard web.
 * Implementa o padrao singleton para evitar multiplas instancias
 * do cliente em desenvolvimento (hot reload).
 */

import { PrismaClient } from '@prisma/client'

// Declaracao global para TypeScript
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

/**
 * Cria ou reutiliza uma instancia do PrismaClient.
 * Em producao, sempre cria uma nova instancia.
 * Em desenvolvimento, reutiliza a instancia global para evitar
 * problemas com hot reload criando multiplas conexoes.
 */
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
})

// Em desenvolvimento, salva a instancia globalmente
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma
