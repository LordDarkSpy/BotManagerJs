// =============================================================================
// BotManagerJs - Comando /blacklist-remove
// =============================================================================
// Este comando remove um usuário da blacklist, permitindo que ele solicite Set novamente.
// =============================================================================

import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  PermissionFlagsBits
} from 'discord.js';
import { prisma } from '../config/database.js';
import { SlashCommand } from '../types/index.js';
import { createBlacklistRemovedEmbed, createErrorEmbed, createSuccessEmbed } from '../utils/embeds.js';
import { logBlacklistRemove } from '../services/log.service.js';

// =============================================================================
// Definição do Comando
// =============================================================================

export const command: SlashCommand = {
  // Configuração do comando slash
  data: new SlashCommandBuilder()
    .setName('blacklist-remove')
    .setDescription('Remove um usuário da blacklist')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuário a ser removido da blacklist')
        .setRequired(true)
    ) as SlashCommandBuilder,

  // Apenas administradores podem usar
  adminOnly: true,

  // Função de execução
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId!;
    
    // Obtém o usuário
    const usuario = interaction.options.getUser('usuario', true);

    await interaction.deferReply();

    try {
      // Verifica se está na blacklist
      const existente = await prisma.blacklist.findUnique({
        where: { guildId_discordId: { guildId, discordId: usuario.id } }
      });

      if (!existente) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Não encontrado',
            `${usuario.username} não está na blacklist.`
          )]
        });
        return;
      }

      // Remove da blacklist
      await prisma.blacklist.delete({
        where: { id: existente.id }
      });

      // Registra log
      await logBlacklistRemove(
        guildId,
        interaction.user.id,
        interaction.user.username,
        usuario.id,
        usuario.username
      );

      // Cria embed de confirmação
      const embed = createBlacklistRemovedEmbed(usuario.username, interaction.user);

      await interaction.editReply({ embeds: [embed] });

      // Tenta notificar o usuário via DM
      try {
        await usuario.send({
          embeds: [createSuccessEmbed(
            'Removido da Blacklist',
            `Você foi removido da blacklist do servidor **${interaction.guild?.name}**.\n\n` +
            'Agora você pode solicitar Set novamente, se desejar.'
          )]
        });
      } catch {
        console.log(`[Blacklist] Não foi possível enviar DM para ${usuario.tag}`);
      }

      console.log(`[BlacklistRemove] ${usuario.tag} removido da blacklist por ${interaction.user.tag}`);
    } catch (error) {
      console.error('[BlacklistRemove] Erro ao remover da blacklist:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao remover da blacklist.')]
      });
    }
  }
};

export default command;
