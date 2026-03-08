// =============================================================================
// BotManagerJs - Comando /ausencia-button
// =============================================================================
// Este comando gera uma mensagem com o botão para registrar ausências.
// Membros podem usar o botão para informar períodos de ausência.
// =============================================================================
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } from 'discord.js';
import { createAusenciaButtonEmbed, createErrorEmbed } from '../utils/embeds.js';
// =============================================================================
// Definição do Comando
// =============================================================================
export const command = {
    // Configuração do comando slash
    data: new SlashCommandBuilder()
        .setName('ausencia-button')
        .setDescription('Gera uma mensagem com o botão para registrar ausências')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => option
        .setName('canal')
        .setDescription('Canal onde a mensagem será enviada (padrão: canal atual)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)),
    // Apenas administradores podem usar
    adminOnly: true,
    // Função de execução
    async execute(interaction) {
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
            // Cria o embed de registro de ausência
            const embed = createAusenciaButtonEmbed();
            // Cria o botão de registro de ausência
            const button = new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setCustomId('ausencia_open')
                .setLabel('Registrar Ausência')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🗓️'));
            // Envia a mensagem no canal especificado
            await targetChannel.send({
                embeds: [embed],
                components: [button]
            });
            await interaction.editReply({
                content: `Mensagem de registro de ausência enviada com sucesso em <#${targetChannel.id}>!`
            });
            console.log(`[AusenciaButton] Botão de ausência gerado em ${interaction.guild?.name} por ${interaction.user.tag}`);
        }
        catch (error) {
            console.error('[AusenciaButton] Erro ao gerar botão:', error);
            await interaction.editReply({
                embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao gerar o botão de ausência.')]
            });
        }
    }
};
export default command;
//# sourceMappingURL=ausencia-button.js.map