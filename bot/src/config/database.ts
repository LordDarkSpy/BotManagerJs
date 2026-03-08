// =============================================================================
// BotManagerJs - Configuração do Banco de Dados
// =============================================================================
// Este arquivo configura e exporta o cliente Prisma para uso em todo o bot.
// O Prisma é um ORM que facilita a comunicação com o PostgreSQL.
// =============================================================================

// Importa o cliente Prisma gerado no projeto raiz
// O bot usa o mesmo schema e cliente que o dashboard
import { PrismaClient } from '../../../node_modules/.prisma/client/index.js';

// =============================================================================
// Configuração Global do Prisma
// =============================================================================
// Usamos uma variável global para evitar criar múltiplas conexões
// durante o desenvolvimento com hot-reload (tsx watch).
// =============================================================================

// Declaração da variável global para TypeScript
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Instância do cliente Prisma
 * 
 * Em desenvolvimento, reutilizamos a mesma instância para evitar
 * esgotar as conexões do banco de dados durante hot-reload.
 * 
 * Em produção, criamos uma nova instância normalmente.
 */
export const prisma = global.prisma || new PrismaClient({
  // Configurações de log do Prisma
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] // Logs detalhados em desenvolvimento
    : ['error'], // Apenas erros em produção
});

// Em desenvolvimento, salvamos a instância globalmente
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// =============================================================================
// Funções Auxiliares de Conexão
// =============================================================================

/**
 * Conecta ao banco de dados
 * Chamada durante a inicialização do bot
 */
export async function connectDatabase(): Promise<void> {
  try {
    // Tenta conectar ao banco
    await prisma.$connect();
    console.log('[Database] Conexão com o banco de dados estabelecida com sucesso!');
  } catch (error) {
    console.error('[Database] Erro ao conectar ao banco de dados:', error);
    // Re-throw para que o bot não inicie sem banco de dados
    throw error;
  }
}

/**
 * Desconecta do banco de dados
 * Chamada durante o encerramento gracioso do bot
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('[Database] Conexão com o banco de dados encerrada.');
  } catch (error) {
    console.error('[Database] Erro ao desconectar do banco de dados:', error);
  }
}

/**
 * Verifica se a conexão com o banco está ativa
 * Útil para health checks
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Executa uma query simples para testar a conexão
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// Exportação Padrão
// =============================================================================

export default prisma;
