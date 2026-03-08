// =============================================================================
// BotManagerJs - Comando /caixa-button
// =============================================================================
// Este comando gera uma mensagem com o botão para registrar movimentações de caixa.
// Membros podem usar o botão para informar entradas e saídas financeiras.
// =============================================================================
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } from 'discord.js';
import { createCaixaButtonEmbed, createErrorEmbed } from '../utils/embeds.js';
// =============================================================================
// Definição do Comando
// =============================================================================
export const command = {
    // Configuração do comando slash
    data: new SlashCommandBuilder()
        .setName('caixa-button')
        .setDescription('Gera uma mensagem com o botão para registrar movimentações de caixa')
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
            // Cria o embed de movimentação de caixa
            const embed = createCaixaButtonEmbed();
            // Cria o botão de movimentação de caixa
            const button = new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setCustomId('caixa_open')
                .setLabel('Registrar Movimentação')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('💼'));
            // Envia a mensagem no canal especificado
            await targetChannel.send({
                embeds: [embed],
                components: [button]
            });
            await interaction.editReply({
                content: `Mensagem de movimentação de caixa enviada com sucesso em <#${targetChannel.id}>!`
            });
            console.log(`[CaixaButton] Botão de caixa gerado em ${interaction.guild?.name} por ${interaction.user.tag}`);
        }
        catch (error) {
            console.error('[CaixaButton] Erro ao gerar botão:', error);
            await interaction.editReply({
                embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao gerar o botão de caixa.')]
            });
        }
    }
};
export default command;
//# sourceMappingURL=caixa-button.js.map