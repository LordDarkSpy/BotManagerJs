// =============================================================================
// Comando: /punicao
// =============================================================================
// Aplica punicoes escalonaveis aos membros.
// O escalonamento e automatico baseado no historico de punicoes do membro.
// =============================================================================

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits
} from 'discord.js';
import { SlashCommand } from '../types/index.js';
import { prisma } from '../config/database.js';
import { createSuccessEmbed, createErrorEmbed, createInfoEmbed } from '../utils/embeds.js';
import { registrarLog } from '../services/log.service.js';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('punicao')
    .setDescription('Gerencia punicoes de membros')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(subcommand =>
      subcommand
        .setName('aplicar')
        .setDescription('Aplica uma punicao a um membro')
        .addUserOption(option =>
          option
            .setName('membro')
            .setDescription('O membro que sera punido')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('motivo')
            .setDescription('Motivo da punicao')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('evidencia')
            .setDescription('URL de evidencia/print (opcional)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('historico')
        .setDescription('Visualiza o historico de punicoes de um membro')
        .addUserOption(option =>
          option
            .setName('membro')
            .setDescription('O membro para visualizar historico')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remover')
        .setDescription('Remove uma punicao ativa de um membro')
        .addStringOption(option =>
          option
            .setName('id')
            .setDescription('ID da punicao a ser removida')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('motivo')
            .setDescription('Motivo da remocao')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('tipos')
        .setDescription('Lista os tipos de punicao configurados')
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'aplicar':
        await handleAplicarPunicao(interaction);
        break;
      case 'historico':
        await handleHistoricoPunicao(interaction);
        break;
      case 'remover':
        await handleRemoverPunicao(interaction);
        break;
      case 'tipos':
        await handleListarTipos(interaction);
        break;
    }
  }
};

/**
 * Aplica uma punicao a um membro com escalonamento automatico
 */
async function handleAplicarPunicao(interaction: ChatInputCommandInteraction): Promise<void> {
  const guildId = interaction.guildId!;
  const targetUser = interaction.options.getUser('membro', true);
  const motivo = interaction.options.getString('motivo', true);
  const evidencia = interaction.options.getString('evidencia') || null;

  await interaction.deferReply({ ephemeral: true });

  try {
    // Verifica se o alvo e membro cadastrado
    const membro = await prisma.membro.findUnique({
      where: {
        guildId_discordId: {
          guildId,
          discordId: targetUser.id
        }
      }
    });

    if (!membro) {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Membro nao encontrado',
          'Este usuario nao esta cadastrado como membro.'
        )]
      });
      return;
    }

    // Busca tipos de punicao ordenados por nivel
    const tiposPunicao = await prisma.tipoPunicao.findMany({
      where: { guildId },
      orderBy: { nivel: 'asc' }
    });

    if (tiposPunicao.length === 0) {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Sem tipos de punicao',
          'Nenhum tipo de punicao cadastrado. Use o dashboard para configurar os tipos de punicao.'
        )]
      });
      return;
    }

    // Busca punicoes ativas e recentes do membro para calcular escalonamento
    const dataLimite = new Date();
    // Usa o maior periodo de validade entre os tipos
    const maiorValidade = Math.max(...tiposPunicao.map(t => t.diasValidade));
    dataLimite.setDate(dataLimite.getDate() - maiorValidade);

    const punicoesRecentes = await prisma.punicao.findMany({
      where: {
        guildId,
        membroId: membro.id,
        ativo: true,
        dataAplicacao: {
          gte: dataLimite
        }
      },
      include: {
        tipoPunicao: true
      },
      orderBy: {
        dataAplicacao: 'desc'
      }
    });

    // Calcula qual nivel de punicao aplicar
    let nivelAplicar = 1;
    
    if (punicoesRecentes.length > 0) {
      // Pega o maior nivel das punicoes recentes e incrementa
      const maiorNivel = Math.max(...punicoesRecentes.map(p => p.tipoPunicao.nivel));
      nivelAplicar = maiorNivel + 1;
    }

    // Busca o tipo de punicao correspondente ao nivel
    let tipoPunicao = tiposPunicao.find(t => t.nivel === nivelAplicar);
    
    // Se nao encontrar o nivel, usa o mais alto disponivel
    if (!tipoPunicao) {
      tipoPunicao = tiposPunicao[tiposPunicao.length - 1];
    }

    // Calcula data de expiracao
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + tipoPunicao.diasValidade);

    // Cria a punicao
    const punicao = await prisma.punicao.create({
      data: {
        guildId,
        membroId: membro.id,
        tipoPunicaoId: tipoPunicao.id,
        motivo,
        evidencia,
        aplicadoPorId: interaction.user.id,
        aplicadoPorNome: interaction.user.username,
        dataExpiracao,
        ativo: true
      },
      include: {
        tipoPunicao: true
      }
    });

    // Aplica acoes automaticas no Discord
    const guild = interaction.guild!;
    let acoesRealizadas: string[] = [];

    try {
      const discordMember = await guild.members.fetch(targetUser.id);

      // Remove cargos se configurado
      if (tipoPunicao.removerCargos) {
        const cargosAtuais = discordMember.roles.cache
          .filter(r => r.id !== guild.id) // Remove @everyone
          .map(r => r.id);
        
        if (cargosAtuais.length > 0) {
          await discordMember.roles.remove(cargosAtuais);
          acoesRealizadas.push('Cargos removidos');
        }
      }

      // Aplica cargo de punicao se configurado
      if (tipoPunicao.aplicarCargo) {
        await discordMember.roles.add(tipoPunicao.aplicarCargo);
        acoesRealizadas.push('Cargo de punicao aplicado');
      }
    } catch (error) {
      console.error('[Punicao] Erro ao aplicar acoes no Discord:', error);
      acoesRealizadas.push('Erro ao aplicar acoes no Discord');
    }

    // Registra log
    await registrarLog({
      guildId,
      acao: 'PUNICAO_APLICADA',
      executorId: interaction.user.id,
      executorNome: interaction.user.username,
      alvoId: targetUser.id,
      alvoNome: membro.nome,
      detalhes: `${tipoPunicao.codigo} - ${motivo}`
    });

    // Tenta enviar DM para o membro punido
    try {
      await targetUser.send({
        embeds: [createErrorEmbed(
          `Punicao: ${tipoPunicao.codigo}`,
          `Voce recebeu uma punicao.\n\n` +
          `**Tipo:** ${tipoPunicao.nome}\n` +
          `**Motivo:** ${motivo}\n` +
          `**Expira em:** ${tipoPunicao.diasValidade} dias`
        )]
      });
    } catch {
      console.log(`[Punicao] Nao foi possivel enviar DM para ${targetUser.tag}`);
    }

    const acoesTexto = acoesRealizadas.length > 0 
      ? `\n**Acoes realizadas:** ${acoesRealizadas.join(', ')}` 
      : '';

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'Punicao Aplicada',
        `**Membro:** ${membro.nome} (<@${targetUser.id}>)\n` +
        `**Punicao:** ${tipoPunicao.codigo} - ${tipoPunicao.nome}\n` +
        `**Motivo:** ${motivo}\n` +
        `**ID:** \`${punicao.id}\`\n` +
        `**Expira em:** ${tipoPunicao.diasValidade} dias` +
        acoesTexto
      )]
    });
  } catch (error) {
    console.error('[Punicao] Erro ao aplicar:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao aplicar a punicao.')]
    });
  }
}

