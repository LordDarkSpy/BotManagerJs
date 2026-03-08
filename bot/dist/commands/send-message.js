// =============================================================================
// BotManagerJs - Comando /mensagem
// =============================================================================
// Este comando permite enviar mensagens formatadas para canais ou DMs.
// Útil para anúncios, comunicados e mensagens personalizadas.
// =============================================================================
import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from 'discord.js';
import { EmbedColors } from '../types/index.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';
// =============================================================================
// Definição do Comando
// =============================================================================
export const command = {
    // Configuração do comando slash
    data: new SlashCommandBuilder()
        .setName('mensagem')
        .setDescription('Envia uma mensagem formatada para um canal ou usuário')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option
        .setName('tipo')
        .setDescription('Tipo de destino da mensagem')
        .setRequired(true)
        .addChoices({ name: 'Canal', value: 'canal' }, { name: 'DM (Mensagem Direta)', value: 'dm' }))
        .addStringOption(option => option
        .setName('mensagem')
        .setDescription('Conteúdo da mensagem')
        .setRequired(true)
        .setMaxLength(2000))
        .addChannelOption(option => option
        .setName('canal')
        .setDescription('Canal de destino (se tipo for Canal)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false))
        .addUserOption(option => option
        .setName('usuario')
        .setDescription('Usuário de destino (se tipo for DM)')
        .setRequired(false))
        .addStringOption(option => option
        .setName('titulo')
        .setDescription('Título do embed (opcional)')
        .setRequired(false)
        .setMaxLength(256))
        .addStringOption(option => option
        .setName('cor')
        .setDescription('Cor do embed em hexadecimal (ex: #FF5733)')
        .setRequired(false)
        .setMaxLength(7))
        .addBooleanOption(option => option
        .setName('embed')
        .setDescription('Enviar como embed? (padrão: sim)')
        .setRequired(false)),
    // Apenas administradores podem usar
    adminOnly: true,
    // Função de execução
    async execute(interaction) {
        // Obtém os parâmetros
        const tipo = interaction.options.getString('tipo', true);
        const mensagem = interaction.options.getString('mensagem', true);
        const canal = interaction.options.getChannel('canal');
        const usuario = interaction.options.getUser('usuario');
        const titulo = interaction.options.getString('titulo');
        const corStr = interaction.options.getString('cor');
        const useEmbed = interaction.options.getBoolean('embed') ?? true;
        // Valida destino baseado no tipo
        if (tipo === 'canal' && !canal) {
            await interaction.reply({
                embeds: [createErrorEmbed('Canal não especificado', 'Você selecionou enviar para um canal, mas não especificou qual canal.')],
                ephemeral: true
            });
            return;
        }
        if (tipo === 'dm' && !usuario) {
            await interaction.reply({
                embeds: [createErrorEmbed('Usuário não especificado', 'Você selecionou enviar DM, mas não especificou qual usuário.')],
                ephemeral: true
            });
            return;
        }
        // Parseia a cor se fornecida
        let cor = EmbedColors.PRIMARY;
        if (corStr) {
            if (!/^#[0-9A-Fa-f]{6}$/.test(corStr)) {
                await interaction.reply({
                    embeds: [createErrorEmbed('Cor Inválida', 'A cor deve estar no formato hexadecimal (ex: #FF5733).')],
                    ephemeral: true
                });
                return;
            }
            cor = parseInt(corStr.replace('#', ''), 16);
        }
        await interaction.deferReply({ ephemeral: true });
        try {
            // Monta a mensagem
            let messageContent;
            if (useEmbed) {
                const embed = new EmbedBuilder()
                    .setColor(cor)
                    .setDescription(mensagem)
                    .setTimestamp();
                if (titulo) {
                    embed.setTitle(titulo);
                }
                embed.setFooter({
                    text: `Enviado por ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                });
                messageContent = { embeds: [embed] };
            }
            else {
                messageContent = { content: mensagem };
            }
            // Envia a mensagem
            if (tipo === 'canal' && canal) {
                await canal.send(messageContent);
                await interaction.editReply({
                    embeds: [createSuccessEmbed('Mensagem Enviada', `Mensagem enviada com sucesso para <#${canal.id}>!`)]
                });
                console.log(`[Mensagem] Enviada para canal ${canal.name} por ${interaction.user.tag}`);
            }
            else if (tipo === 'dm' && usuario) {
                try {
                    await usuario.send(messageContent);
                    await interaction.editReply({
                        embeds: [createSuccessEmbed('Mensagem Enviada', `Mensagem enviada com sucesso para ${usuario.tag}!`)]
                    });
                    console.log(`[Mensagem] Enviada para DM de ${usuario.tag} por ${interaction.user.tag}`);
                }
                catch (dmError) {
                    await interaction.editReply({
                        embeds: [createErrorEmbed('Erro ao Enviar DM', `Não foi possível enviar DM para ${usuario.tag}. ` +
                                'O usuário pode ter DMs desabilitadas ou bloqueou o bot.')]
                    });
                }
            }
        }
        catch (error) {
            console.error('[Mensagem] Erro ao enviar mensagem:', error);
            await interaction.editReply({
                embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao enviar a mensagem.')]
            });
        }
    }
};
export default command;
//# sourceMappingURL=send-message.js.map