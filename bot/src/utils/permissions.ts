// =============================================================================
// BotManagerJs - Sistema de Verificação de Permissões
// =============================================================================
// Este arquivo contém funções para verificar se um usuário tem permissão
// para executar determinadas ações no bot.
// =============================================================================

import { GuildMember, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../config/database.js';

// =============================================================================
// Verificação de Cargos Configurados
// =============================================================================

/**
 * Verifica se um membro tem o cargo de aprovador de Set
 * @param member - Membro do Discord a ser verificado
 * @param guildId - ID do servidor
 * @returns true se o membro pode aprovar Sets
 */
export async function canApproveSet(member: GuildMember, guildId: string): Promise<boolean> {
  // Administradores sempre podem
  if (member.permissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  // Busca configuração do servidor
  const config = await prisma.configuracao.findUnique({
    where: { guildId }
  });

  // Se não há configuração ou cargo definido, apenas admins podem
  if (!config?.cargoAprovadorSet) {
    return false;
  }

  // Verifica se o membro possui o cargo configurado
  return member.roles.cache.has(config.cargoAprovadorSet);
}

/**
 * Verifica se um membro tem o cargo de gestor de cargos
 * @param member - Membro do Discord a ser verificado
 * @param guildId - ID do servidor
 * @returns true se o membro pode gerenciar cargos
 */
export async function canManageCargos(member: GuildMember, guildId: string): Promise<boolean> {
  // Administradores sempre podem
  if (member.permissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  // Busca configuração do servidor
  const config = await prisma.configuracao.findUnique({
    where: { guildId }
  });

  // Se não há configuração ou cargo definido, apenas admins podem
  if (!config?.cargoGestorCargos) {
    return false;
  }

  // Verifica se o membro possui o cargo configurado
  return member.roles.cache.has(config.cargoGestorCargos);
}

/**
 * Verifica se um membro é administrador do bot
 * @param member - Membro do Discord a ser verificado
 * @param guildId - ID do servidor
 * @returns true se o membro é administrador do bot
 */
export async function isBotAdmin(member: GuildMember, guildId: string): Promise<boolean> {
  // Administradores do servidor sempre são admins do bot
  if (member.permissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  // Busca configuração do servidor
  const config = await prisma.configuracao.findUnique({
    where: { guildId }
  });

  // Se há cargo de administrador configurado, verifica
  if (config?.cargoAdministrador) {
    return member.roles.cache.has(config.cargoAdministrador);
  }

  return false;
}

// =============================================================================
// Verificação de Hierarquia de Cargos
// =============================================================================

/**
 * Verifica se um membro pode alterar o cargo de outro membro
 * Baseado na hierarquia de cargos cadastrada no banco de dados
 * @param executor - Membro que está executando a ação
 * @param alvo - Membro que terá o cargo alterado
 * @param guildId - ID do servidor
 * @returns true se o executor pode alterar o cargo do alvo
 */
export async function canChangeMemberCargo(
  executor: GuildMember,
  alvo: GuildMember,
  guildId: string
): Promise<boolean> {
  // Não pode alterar próprio cargo
  if (executor.id === alvo.id) {
    return false;
  }

  // Administradores podem alterar qualquer cargo
  if (executor.permissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  // Busca os membros no banco de dados
  const [executorMembro, alvoMembro] = await Promise.all([
    prisma.membro.findUnique({
      where: { guildId_discordId: { guildId, discordId: executor.id } },
      include: { cargo: true }
    }),
    prisma.membro.findUnique({
      where: { guildId_discordId: { guildId, discordId: alvo.id } },
      include: { cargo: true }
    })
  ]);

  // Se o executor não está cadastrado ou não tem cargo, não pode alterar
  if (!executorMembro?.cargo) {
    return false;
  }

  // Se o alvo não está cadastrado ou não tem cargo, o executor pode definir
  if (!alvoMembro?.cargo) {
    return true;
  }

  // Compara hierarquias: executor precisa ter hierarquia maior que o alvo
  return executorMembro.cargo.hierarquia > alvoMembro.cargo.hierarquia;
}

/**
 * Verifica se um membro pode definir um determinado cargo para outro membro
 * @param executor - Membro que está executando a ação
 * @param cargoId - ID do cargo a ser definido
 * @param guildId - ID do servidor
 * @returns true se o executor pode definir este cargo
 */
export async function canSetCargo(
  executor: GuildMember,
  cargoId: string,
  guildId: string
): Promise<boolean> {
  // Administradores podem definir qualquer cargo
  if (executor.permissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  // Busca o cargo a ser definido
  const cargoAlvo = await prisma.cargo.findUnique({
    where: { id: cargoId }
  });

  if (!cargoAlvo) {
    return false;
  }

  // Busca o membro executor
  const executorMembro = await prisma.membro.findUnique({
    where: { guildId_discordId: { guildId, discordId: executor.id } },
    include: { cargo: true }
  });

  // Se o executor não tem cargo, não pode definir cargos
  if (!executorMembro?.cargo) {
    return false;
  }

  // Só pode definir cargos de hierarquia menor que a sua
  return executorMembro.cargo.hierarquia > cargoAlvo.hierarquia;
}

// =============================================================================
// Verificação de Blacklist
// =============================================================================

/**
 * Verifica se um usuário está na blacklist
 * @param discordId - ID Discord do usuário
 * @param guildId - ID do servidor
 * @returns Objeto da blacklist se banido, null se não
 */
export async function checkBlacklist(
  discordId: string,
  guildId: string
): Promise<{ motivo: string; dataAdicao: Date } | null> {
  const blacklistEntry = await prisma.blacklist.findUnique({
    where: { guildId_discordId: { guildId, discordId } }
  });

  if (!blacklistEntry) {
    return null;
  }

  // Verifica se o banimento expirou
  if (blacklistEntry.dataExpiracao && blacklistEntry.dataExpiracao < new Date()) {
    // Remove automaticamente se expirou
    await prisma.blacklist.delete({
      where: { id: blacklistEntry.id }
    });
    return null;
  }

  return {
    motivo: blacklistEntry.motivo,
    dataAdicao: blacklistEntry.createdAt
  };
}

// =============================================================================
// Verificação de Membro Cadastrado
// =============================================================================

/**
 * Verifica se um usuário está cadastrado como membro
 * @param discordId - ID Discord do usuário
 * @param guildId - ID do servidor
 * @returns Dados do membro se cadastrado, null se não
 */
export async function getMembro(discordId: string, guildId: string) {
  return prisma.membro.findUnique({
    where: { guildId_discordId: { guildId, discordId } },
    include: { cargo: true }
  });
}

/**
 * Verifica se um usuário já tem uma solicitação de Set pendente
 * @param discordId - ID Discord do usuário
 * @param guildId - ID do servidor
 * @returns true se há solicitação pendente
 */
export async function hasPendingSetRequest(discordId: string, guildId: string): Promise<boolean> {
  const pendingRequest = await prisma.solicitacaoSet.findFirst({
    where: {
      guildId,
      solicitanteId: discordId,
      status: 'PENDENTE'
    }
  });

  return !!pendingRequest;
}

// =============================================================================
// Mensagens de Erro Padrão
// =============================================================================

/**
 * Mensagens de erro para falta de permissão
 */
export const PermissionErrors = {
  NOT_ADMIN: 'Você não tem permissão de administrador para executar este comando.',
  CANNOT_APPROVE_SET: 'Você não tem permissão para aprovar ou reprovar solicitações de Set.',
  CANNOT_MANAGE_CARGOS: 'Você não tem permissão para gerenciar cargos de membros.',
  CANNOT_CHANGE_CARGO: 'Você não pode alterar o cargo deste membro devido à hierarquia.',
  CANNOT_SET_CARGO: 'Você não pode definir este cargo devido à hierarquia.',
  IN_BLACKLIST: 'Você está na blacklist e não pode realizar esta ação.',
  NOT_MEMBER: 'Você não está cadastrado como membro da organização.',
  ALREADY_MEMBER: 'Você já está cadastrado como membro da organização.',
  PENDING_REQUEST: 'Você já possui uma solicitação de Set pendente.',
} as const;
