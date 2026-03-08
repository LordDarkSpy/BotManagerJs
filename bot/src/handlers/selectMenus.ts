// =============================================================================
// BotManagerJs - Handler de Menus de Seleção
// =============================================================================
// Este arquivo processa interações de menus de seleção (select menus).
// Usado principalmente para seleção de membros e cargos.
// =============================================================================

import { 
  StringSelectMenuInteraction, 
  GuildMember,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { prisma } from '../config/database.js';
import { 
  createSuccessEmbed, 
  createErrorEmbed,
  createCargoChangeEmbed
} from '../utils/embeds.js';
import { 
  canManageCargos, 
  canSetCargo,
  PermissionErrors 
} from '../utils/permissions.js';
import { logCargoAlterado } from '../services/log.service.js';
import { atualizarNickname } from '../utils/nickname.js';


// =============================================================================
// Handler Principal
// =============================================================================

/**
 * Processa interações de menus de seleção
 * @param interaction - Interação de menu de seleção
 */
export async function handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<void> {
  const { customId } = interaction;

  console.log(`[SelectMenu] ${interaction.user.tag} selecionou em: ${customId}`);

  // Roteia para o handler correto
  if (customId === 'cargo_select_member') {
    await handleCargoSelectMember(interaction);
  } else if (customId.startsWith('cargo_set_')) {
    const membroId = customId.replace('cargo_set_', '');
    await handleCargoSetCargo(interaction, membroId);
  } else {
    console.warn(`[SelectMenu] Menu desconhecido: ${customId}`);
    await interaction.reply({
      embeds: [createErrorEmbed('Erro', 'Este menu não está mais disponível.')],
      ephemeral: true
    });
  }
}

// =============================================================================
// Handler de Seleção de Membro para Gestão de Cargos
// =============================================================================

/**
 * Processa a seleção de um membro para gestão de cargos
 */
async function handleCargoSelectMember(interaction: StringSelectMenuInteraction): Promise<void> {
  const guildId = interaction.guildId!;
  const member = interaction.member as GuildMember;
  const membroId = interaction.values[0]; // ID do membro selecionado

  // Verifica permissão
  const canManage = await canManageCargos(member, guildId);
  if (!canManage) {
    await interaction.reply({
      embeds: [createErrorEmbed('Sem Permissão', PermissionErrors.CANNOT_MANAGE_CARGOS)],
      ephemeral: true
    });
    return;
  }

  // Busca o membro selecionado
  const membroSelecionado = await prisma.membro.findUnique({
    where: { id: membroId },
    include: { cargo: true }
  });

  if (!membroSelecionado) {
    await interaction.reply({
      embeds: [createErrorEmbed('Erro', 'Membro não encontrado.')],
      ephemeral: true
    });
    return;
  }

  // Busca cargos disponíveis
  const cargos = await prisma.cargo.findMany({
    where: { guildId },
    orderBy: { hierarquia: 'asc' }
  });

  if (cargos.length === 0) {
    await interaction.reply({
      embeds: [createErrorEmbed(
        'Sem Cargos',
        'Não há cargos cadastrados. Use `/cargo-cadastrar` para criar cargos.'
      )],
      ephemeral: true
    });
    return;
  }

  // Cria botões para cada cargo
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  let currentRow = new ActionRowBuilder<ButtonBuilder>();

  for (let i = 0; i < cargos.length; i++) {
    const cargo = cargos[i];
    const isCurrentCargo = membroSelecionado.cargoId === cargo.id;

    const button = new ButtonBuilder()
      .setCustomId(`cargo_change_${membroId}_${cargo.id}`)
      .setLabel(cargo.nome)
      .setStyle(isCurrentCargo ? ButtonStyle.Primary : ButtonStyle.Secondary)
      .setDisabled(isCurrentCargo);

    currentRow.addComponents(button);

    // Discord permite no máximo 5 botões por linha
    if ((i + 1) % 5 === 0 || i === cargos.length - 1) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder<ButtonBuilder>();
    }
  }

  await interaction.update({
    content: `**Gerenciando:** ${membroSelecionado.nome}\n**Cargo atual:** ${membroSelecionado.cargo?.nome || 'Nenhum'}\n\nSelecione o novo cargo:`,
    components: rows
  });
}

