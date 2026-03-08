// =============================================================================
// BotManagerJs - Serviço de Logs
// =============================================================================
// Este serviço gerencia o registro de logs de auditoria no banco de dados.
// Todos os eventos importantes são registrados aqui para rastreamento.
// =============================================================================

import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { prisma } from '../config/database.js';
import { LogAction, LogData, EmbedColors } from '../types/index.js';
import { formatDateTime } from '../utils/embeds.js';

// =============================================================================
// Variáveis do Módulo
// =============================================================================

// Referência ao cliente do Discord para enviar mensagens
let discordClient: Client | null = null;

// =============================================================================
// Inicialização
// =============================================================================

/**
 * Inicializa o serviço de logs com o cliente do Discord
 * @param client - Cliente Discord.js inicializado
 */
export function initLogService(client: Client): void {
  discordClient = client;
  console.log('[LogService] Serviço de logs inicializado.');
}

// =============================================================================
// Funções Principais de Log
// =============================================================================

/**
 * Registra uma ação no banco de dados e opcionalmente envia para um canal
 * @param data - Dados do log a ser registrado
 * @returns ID do log criado
 */
export async function registrarLog(data: LogData): Promise<string> {
  try {
    // Cria o registro no banco de dados
    const log = await prisma.log.create({
      data: {
        guildId: data.guildId,
        acao: data.acao,
        detalhes: data.detalhes,
        executorId: data.executorId,
        executorNome: data.executorNome,
        alvoId: data.alvoId,
        alvoNome: data.alvoNome
      }
    });

    console.log(`[LogService] Log registrado: ${data.acao} por ${data.executorNome || data.executorId}`);

    // Tenta enviar para o canal de logs se configurado
    await enviarLogParaCanal(data);

    return log.id;
  } catch (error) {
    console.error('[LogService] Erro ao registrar log:', error);
    throw error;
  }
}

/**
 * Envia o log para o canal de logs configurado (se existir)
 * @param data - Dados do log
 */
async function enviarLogParaCanal(data: LogData): Promise<void> {
  if (!discordClient) return;

  try {
    // Busca configuração do servidor
    const config = await prisma.configuracao.findUnique({
      where: { guildId: data.guildId }
    });

    // Se não há canal de logs configurado, retorna
    if (!config?.canalLogs) return;

    // Busca o canal
    const channel = await discordClient.channels.fetch(config.canalLogs);
    if (!channel || !(channel instanceof TextChannel)) return;

    // Cria embed do log
    const embed = createLogEmbed(data);
    await channel.send({ embeds: [embed] });
  } catch (error) {
    // Silenciosamente falha se não conseguir enviar para o canal
    console.warn('[LogService] Não foi possível enviar log para o canal:', error);
  }
}

// =============================================================================
// Criação de Embeds de Log
// =============================================================================

/**
 * Cria um embed formatado para o log
 * @param data - Dados do log
 * @returns EmbedBuilder configurado
 */
