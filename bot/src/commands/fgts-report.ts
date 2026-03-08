// =============================================================================
// BotManagerJs - Comando /fgts-relatorio
// =============================================================================
// Este comando gera um relatorio de pagamentos de FGTS por periodo.
// Mostra quem pagou e quem ainda nao pagou a taxa obrigatoria.
// =============================================================================

import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits
} from 'discord.js';
import { prisma } from '../config/database.js';
import { SlashCommand, EmbedColors } from '../types/index.js';
import { createErrorEmbed, formatCurrency } from '../utils/embeds.js';

// =============================================================================
// Definicao do Comando
// =============================================================================

export const command: SlashCommand = {
  // Configuracao do comando slash
  data: new SlashCommandBuilder()
    .setName('fgts-relatorio')
    .setDescription('Gera um relatorio de pagamentos de FGTS do mes')
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

    await interaction.deferReply({ ephemeral: true });

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
        },
        include: {
          membro: true
        }
      });

      // Cria sets para comparacao
      const membrosPagaram = new Set(pagamentos.map(p => p.membroId));
      
      // Separa quem pagou e quem nao pagou
      const quemPagou = membrosAtivos.filter(m => membrosPagaram.has(m.id));
      const quemNaoPagou = membrosAtivos.filter(m => !membrosPagaram.has(m.id));

      // Calcula totais
      const totalArrecadado = pagamentos.reduce((sum, p) => sum + p.valor, 0);
      const nomeMes = getNomeMes(mes);

      // Cria o embed do relatorio
      const embed = new EmbedBuilder()
        .setColor(EmbedColors.INFO)
        .setTitle(`Relatorio FGTS - ${nomeMes}/${ano}`)
        .setDescription(
          `**Resumo do periodo:**\n` +
          `Total de membros ativos: **${membrosAtivos.length}**\n` +
          `Pagaram: **${quemPagou.length}** | Pendentes: **${quemNaoPagou.length}**\n` +
          `Total arrecadado: **${formatCurrency(totalArrecadado)}**`
        )
        .setTimestamp();

      // Lista quem pagou (limitado a 1024 caracteres)
      if (quemPagou.length > 0) {
        const listaPagaram = quemPagou
          .map(m => {
            const pagamento = pagamentos.find(p => p.membroId === m.id);
            return `${m.nome} - ${formatCurrency(pagamento?.valor || 0)}`;
          })
          .join('\n');
        
        embed.addFields({
          name: `Pagaram (${quemPagou.length})`,
          value: listaPagaram.slice(0, 1024) || 'Nenhum',
          inline: false
        });
      }

      // Lista quem NAO pagou (limitado a 1024 caracteres)
      if (quemNaoPagou.length > 0) {
        const listaPendentes = quemNaoPagou
          .map(m => `${m.nome}`)
          .join('\n');
        
        embed.addFields({
          name: `Pendentes (${quemNaoPagou.length})`,
          value: listaPendentes.slice(0, 1024) || 'Nenhum',
          inline: false
        });
      } else {
        embed.addFields({
          name: 'Pendentes',
          value: 'Todos os membros pagaram!',
          inline: false
        });
      }

      // Adiciona taxa de pagamento
      const taxaPagamento = ((quemPagou.length / membrosAtivos.length) * 100).toFixed(1);
      embed.setFooter({ 
        text: `Taxa de pagamento: ${taxaPagamento}%` 
      });

      await interaction.editReply({
        embeds: [embed]
      });

      console.log(`[FgtsRelatorio] Relatorio gerado em ${interaction.guild?.name} por ${interaction.user.tag}`);
    } catch (error) {
      console.error('[FgtsRelatorio] Erro ao gerar relatorio:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao gerar o relatorio.')]
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