/**
 * Exibe o historico de punicoes de um membro
 */
async function handleHistoricoPunicao(interaction: ChatInputCommandInteraction): Promise<void> {
  const guildId = interaction.guildId!;
  const targetUser = interaction.options.getUser('membro', true);

  await interaction.deferReply({ ephemeral: true });

  try {
    // Verifica se o alvo e membro cadastrado
    const membro = await prisma.membro.findUnique({
      where: {
        guildId_discordId: {
          guildId,
          discordId: targetUser.id
        }
      }
    });

    if (!membro) {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Membro nao encontrado',
          'Este usuario nao esta cadastrado como membro.'
        )]
      });
      return;
    }

    // Busca todas as punicoes do membro
    const punicoes = await prisma.punicao.findMany({
      where: {
        guildId,
        membroId: membro.id
      },
      include: {
        tipoPunicao: true
      },
      orderBy: {
        dataAplicacao: 'desc'
      },
      take: 10
    });

    if (punicoes.length === 0) {
      await interaction.editReply({
        embeds: [createInfoEmbed(
          'Historico Limpo',
          `**${membro.nome}** nao possui nenhuma punicao registrada.`
        )]
      });
      return;
    }

    // Conta punicoes ativas
    const ativas = punicoes.filter(p => p.ativo).length;

    // Formata lista de punicoes
    const listaPunicoes = punicoes.map(p => {
      const status = p.ativo ? '🔴 Ativa' : '⚪ Inativa';
      const data = p.dataAplicacao.toLocaleDateString('pt-BR');
      return `${status} **${p.tipoPunicao.codigo}** - ${data}\n` +
             `└ ${p.motivo.substring(0, 50)}${p.motivo.length > 50 ? '...' : ''}`;
    }).join('\n\n');

    await interaction.editReply({
      embeds: [createInfoEmbed(
        `Historico de ${membro.nome}`,
        `**Punicoes ativas:** ${ativas}\n` +
        `**Total de punicoes:** ${punicoes.length}\n\n` +
        `${listaPunicoes}`
      )]
    });
  } catch (error) {
    console.error('[Punicao] Erro ao buscar historico:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao buscar o historico.')]
    });
  }
}