function createLogEmbed(data: LogData): EmbedBuilder {
  const { icon, color, title } = getLogStyle(data.acao);

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${icon} ${title}`)
    .setTimestamp();

  // Adiciona executor
  embed.addFields({
    name: '👤 Executado por',
    value: data.executorNome 
      ? `${data.executorNome} (<@${data.executorId}>)`
      : `<@${data.executorId}>`,
    inline: true
  });

  // Adiciona alvo se houver
  if (data.alvoId) {
    embed.addFields({
      name: '🎯 Alvo',
      value: data.alvoNome
        ? `${data.alvoNome} (<@${data.alvoId}>)`
        : `<@${data.alvoId}>`,
      inline: true
    });
  }

  // Adiciona detalhes se houver
  if (data.detalhes) {
    embed.addFields({
      name: '📝 Detalhes',
      value: data.detalhes.slice(0, 1024),
      inline: false
    });
  }

  return embed;
}

/**
 * Retorna estilo visual baseado no tipo de ação
 * @param acao - Tipo de ação
 * @returns Objeto com ícone, cor e título
 */
function getLogStyle(acao: LogAction): { icon: string; color: number; title: string } {
  const styles: Record<LogAction, { icon: string; color: number; title: string }> = {
    SET_SOLICITADO: { icon: '📝', color: EmbedColors.PENDING, title: 'Set Solicitado' },
    SET_APROVADO: { icon: '✅', color: EmbedColors.SUCCESS, title: 'Set Aprovado' },
    SET_REPROVADO: { icon: '❌', color: EmbedColors.ERROR, title: 'Set Reprovado' },
    CARGO_ALTERADO: { icon: '📊', color: EmbedColors.INFO, title: 'Cargo Alterado' },
    CARGO_CRIADO: { icon: '➕', color: EmbedColors.SUCCESS, title: 'Cargo Criado' },
    CARGO_REMOVIDO: { icon: '➖', color: EmbedColors.ERROR, title: 'Cargo Removido' },
    AUSENCIA_REGISTRADA: { icon: '🗓️', color: EmbedColors.WARNING, title: 'Ausencia Registrada' },
    AUSENCIA_FINALIZADA: { icon: '✅', color: EmbedColors.SUCCESS, title: 'Ausencia Finalizada' },
    FGTS_PAGO: { icon: '💰', color: EmbedColors.SUCCESS, title: 'FGTS Pago' },
    BLACKLIST_ADICIONADO: { icon: '🚫', color: EmbedColors.ERROR, title: 'Adicionado a Blacklist' },
    BLACKLIST_REMOVIDO: { icon: '✅', color: EmbedColors.SUCCESS, title: 'Removido da Blacklist' },
    MEMBRO_BANIDO: { icon: '🔨', color: EmbedColors.ERROR, title: 'Membro Banido' },
    MEMBRO_DESBANIDO: { icon: '🔓', color: EmbedColors.SUCCESS, title: 'Membro Desbanido' },
    CONFIG_ALTERADA: { icon: '⚙️', color: EmbedColors.INFO, title: 'Configuracao Alterada' },
    PUNICAO_APLICADA: { icon: '⚠️', color: EmbedColors.ERROR, title: 'Punicao Aplicada' },
    PUNICAO_REMOVIDA: { icon: '✅', color: EmbedColors.SUCCESS, title: 'Punicao Removida' }
  };

  return styles[acao] || { icon: '📋', color: EmbedColors.NEUTRAL, title: acao };
}

// =============================================================================
// Funções de Consulta de Logs
// =============================================================================

/**
 * Busca logs por servidor com paginação
 * @param guildId - ID do servidor
 * @param page - Número da página (começa em 1)
 * @param pageSize - Quantidade de itens por página
 * @returns Logs paginados
 */
export async function buscarLogs(
  guildId: string,
  page: number = 1,
  pageSize: number = 20
) {
  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where: { guildId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.log.count({ where: { guildId } })
  ]);

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * Busca logs por tipo de ação
 * @param guildId - ID do servidor
 * @param acao - Tipo de ação
 * @param limit - Limite de resultados
 * @returns Lista de logs
 */
export async function buscarLogsPorAcao(
  guildId: string,
  acao: LogAction,
  limit: number = 50
) {
  return prisma.log.findMany({
    where: { guildId, acao },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

/**
 * Busca logs de um usuário específico (como executor ou alvo)
 * @param guildId - ID do servidor
 * @param userId - ID do usuário
 * @param limit - Limite de resultados
 * @returns Lista de logs
 */
export async function buscarLogsPorUsuario(
  guildId: string,
  userId: string,
  limit: number = 50
) {
  return prisma.log.findMany({
    where: {
      guildId,
      OR: [
        { executorId: userId },
        { alvoId: userId }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

/**
 * Busca logs por período
 * @param guildId - ID do servidor
 * @param dataInicio - Data de início
 * @param dataFim - Data de fim
 * @returns Lista de logs
 */
export async function buscarLogsPorPeriodo(
  guildId: string,
  dataInicio: Date,
  dataFim: Date
) {
  return prisma.log.findMany({
    where: {
      guildId,
      createdAt: {
        gte: dataInicio,
        lte: dataFim
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// =============================================================================
// Atalhos para Logs Comuns
// =============================================================================

/**
 * Registra log de Set solicitado
 */
export async function logSetSolicitado(
  guildId: string,
  solicitanteId: string,
  solicitanteNome: string,
  dados: string
): Promise<void> {
  await registrarLog({
    guildId,
    acao: 'SET_SOLICITADO',
    executorId: solicitanteId,
    executorNome: solicitanteNome,
    detalhes: dados
  });
}

/**
 * Registra log de Set aprovado
 */
export async function logSetAprovado(
  guildId: string,
  aprovadorId: string,
  aprovadorNome: string,
  solicitanteId: string,
  solicitanteNome: string
): Promise<void> {
  await registrarLog({
    guildId,
    acao: 'SET_APROVADO',
    executorId: aprovadorId,
    executorNome: aprovadorNome,
    alvoId: solicitanteId,
    alvoNome: solicitanteNome
  });
}

/**
 * Registra log de Set reprovado
 */
export async function logSetReprovado(
  guildId: string,
  aprovadorId: string,
  aprovadorNome: string,
  solicitanteId: string,
  solicitanteNome: string,
  motivo?: string
): Promise<void> {
  await registrarLog({
    guildId,
    acao: 'SET_REPROVADO',
    executorId: aprovadorId,
    executorNome: aprovadorNome,
    alvoId: solicitanteId,
    alvoNome: solicitanteNome,
    detalhes: motivo ? `Motivo: ${motivo}` : undefined
  });
}

/**
 * Registra log de alteração de cargo
 */
export async function logCargoAlterado(
  guildId: string,
  executorId: string,
  executorNome: string,
  alvoId: string,
  alvoNome: string,
  cargoAntigo: string,
  cargoNovo: string
): Promise<void> {
  await registrarLog({
    guildId,
    acao: 'CARGO_ALTERADO',
    executorId,
    executorNome,
    alvoId,
    alvoNome,
    detalhes: `Cargo alterado de "${cargoAntigo || 'Nenhum'}" para "${cargoNovo}"`
  });
}

/**
 * Registra log de adição à blacklist
 */
export async function logBlacklistAdd(
  guildId: string,
  executorId: string,
  executorNome: string,
  alvoId: string,
  alvoNome: string,
  motivo: string
): Promise<void> {
  await registrarLog({
    guildId,
    acao: 'BLACKLIST_ADICIONADO',
    executorId,
    executorNome,
    alvoId,
    alvoNome,
    detalhes: `Motivo: ${motivo}`
  });
}

/**
 * Registra log de remoção da blacklist
 */
export async function logBlacklistRemove(
  guildId: string,
  executorId: string,
  executorNome: string,
  alvoId: string,
  alvoNome: string
): Promise<void> {
  await registrarLog({
    guildId,
    acao: 'BLACKLIST_REMOVIDO',
    executorId,
    executorNome,
    alvoId,
    alvoNome
  });
}
