/**
 * ================================================================
 * COMANDO: /tipo-punicao
 * ================================================================
 * 
 * Gerencia os tipos de punicao escalonaveis.
 * Subcomandos:
 * - cadastrar: Cadastra um novo tipo de punicao
 * - listar: Lista todos os tipos cadastrados
 * - remover: Remove um tipo de punicao
 */

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits
} from 'discord.js';
import { SlashCommand, EmbedColors } from '../types/index.js';
import { prisma } from '../config/database.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds.js';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('tipo-punicao')
    .setDescription('Gerencia os tipos de punicao')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('cadastrar')
        .setDescription('Cadastra um novo tipo de punicao')
        .addStringOption(option =>
          option
            .setName('codigo')
            .setDescription('Codigo da punicao (ex: ADV-1, ADV-2, SUSPENSAO)')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('nome')
            .setDescription('Nome descritivo (ex: Advertencia Nivel 1)')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('nivel')
            .setDescription('Nivel para escalonamento (1, 2, 3...)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addIntegerOption(option =>
          option
            .setName('dias-validade')
            .setDescription('Dias que a punicao conta para escalonamento')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(365)
        )
        .addIntegerOption(option =>
          option
            .setName('dias-duracao')
            .setDescription('Duracao da punicao em dias (0 = permanente)')
            .setRequired(false)
        )
        .addBooleanOption(option =>
          option
            .setName('remover-cargos')
            .setDescription('Remove todos os cargos do membro ao aplicar')
            .setRequired(false)
        )
        .addRoleOption(option =>
          option
            .setName('cargo-aplicar')
            .setDescription('Cargo a ser aplicado ao punir (ex: Suspenso)')
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('descricao')
            .setDescription('Descricao da punicao')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('listar')
        .setDescription('Lista todos os tipos de punicao cadastrados')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remover')
        .setDescription('Remove um tipo de punicao')
        .addStringOption(option =>
          option
            .setName('codigo')
            .setDescription('Codigo da punicao a remover')
            .setRequired(true)
        )
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;

    switch (subcommand) {
      case 'cadastrar':
        await handleCadastrar(interaction, guildId);
        break;
      case 'listar':
        await handleListar(interaction, guildId);
        break;
      case 'remover':
        await handleRemover(interaction, guildId);
        break;
    }
  }
};

/**
 * Cadastra um novo tipo de punicao
 */
async function handleCadastrar(
  interaction: ChatInputCommandInteraction,
  guildId: string
): Promise<void> {
  const codigo = interaction.options.getString('codigo', true).toUpperCase();
  const nome = interaction.options.getString('nome', true);
  const nivel = interaction.options.getInteger('nivel', true);
  const diasValidade = interaction.options.getInteger('dias-validade', true);
  const diasDuracao = interaction.options.getInteger('dias-duracao') || null;
  const removerCargos = interaction.options.getBoolean('remover-cargos') || false;
  const cargoAplicar = interaction.options.getRole('cargo-aplicar');
  const descricao = interaction.options.getString('descricao') || null;

  await interaction.deferReply({ ephemeral: true });

  try {
    // Verifica se ja existe
    const existente = await prisma.tipoPunicao.findUnique({
      where: {
        guildId_codigo: { guildId, codigo }
      }
    });

    if (existente) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Erro', `Ja existe um tipo de punicao com o codigo **${codigo}**.`)]
      });
      return;
    }

    // Cria o tipo de punicao
    await prisma.tipoPunicao.create({
      data: {
        guildId,
        codigo,
        nome,
        descricao,
        nivel,
        diasValidade,
        diasDuracao,
        removerCargos,
        aplicarCargo: cargoAplicar?.id || null
      }
    });

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'Tipo de Punicao Cadastrado',
        `O tipo de punicao **${codigo}** foi cadastrado com sucesso!\n\n` +
        `**Nome:** ${nome}\n` +
        `**Nivel:** ${nivel}\n` +
        `**Validade:** ${diasValidade} dias\n` +
        `**Duracao:** ${diasDuracao ? `${diasDuracao} dias` : 'Permanente'}\n` +
        `**Remove cargos:** ${removerCargos ? 'Sim' : 'Nao'}\n` +
        `${cargoAplicar ? `**Cargo aplicado:** ${cargoAplicar.name}` : ''}`
      )]
    });
  } catch (error) {
    console.error('[TipoPunicao] Erro ao cadastrar:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao cadastrar o tipo de punicao.')]
    });
  }
}

/**
 * Lista todos os tipos de punicao
 */
async function handleListar(
  interaction: ChatInputCommandInteraction,
  guildId: string
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const tipos = await prisma.tipoPunicao.findMany({
      where: { guildId },
      orderBy: { nivel: 'asc' },
      include: {
        _count: {
          select: { punicoes: true }
        }
      }
    });

    if (tipos.length === 0) {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Nenhum Tipo Cadastrado',
          'Nao ha tipos de punicao cadastrados.\n\n' +
          'Use `/tipo-punicao cadastrar` para criar um novo tipo.'
        )]
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(EmbedColors.INFO)
      .setTitle('Tipos de Punicao Cadastrados')
      .setDescription('Lista de todos os tipos de punicao ordenados por nivel:')
      .setTimestamp();

    for (const tipo of tipos) {
      embed.addFields({
        name: `${tipo.nivel}. ${tipo.codigo} - ${tipo.nome}`,
        value: 
          `${tipo.descricao ? `${tipo.descricao}\n` : ''}` +
          `Validade: ${tipo.diasValidade} dias | ` +
          `Duracao: ${tipo.diasDuracao ? `${tipo.diasDuracao} dias` : 'Permanente'}\n` +
          `Aplicacoes: ${tipo._count.punicoes}`,
        inline: false
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('[TipoPunicao] Erro ao listar:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao listar os tipos de punicao.')]
    });
  }
}

/**
 * Remove um tipo de punicao
 */
async function handleRemover(
  interaction: ChatInputCommandInteraction,
  guildId: string
): Promise<void> {
  const codigo = interaction.options.getString('codigo', true).toUpperCase();

  await interaction.deferReply({ ephemeral: true });

  try {
    // Busca o tipo
    const tipo = await prisma.tipoPunicao.findUnique({
      where: {
        guildId_codigo: { guildId, codigo }
      },
      include: {
        _count: {
          select: { punicoes: true }
        }
      }
    });

    if (!tipo) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Erro', `Tipo de punicao **${codigo}** nao encontrado.`)]
      });
      return;
    }

    // Verifica se tem punicoes aplicadas
    if (tipo._count.punicoes > 0) {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Nao e Possivel Remover',
          `O tipo **${codigo}** possui ${tipo._count.punicoes} punicao(oes) aplicada(s).\n` +
          'Remova as punicoes antes de excluir o tipo.'
        )]
      });
      return;
    }

    // Remove
    await prisma.tipoPunicao.delete({
      where: { id: tipo.id }
    });

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'Tipo Removido',
        `O tipo de punicao **${codigo}** foi removido com sucesso.`
      )]
    });
  } catch (error) {
    console.error('[TipoPunicao] Erro ao remover:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao remover o tipo de punicao.')]
    });
  }
}

export default command;
