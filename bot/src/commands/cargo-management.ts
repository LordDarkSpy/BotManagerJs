// =============================================================================
// BotManagerJs - Comando /gestao-cargos
// =============================================================================
// Este comando gera uma mensagem com o botão para gestão de cargos.
// Permite que gestores promovam/rebaixem membros na hierarquia.
// =============================================================================

import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits
} from 'discord.js';
import { SlashCommand } from '../types/index.js';
import { createCargoManagementEmbed, createErrorEmbed } from '../utils/embeds.js';

// =============================================================================
// Definição do Comando
// =============================================================================

export const command: SlashCommand = {
  // Configuração do comando slash
  data: new SlashCommandBuilder()
    .setName('gestao-cargos')
    .setDescription('Gera uma mensagem com o botão para gestão de cargos')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal onde a mensagem será enviada (padrão: canal atual)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ) as SlashCommandBuilder,

  // Apenas administradores podem usar
  adminOnly: true,

  // Função de execução
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Obtém o canal (fornecido ou atual)
    const targetChannel = interaction.options.getChannel('canal') || interaction.channel;

    if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
      await interaction.reply({
        embeds: [createErrorEmbed('Erro', 'Canal inválido. Selecione um canal de texto.')],
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // Cria o embed de gestão de cargos
      const embed = createCargoManagementEmbed();

      // Cria o botão de gestão de cargos
      const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('cargo_open')
          .setLabel('Gerenciar Cargos')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⚙️')
      );

      // Envia a mensagem no canal especificado
      await targetChannel.send({
        embeds: [embed],
        components: [button]
      });

      await interaction.editReply({
        content: `Mensagem de gestão de cargos enviada com sucesso em <#${targetChannel.id}>!`
      });

      console.log(`[GestaoCargos] Botão de gestão gerado em ${interaction.guild?.name} por ${interaction.user.tag}`);
    } catch (error) {
      console.error('[GestaoCargos] Erro ao gerar botão:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao gerar o botão de gestão de cargos.')]
      });
    }
  }
};

export default command;
