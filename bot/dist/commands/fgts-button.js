// =============================================================================
// BotManagerJs - Comando /fgts-button
// =============================================================================
// Este comando gera uma mensagem com o botão para registrar pagamentos de FGTS.
// Membros podem usar o botão para informar depósitos realizados.
// =============================================================================
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } from 'discord.js';
import { createFgtsButtonEmbed, createErrorEmbed } from '../utils/embeds.js';
// =============================================================================
// Definição do Comando
// =============================================================================
export const command = {
    // Configuração do comando slash
    data: new SlashCommandBuilder()
        .setName('fgts-button')
        .setDescription('Gera uma mensagem com o botão para registrar pagamentos de FGTS')
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
            // Cria o embed de registro de FGTS
            const embed = createFgtsButtonEmbed();
            // Cria o botão de registro de FGTS
            const button = new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setCustomId('fgts_open')
                .setLabel('Registrar FGTS')
                .setStyle(ButtonStyle.Success)
                .setEmoji('💰'));
            // Envia a mensagem no canal especificado
            await targetChannel.send({
                embeds: [embed],
                components: [button]
            });
            await interaction.editReply({
                content: `Mensagem de registro de FGTS enviada com sucesso em <#${targetChannel.id}>!`
            });
            console.log(`[FgtsButton] Botão de FGTS gerado em ${interaction.guild?.name} por ${interaction.user.tag}`);
        }
        catch (error) {
            console.error('[FgtsButton] Erro ao gerar botão:', error);
            await interaction.editReply({
                embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao gerar o botão de FGTS.')]
            });
        }
    }
};
export default command;
//# sourceMappingURL=fgts-button.js.map