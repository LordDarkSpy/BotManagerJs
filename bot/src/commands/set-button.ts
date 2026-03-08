// =============================================================================
// BotManagerJs - Comando /set-button
// =============================================================================
// Este comando gera uma mensagem com o botão para solicitar Set.
// Apenas administradores podem usar este comando.
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
import { prisma } from '../config/database.js';
import { SlashCommand } from '../types/index.js';
import { createSetButtonEmbed, createErrorEmbed } from '../utils/embeds.js';

// =============================================================================
// Definição do Comando
// =============================================================================

export const command: SlashCommand = {
  // Configuração do comando slash
  data: new SlashCommandBuilder()
    .setName('set-button')
    .setDescription('Gera uma mensagem com o botão para solicitar Set')
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
    const guildId = interaction.guildId!;

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
      // Busca configuração do bot para personalização
      const config = await prisma.configuracao.findUnique({
        where: { guildId }
      });

      // Cria o embed com as informações de solicitação de Set
      const embed = createSetButtonEmbed(
        config?.botName || undefined,
        config?.botImage || undefined
      );

      // Cria o botão de solicitar Set
      const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('set_open')
          .setLabel('Solicitar Set')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📋')
      );

      // Envia a mensagem no canal especificado
      await targetChannel.send({
        embeds: [embed],
        components: [button]
      });

      await interaction.editReply({
        content: `Mensagem de solicitação de Set enviada com sucesso em <#${targetChannel.id}>!`
      });

      console.log(`[SetButton] Botão de Set gerado em ${interaction.guild?.name} por ${interaction.user.tag}`);
    } catch (error) {
      console.error('[SetButton] Erro ao gerar botão:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao gerar o botão de Set.')]
      });
    }
  }
};

export default command;