/**
 * Remove uma punicao ativa
 */
async function handleRemoverPunicao(interaction: ChatInputCommandInteraction): Promise<void> {
  const guildId = interaction.guildId!;
  const punicaoId = interaction.options.getString('id', true);
  const motivoRemocao = interaction.options.getString('motivo', true);

  await interaction.deferReply({ ephemeral: true });

  try {
    // Busca a punicao
    const punicao = await prisma.punicao.findFirst({
      where: {
        id: punicaoId,
        guildId,
        ativo: true
      },
      include: {
        membro: true,
        tipoPunicao: true
      }
    });

    if (!punicao) {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Punicao nao encontrada',
          'Esta punicao nao existe ou ja foi removida.'
        )]
      });
      return;
    }

    // Remove a punicao
    await prisma.punicao.update({
      where: { id: punicaoId },
      data: {
        ativo: false,
        dataRemocao: new Date(),
        removidoPorId: interaction.user.id,
        removidoPorNome: interaction.user.username,
        motivoRemocao
      }
    });

    // Remove cargo de punicao do Discord se aplicavel
    if (punicao.tipoPunicao.aplicarCargo) {
      try {
        const guild = interaction.guild!;
        const discordMember = await guild.members.fetch(punicao.membro.discordId);
        await discordMember.roles.remove(punicao.tipoPunicao.aplicarCargo);
      } catch (error) {
        console.error('[Punicao] Erro ao remover cargo no Discord:', error);
      }
    }

    // Registra log
    await registrarLog({
      guildId,
      acao: 'PUNICAO_REMOVIDA',
      executorId: interaction.user.id,
      executorNome: interaction.user.username,
      alvoId: punicao.membro.discordId,
      alvoNome: punicao.membro.nome,
      detalhes: `${punicao.tipoPunicao.codigo} removida - ${motivoRemocao}`
    });

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'Punicao Removida',
        `**Membro:** ${punicao.membro.nome}\n` +
        `**Punicao:** ${punicao.tipoPunicao.codigo}\n` +
        `**Motivo da remocao:** ${motivoRemocao}`
      )]
    });
  } catch (error) {
    console.error('[Punicao] Erro ao remover:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao remover a punicao.')]
    });
  }
}

/**
 * Lista os tipos de punicao configurados
 */
async function handleListarTipos(interaction: ChatInputCommandInteraction): Promise<void> {
  const guildId = interaction.guildId!;

  await interaction.deferReply({ ephemeral: true });

  try {
    const tipos = await prisma.tipoPunicao.findMany({
      where: { guildId },
      orderBy: { nivel: 'asc' }
    });

    if (tipos.length === 0) {
      await interaction.editReply({
        embeds: [createInfoEmbed(
          'Tipos de Punicao',
          'Nenhum tipo de punicao cadastrado.\n\n' +
          'Use o dashboard para configurar os tipos de punicao.'
        )]
      });
      return;
    }

    const listaTipos = tipos.map(t => {
      const duracao = t.diasDuracao ? `${t.diasDuracao} dias` : 'Permanente';
      return `**${t.nivel}. ${t.codigo}** - ${t.nome}\n` +
             `└ Validade: ${t.diasValidade} dias | Duracao: ${duracao}`;
    }).join('\n\n');

    await interaction.editReply({
      embeds: [createInfoEmbed(
        'Tipos de Punicao',
        `Tipos configurados (ordenados por nivel):\n\n${listaTipos}`
      )]
    });
  } catch (error) {
    console.error('[Punicao] Erro ao listar tipos:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao listar os tipos.')]
    });
  }
}

export default command;
