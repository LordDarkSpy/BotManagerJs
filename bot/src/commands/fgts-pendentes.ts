// =============================================================================
// BotManagerJs - Comando /fgts-pendentes
// =============================================================================
// Este comando lista todos os membros que ainda nao pagaram o FGTS do mes.
// Pode mencionar os pendentes no canal para lembrete.
// =============================================================================

import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  TextChannel
} from 'discord.js';
import { prisma } from '../config/database.js';
import { SlashCommand, EmbedColors } from '../types/index.js';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embeds.js';

// =============================================================================
// Definicao do Comando
// =============================================================================

export const command: SlashCommand = {
  // Configuracao do comando slash
  data: new SlashCommandBuilder()
    .setName('fgts-pendentes')
    .setDescription('Lista membros que ainda nao pagaram o FGTS do mes')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption(option =>
      option
        .setName('mes')
        .setDescription('Mes de referencia (1-12). Padrao: mes atual')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(12)
    )
    .addIntegerOption(option =>
      option
        .setName('ano')
        .setDescription('Ano de referencia. Padrao: ano atual')
        .setRequired(false)
        .setMinValue(2020)
        .setMaxValue(2030)
    )
    .addBooleanOption(option =>
      option
        .setName('mencionar')
        .setDescription('Mencionar os membros pendentes? (envia no canal atual)')
        .setRequired(false)
    ) as SlashCommandBuilder,

  // Apenas administradores podem usar
  adminOnly: true,

  // Funcao de execucao
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId!;
    
    // Obtem mes/ano dos parametros ou usa atual
    const hoje = new Date();
    const mes = interaction.options.getInteger('mes') || (hoje.getMonth() + 1);
    const ano = interaction.options.getInteger('ano') || hoje.getFullYear();
    const mencionar = interaction.options.getBoolean('mencionar') || false;

    await interaction.deferReply({ ephemeral: !mencionar });

    try {
      // Busca todos os membros ativos
      const membrosAtivos = await prisma.membro.findMany({
        where: { 
          guildId, 
          status: { in: ['ATIVO', 'AUSENTE'] }
        },
        orderBy: { nome: 'asc' }
      });

      if (membrosAtivos.length === 0) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Sem Membros', 'Nao ha membros ativos cadastrados.')]
        });
        return;
      }

      // Busca pagamentos do periodo
      const pagamentos = await prisma.pagamentoFgts.findMany({
        where: {
          guildId,
          mesReferencia: mes,
          anoReferencia: ano
        }
      });

      // Cria set de quem pagou
      const membrosPagaram = new Set(pagamentos.map(p => p.membroId));
      
      // Filtra quem nao pagou
      const pendentes = membrosAtivos.filter(m => !membrosPagaram.has(m.id));

      const nomeMes = getNomeMes(mes);

      // Se todos pagaram
      if (pendentes.length === 0) {
        await interaction.editReply({
          embeds: [createSuccessEmbed(
            'Todos em Dia!',
            `Todos os **${membrosAtivos.length}** membros ja pagaram o FGTS de **${nomeMes}/${ano}**!`
          )]
        });
        return;
      }

      // Cria o embed
      const embed = new EmbedBuilder()
        .setColor(EmbedColors.WARNING)
        .setTitle(`FGTS Pendente - ${nomeMes}/${ano}`)
        .setDescription(
          `**${pendentes.length}** de **${membrosAtivos.length}** membros ainda nao pagaram o FGTS.\n\n` +
          `${mencionar ? 'Membros foram mencionados abaixo.' : 'Use a opcao `mencionar: true` para notificar os pendentes.'}`
        )
        .setTimestamp();

      // Lista os pendentes
      if (mencionar) {
        // Com mencao - usa Discord IDs
        const mencoes = pendentes
          .map(m => `<@${m.discordId}>`)
          .join(' ');
        
        embed.addFields({
          name: 'Membros Pendentes',
          value: pendentes.map(m => `• ${m.nome}`).join('\n').slice(0, 1024),
          inline: false
        });

        await interaction.editReply({
          content: `**Lembrete de FGTS - ${nomeMes}/${ano}**\n\n${mencoes}\n\nPor favor, realizem o pagamento do FGTS o mais breve possivel!`,
          embeds: [embed]
        });
      } else {
        // Sem mencao - so lista nomes
        const listaPendentes = pendentes
          .map(m => `• ${m.nome}`)
          .join('\n');

        embed.addFields({
          name: 'Membros Pendentes',
          value: listaPendentes.slice(0, 1024),
          inline: false
        });

        await interaction.editReply({
          embeds: [embed]
        });
      }

      console.log(`[FgtsPendentes] Lista gerada em ${interaction.guild?.name} por ${interaction.user.tag} - ${pendentes.length} pendentes`);
    } catch (error) {
      console.error('[FgtsPendentes] Erro ao listar pendentes:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao listar os pendentes.')]
      });
    }
  }
};

/**
 * Retorna o nome do mes por extenso
 */
function getNomeMes(mes: number): string {
  const meses = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1] || 'Mes invalido';
}

export default command;