/**
 * Processa a definição de um novo cargo para um membro
 */
async function handleCargoSetCargo(
  interaction: StringSelectMenuInteraction, 
  membroId: string
): Promise<void> {
  const guildId = interaction.guildId!;
  const member = interaction.member as GuildMember;
  const cargoId = interaction.values[0]; // ID do cargo selecionado

  // Verifica permissão básica
  const canManage = await canManageCargos(member, guildId);
  if (!canManage) {
    await interaction.reply({
      embeds: [createErrorEmbed('Sem Permissão', PermissionErrors.CANNOT_MANAGE_CARGOS)],
      ephemeral: true
    });
    return;
  }

  // Verifica se pode definir este cargo específico (hierarquia)
  const canSet = await canSetCargo(member, cargoId, guildId);
  if (!canSet) {
    await interaction.reply({
      embeds: [createErrorEmbed('Sem Permissão', PermissionErrors.CANNOT_SET_CARGO)],
      ephemeral: true
    });
    return;
  }

  await interaction.deferUpdate();

  try {
    // Busca membro e cargos
    const [membro, novoCargo] = await Promise.all([
      prisma.membro.findUnique({
        where: { id: membroId },
        include: { cargo: true }
      }),
      prisma.cargo.findUnique({
        where: { id: cargoId }
      })
    ]);

    if (!membro || !novoCargo) {
      await interaction.followUp({
        embeds: [createErrorEmbed('Erro', 'Membro ou cargo não encontrado.')],
        ephemeral: true
      });
      return;
    }

    const cargoAntigoNome = membro.cargo?.nome || 'Nenhum';

    // Atualiza o cargo do membro
    await prisma.membro.update({
      where: { id: membroId },
      data: { cargoId }
    });

    // Tenta atualizar o cargo no Discord
    if (novoCargo.discordRoleId) {
      try {
        const guild = interaction.guild!;
        const discordMember = await guild.members.fetch(membro.discordId);
        
        // Remove cargo antigo do Discord se existir
        if (membro.cargo?.discordRoleId) {
          const oldRole = guild.roles.cache.get(membro.cargo.discordRoleId);
          if (oldRole) {
            await discordMember.roles.remove(oldRole);
          }
        }

        // Adiciona novo cargo do Discord
        const newRole = guild.roles.cache.get(novoCargo.discordRoleId);
        if (newRole) {
          await discordMember.roles.add(newRole);
        }

        // Dentro da funcao handleCargoSetCargo, apos adicionar o cargo:
        await atualizarNickname(
          discordMember,
          novoCargo.prefixo,
          membro.nome,
          membro.idJogo || membro.discordId
        );
      } catch (error) {
        console.error('[SelectMenu] Erro ao atualizar cargo no Discord:', error);
      }
    }

    

    // Registra log
    await logCargoAlterado(
      guildId,
      interaction.user.id,
      interaction.user.username,
      membro.discordId,
      membro.nome,
      cargoAntigoNome,
      novoCargo.nome
    );

    // Busca o usuário do Discord para o embed
    const discordUser = await interaction.client.users.fetch(membro.discordId);

    // Atualiza a mensagem
    await interaction.editReply({
      content: null,
      embeds: [createCargoChangeEmbed(
        membro.nome,
        cargoAntigoNome,
        novoCargo.nome,
        interaction.user
      )],
      components: []
    });
  } catch (error) {
    console.error('[SelectMenu] Erro ao alterar cargo:', error);
    await interaction.followUp({
      embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao alterar o cargo.')],
      ephemeral: true
    });
  }
}

// =============================================================================
// Funções Auxiliares
// =============================================================================

/**
 * Gera um ID único para transações
 * Formato: FGTS-AAAAMMDDHHMM-XXXX (onde XXXX é aleatório)
 */
export function generateTransactionId(): string {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 12);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FGTS-${dateStr}-${random}`;
}
