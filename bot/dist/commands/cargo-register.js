// =============================================================================
// BotManagerJs - Comando /cargo-cadastrar
// =============================================================================
// Este comando permite cadastrar novos cargos na hierarquia da organização.
// Os cargos são usados para controle de permissões e promoções.
// =============================================================================
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../config/database.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';
import { registrarLog } from '../services/log.service.js';
// =============================================================================
// Definição do Comando
// =============================================================================
export const command = {
    // Configuração do comando slash
    data: new SlashCommandBuilder()
        .setName('cargo-cadastrar')
        .setDescription('Cadastra um novo cargo na hierarquia da organização')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option
        .setName('nome')
        .setDescription('Nome do cargo')
        .setRequired(true)
        .setMaxLength(50))
        .addIntegerOption(option => option
        .setName('hierarquia')
        .setDescription('Nível hierárquico (1 = mais baixo, maior = mais alto)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
        .addRoleOption(option => option
        .setName('cargo-discord')
        .setDescription('Cargo do Discord para sincronização (opcional)')
        .setRequired(false))
        .addStringOption(option => option
        .setName('prefixo')
        .setDescription('Prefixo do cargo para nickname (ex: [ADM])')
        .setRequired(false)
        .setMaxLength(10)),
    // Apenas administradores podem usar
    adminOnly: true,
    // Função de execução
    async execute(interaction) {
        const guildId = interaction.guildId;
        // Obtém os parâmetros
        const nome = interaction.options.getString('nome', true).trim();
        const hierarquia = interaction.options.getInteger('hierarquia', true);
        const cargoDiscord = interaction.options.getRole('cargo-discord');
        const prefixo = interaction.options.getString('prefixo')?.trim() || null;
        // Valida a cor se fornecida
        // if (cor && !/^#[0-9A-Fa-f]{6}$/.test(cor)) {
        //   await interaction.reply({
        //     embeds: [createErrorEmbed(
        //       'Cor Inválida',
        //       'A cor deve estar no formato hexadecimal (ex: #FF5733).'
        //     )],
        //     ephemeral: true
        //   });
        //   return;
        // }
        await interaction.deferReply({ ephemeral: true });
        try {
            // Verifica se já existe um cargo com o mesmo nome
            const cargoExistente = await prisma.cargo.findFirst({
                where: { guildId, nome }
            });
            if (cargoExistente) {
                await interaction.editReply({
                    embeds: [createErrorEmbed('Cargo já existe', `Já existe um cargo com o nome "${nome}". Escolha outro nome.`)]
                });
                return;
            }
            // Cria o cargo no banco de dados
            const novoCargo = await prisma.cargo.create({
                data: {
                    guildId,
                    nome,
                    hierarquia,
                    discordRoleId: cargoDiscord?.id || null,
                    prefixo
                }
            });
            // Registra log
            await registrarLog({
                guildId,
                acao: 'CARGO_CRIADO',
                executorId: interaction.user.id,
                executorNome: interaction.user.username,
                detalhes: `Cargo "${nome}" criado com hierarquia ${hierarquia}${cargoDiscord ? ` vinculado ao cargo Discord @${cargoDiscord.name}` : ''}`
            });
            // Monta descrição do sucesso
            let descricao = `Cargo **${nome}** cadastrado com sucesso!\n\n`;
            descricao += `**Hierarquia:** ${hierarquia}\n`;
            if (cargoDiscord) {
                descricao += `**Cargo Discord:** <@&${cargoDiscord.id}>\n`;
            }
            if (prefixo) {
                descricao += `**Prefixo:** ${prefixo}\n`;
            }
            await interaction.editReply({
                embeds: [createSuccessEmbed('Cargo Cadastrado', descricao)]
            });
            console.log(`[CargoCadastrar] Cargo "${nome}" criado em ${interaction.guild?.name} por ${interaction.user.tag}`);
        }
        catch (error) {
            console.error('[CargoCadastrar] Erro ao cadastrar cargo:', error);
            await interaction.editReply({
                embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao cadastrar o cargo.')]
            });
        }
    }
};
export default command;
//# sourceMappingURL=cargo-register.js.map