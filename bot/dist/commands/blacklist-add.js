// =============================================================================
// BotManagerJs - Comando /blacklist-add
// =============================================================================
// Este comando adiciona um usuário à blacklist, impedindo que ele solicite Set.
// Útil para banir usuários problemáticos ou que violaram regras.
// =============================================================================
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../config/database.js';
import { createBlacklistAddedEmbed, createErrorEmbed } from '../utils/embeds.js';
import { logBlacklistAdd } from '../services/log.service.js';
// =============================================================================
// Definição do Comando
// =============================================================================
export const command = {
    // Configuração do comando slash
    data: new SlashCommandBuilder()
        .setName('blacklist-add')
        .setDescription('Adiciona um usuário à blacklist')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option
        .setName('usuario')
        .setDescription('Usuário a ser adicionado à blacklist')
        .setRequired(true))
        .addStringOption(option => option
        .setName('motivo')
        .setDescription('Motivo do banimento')
        .setRequired(true)
        .setMaxLength(500))
        .addIntegerOption(option => option
        .setName('duracao')
        .setDescription('Duração em dias (deixe vazio para permanente)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(365)),
    // Apenas administradores podem usar
    adminOnly: true,
    // Função de execução
    async execute(interaction) {
        const guildId = interaction.guildId;
        // Obtém os parâmetros
        const usuario = interaction.options.getUser('usuario', true);
        const motivo = interaction.options.getString('motivo', true).trim();
        const duracao = interaction.options.getInteger('duracao');
        // Não permite adicionar a si mesmo
        if (usuario.id === interaction.user.id) {
            await interaction.reply({
                embeds: [createErrorEmbed('Erro', 'Você não pode adicionar a si mesmo à blacklist.')],
                ephemeral: true
            });
            return;
        }
        // Não permite adicionar o bot
        if (usuario.id === interaction.client.user?.id) {
            await interaction.reply({
                embeds: [createErrorEmbed('Erro', 'Você não pode adicionar o bot à blacklist.')],
                ephemeral: true
            });
            return;
        }
        await interaction.deferReply();
        try {
            // Verifica se já está na blacklist
            const existente = await prisma.blacklist.findUnique({
                where: { guildId_discordId: { guildId, discordId: usuario.id } }
            });
            if (existente) {
                await interaction.editReply({
                    embeds: [createErrorEmbed('Já na Blacklist', `${usuario.username} já está na blacklist.\nMotivo: ${existente.motivo}`)]
                });
                return;
            }
            // Calcula data de expiração se duração foi fornecida
            let dataExpiracao = null;
            if (duracao) {
                dataExpiracao = new Date();
                dataExpiracao.setDate(dataExpiracao.getDate() + duracao);
            }
            // Adiciona à blacklist
            await prisma.blacklist.create({
                data: {
                    guildId,
                    discordId: usuario.id,
                    nome: usuario.username,
                    motivo,
                    adicionadoPorId: interaction.user.id,
                    adicionadoPorNome: interaction.user.username,
                    dataExpiracao
                }
            });
            // Remove o usuário da organização se for membro
            await prisma.membro.updateMany({
                where: { guildId, discordId: usuario.id },
                data: { status: 'BANIDO' }
            });
            // Registra log
            await logBlacklistAdd(guildId, interaction.user.id, interaction.user.username, usuario.id, usuario.username, motivo);
            // Cria embed de confirmação
            const embed = createBlacklistAddedEmbed(usuario.username, motivo, interaction.user);
            if (dataExpiracao) {
                embed.addFields({
                    name: '⏰ Expira em',
                    value: `<t:${Math.floor(dataExpiracao.getTime() / 1000)}:F>`,
                    inline: true
                });
            }
            else {
                embed.addFields({
                    name: '⏰ Duração',
                    value: 'Permanente',
                    inline: true
                });
            }
            await interaction.editReply({ embeds: [embed] });
            // Tenta notificar o usuário via DM
            try {
                await usuario.send({
                    embeds: [createErrorEmbed('Você foi adicionado à Blacklist', `Você foi adicionado à blacklist do servidor **${interaction.guild?.name}**.\n\n` +
                            `**Motivo:** ${motivo}\n` +
                            `${dataExpiracao ? `**Expira em:** <t:${Math.floor(dataExpiracao.getTime() / 1000)}:F>` : '**Duração:** Permanente'}`)]
                });
            }
            catch {
                console.log(`[Blacklist] Não foi possível enviar DM para ${usuario.tag}`);
            }
            console.log(`[BlacklistAdd] ${usuario.tag} adicionado à blacklist por ${interaction.user.tag}`);
        }
        catch (error) {
            console.error('[BlacklistAdd] Erro ao adicionar à blacklist:', error);
            await interaction.editReply({
                embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao adicionar à blacklist.')]
            });
        }
    }
};
export default command;
//# sourceMappingURL=blacklist-add.js.map