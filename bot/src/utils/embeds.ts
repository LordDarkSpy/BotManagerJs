// =============================================================================
// BotManagerJs - Builders de Embeds
// =============================================================================
// Este arquivo contém funções utilitárias para criar embeds padronizados.
// Centralizar a criação de embeds garante consistência visual no bot.
// =============================================================================

import { EmbedBuilder, User } from 'discord.js';
import { EmbedColors } from '../types/index.js';

// =============================================================================
// Embeds de Resposta Básica
// =============================================================================

/**
 * Cria um embed de sucesso
 * @param title - Título do embed
 * @param description - Descrição/mensagem
 * @returns EmbedBuilder configurado
 */
export function createSuccessEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.SUCCESS)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Cria um embed de erro
 * @param title - Título do embed
 * @param description - Descrição do erro
 * @returns EmbedBuilder configurado
 */
export function createErrorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.ERROR)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Cria um embed de aviso
 * @param title - Título do embed
 * @param description - Descrição do aviso
 * @returns EmbedBuilder configurado
 */
export function createWarningEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.WARNING)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Cria um embed informativo
 * @param title - Título do embed
 * @param description - Descrição/informação
 * @returns EmbedBuilder configurado
 */
export function createInfoEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.INFO)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

// =============================================================================
// Embeds de Solicitação de Set
// =============================================================================

/**
 * Cria o embed do botão de solicitação de Set
 * Este é o embed que aparece quando o admin usa /set-button
 * @param botName - Nome personalizado do bot (opcional)
 * @param botImage - URL da imagem do bot (opcional)
 * @returns EmbedBuilder configurado
 */
export function createSetButtonEmbed(botName?: string, botImage?: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(EmbedColors.PRIMARY)
    .setTitle('📋 Solicitação de Set')
    .setDescription(
      'Clique no botão abaixo para solicitar seu **Set** na organização.\n\n' +
      '**Informações necessárias:**\n' +
      '• Nome completo ou apelido\n' +
      '• Telefone de contato\n' +
      '• ID no jogo\n' +
      '• Quem te recrutou\n' +
      '• Tipo de membro (Adulto/Baby)'
    )
    .setFooter({ text: botName || 'BotManagerJs' })
    .setTimestamp();
  
  // Adiciona imagem se configurada
  if (botImage) {
    embed.setThumbnail(botImage);
  }
  
  return embed;
}

/**
 * Cria o embed de uma solicitação de Set pendente
 * Este embed aparece no canal de aprovação para os aprovadores analisarem
 * @param solicitante - Usuário que fez a solicitação
 * @param dados - Dados preenchidos no formulário
 * @returns EmbedBuilder configurado
 */
export function createSetRequestEmbed(
  solicitante: User,
  dados: {
    nome: string;
    telefone: string;
    idJogo: string;
    recrutador: string;
    tipo: string;
  }
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.PENDING)
    .setTitle('📝 Nova Solicitação de Set')
    .setDescription(`**${solicitante.username}** está solicitando Set na organização.`)
    .setThumbnail(solicitante.displayAvatarURL({ size: 128 }))
    .addFields(
      { name: '👤 Nome', value: dados.nome, inline: true },
      { name: '📞 Telefone', value: dados.telefone || 'Não informado', inline: true },
      { name: '🎮 ID no Jogo', value: dados.idJogo || 'Não informado', inline: true },
      { name: '👥 Recrutador', value: dados.recrutador || 'Não informado', inline: true },
      { name: '📊 Tipo', value: dados.tipo, inline: true },
      { name: '🆔 Discord ID', value: solicitante.id, inline: true }
    )
    .setFooter({ text: 'Use os botões abaixo para aprovar ou reprovar' })
    .setTimestamp();
}

/**
 * Cria o embed de Set aprovado
 * @param solicitante - Usuário que teve o Set aprovado
 * @param aprovador - Usuário que aprovou
 * @returns EmbedBuilder configurado
 */
export function createSetApprovedEmbed(solicitante: User, aprovador: User): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.SUCCESS)
    .setTitle('✅ Set Aprovado')
    .setDescription(
      `A solicitação de **${solicitante.username}** foi **aprovada**!\n\n` +
      `Bem-vindo(a) à organização!`
    )
    .addFields(
      { name: '👤 Novo Membro', value: `<@${solicitante.id}>`, inline: true },
      { name: '✅ Aprovado por', value: `<@${aprovador.id}>`, inline: true }
    )
    .setThumbnail(solicitante.displayAvatarURL({ size: 128 }))
    .setTimestamp();
}

/**
 * Cria o embed de Set reprovado
 * @param solicitante - Usuário que teve o Set reprovado
 * @param aprovador - Usuário que reprovou
 * @param motivo - Motivo da reprovação
 * @returns EmbedBuilder configurado
 */
export function createSetRejectedEmbed(
  solicitante: User,
  aprovador: User,
  motivo?: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.ERROR)
    .setTitle('❌ Set Reprovado')
    .setDescription(
      `A solicitação de **${solicitante.username}** foi **reprovada**.`
    )
    .addFields(
      { name: '👤 Solicitante', value: `<@${solicitante.id}>`, inline: true },
      { name: '❌ Reprovado por', value: `<@${aprovador.id}>`, inline: true },
      { name: '📝 Motivo', value: motivo || 'Não especificado', inline: false }
    )
    .setTimestamp();
}

// =============================================================================
// Embeds de Gestão de Cargos
// =============================================================================

/**
 * Cria o embed do botão de gestão de cargos
 * @returns EmbedBuilder configurado
 */
export function createCargoManagementEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.PRIMARY)
    .setTitle('⚙️ Gestão de Cargos')
    .setDescription(
      'Use o botão abaixo para gerenciar os cargos dos membros.\n\n' +
      '**Funções disponíveis:**\n' +
      '• Promover membros\n' +
      '• Rebaixar membros\n' +
      '• Visualizar hierarquia'
    )
    .setTimestamp();
}

/**
 * Cria embed mostrando a alteração de cargo de um membro
 * @param membro - Nome do membro
 * @param cargoAntigo - Nome do cargo anterior
 * @param cargoNovo - Nome do novo cargo
 * @param executor - Usuário que fez a alteração
 * @returns EmbedBuilder configurado
 */
export function createCargoChangeEmbed(
  membro: string,
  cargoAntigo: string,
  cargoNovo: string,
  executor: User
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.INFO)
    .setTitle('📊 Alteração de Cargo')
    .setDescription(`O cargo de **${membro}** foi alterado.`)
    .addFields(
      { name: '📤 Cargo Anterior', value: cargoAntigo || 'Nenhum', inline: true },
      { name: '📥 Novo Cargo', value: cargoNovo, inline: true },
      { name: '👤 Alterado por', value: `<@${executor.id}>`, inline: true }
    )
    .setTimestamp();
}

// =============================================================================
// Embeds de Ausência
// =============================================================================

/**
 * Cria o embed do botão de registro de ausência
 * @returns EmbedBuilder configurado
 */
export function createAusenciaButtonEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.PRIMARY)
    .setTitle('🗓️ Registro de Ausência')
    .setDescription(
      'Precisa se ausentar? Clique no botão abaixo para registrar sua ausência.\n\n' +
      '**Informações necessárias:**\n' +
      '• Data de início da ausência\n' +
      '• Data prevista de retorno\n' +
      '• Motivo (opcional)'
    )
    .setTimestamp();
}

/**
 * Cria embed de confirmação de ausência registrada
 * @param membro - Usuário que registrou ausência
 * @param dataInicio - Data de início formatada
 * @param dataFim - Data de fim formatada
 * @param motivo - Motivo da ausência
 * @returns EmbedBuilder configurado
 */
export function createAusenciaRegisteredEmbed(
  membro: User,
  dataInicio: string,
  dataFim: string,
  motivo?: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.WARNING)
    .setTitle('🗓️ Ausência Registrada')
    .setDescription(`**${membro.username}** registrou uma ausência.`)
    .setThumbnail(membro.displayAvatarURL({ size: 128 }))
    .addFields(
      { name: '📅 Início', value: dataInicio, inline: true },
      { name: '📅 Retorno', value: dataFim, inline: true },
      { name: '📝 Motivo', value: motivo || 'Não informado', inline: false }
    )
    .setTimestamp();
}

/**
 * Cria embed de notificação de retorno
 * @param membroId - ID do membro que deve retornar
 * @returns EmbedBuilder configurado
 */
export function createReturnNotificationEmbed(membroId: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.INFO)
    .setTitle('🔔 Lembrete de Retorno')
    .setDescription(
      `Olá <@${membroId}>!\n\n` +
      'Seu período de ausência termina **hoje**. ' +
      'Esperamos que esteja tudo bem e que você possa retornar às atividades.'
    )
    .setTimestamp();
}

// =============================================================================
// Embeds de FGTS
// =============================================================================

/**
 * Cria o embed do botao de pagamento de FGTS
 * O FGTS e uma taxa obrigatoria mensal que todos os membros devem pagar
 * @returns EmbedBuilder configurado
 */
export function createFgtsButtonEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.PRIMARY)
    .setTitle('Taxa FGTS - Pagamento Obrigatorio')
    .setDescription(
      'O **FGTS** e uma taxa obrigatoria que todos os membros devem pagar mensalmente.\n\n' +
      'Clique no botao abaixo para registrar seu pagamento.\n\n' +
      '**Informacoes necessarias:**\n' +
      '- Mes e ano de referencia\n' +
      '- Valor pago\n' +
      '- Observacao (opcional)'
    )
    .setFooter({ text: 'Mantenha seus pagamentos em dia!' })
    .setTimestamp();
}

/**
 * Cria embed de confirmacao de FGTS pago
 * @param membro - Usuario que fez o pagamento
 * @param valor - Valor pago
 * @param idTransacao - ID unico do pagamento
 * @param mes - Mes de referencia
 * @param ano - Ano de referencia
 * @param imageUrl - URL do comprovante
 * @returns EmbedBuilder configurado
 */
export function createFgtsRegisteredEmbed(
  membro: User,
  valor: number,
  idTransacao: string,
  mes?: number,
  ano?: number,
  imageUrl?: string
): EmbedBuilder {
  const nomeMes = mes ? getNomeMes(mes) : '';
  const referencia = mes && ano ? `${nomeMes}/${ano}` : formatDate(new Date());
  
  const embed = new EmbedBuilder()
    .setColor(EmbedColors.SUCCESS)
    .setTitle('FGTS Pago')
    .setDescription(`**${membro.username}** pagou a taxa FGTS.`)
    .setThumbnail(membro.displayAvatarURL({ size: 128 }))
    .addFields(
      { name: 'Referencia', value: referencia, inline: true },
      { name: 'Valor', value: formatCurrency(valor), inline: true },
      { name: 'ID Pagamento', value: idTransacao, inline: true }
    )
    .setTimestamp();

  // Adiciona imagem do comprovante se fornecida
  if (imageUrl) {
    embed.setImage(imageUrl);
  }

  return embed;
}

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

/**
 * Cria embed de relatório de FGTS
 * @param transacoes - Lista de transações
 * @param dataInicio - Data de início do período
 * @param dataFim - Data de fim do período
 * @param total - Soma total dos valores
 * @returns EmbedBuilder configurado
 */
export function createFgtsReportEmbed(
  transacoes: Array<{ membro: string; valor: number; data: Date }>,
  dataInicio: string,
  dataFim: string,
  total: number
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(EmbedColors.INFO)
    .setTitle('📊 Relatório de FGTS')
    .setDescription(`Período: **${dataInicio}** até **${dataFim}**`)
    .setTimestamp();

  // Adiciona as transações como campos
  if (transacoes.length > 0) {
    const transacoesText = transacoes
      .map(t => `• **${t.membro}**: ${formatCurrency(t.valor)} - ${formatDate(t.data)}`)
      .join('\n');
    
    embed.addFields(
      { name: '📋 Transações', value: transacoesText.slice(0, 1024) },
      { name: '💰 Total do Período', value: formatCurrency(total), inline: true },
      { name: '📈 Quantidade', value: `${transacoes.length} transações`, inline: true }
    );
  } else {
    embed.addFields({
      name: '📋 Transações',
      value: 'Nenhuma transação encontrada no período.'
    });
  }

  return embed;
}

// =============================================================================
// Embeds de Blacklist
// =============================================================================

/**
 * Cria embed de adição à blacklist
 * @param usuario - Nome/ID do usuário banido
 * @param motivo - Motivo do banimento
 * @param executor - Quem adicionou à blacklist
 * @returns EmbedBuilder configurado
 */
export function createBlacklistAddedEmbed(
  usuario: string,
  motivo: string,
  executor: User
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.ERROR)
    .setTitle('🚫 Adicionado à Blacklist')
    .setDescription(`**${usuario}** foi adicionado à blacklist.`)
    .addFields(
      { name: '📝 Motivo', value: motivo, inline: false },
      { name: '👤 Adicionado por', value: `<@${executor.id}>`, inline: true }
    )
    .setTimestamp();
}

/**
 * Cria embed de remoção da blacklist
 * @param usuario - Nome/ID do usuário removido
 * @param executor - Quem removeu da blacklist
 * @returns EmbedBuilder configurado
 */
export function createBlacklistRemovedEmbed(usuario: string, executor: User): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EmbedColors.SUCCESS)
    .setTitle('✅ Removido da Blacklist')
    .setDescription(`**${usuario}** foi removido da blacklist.`)
    .addFields(
      { name: '👤 Removido por', value: `<@${executor.id}>`, inline: true }
    )
    .setTimestamp();
}

// =============================================================================
// Funções Auxiliares de Formatação
// =============================================================================

/**
 * Formata um valor numérico para moeda brasileira (R$)
 * @param valor - Valor numérico
 * @returns String formatada (ex: R$ 1.234,56)
 */
export function formatCurrency(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata uma data para o padrão brasileiro
 * @param date - Objeto Date
 * @returns String formatada (ex: 25/12/2024)
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

/**
 * Formata data e hora para o padrão brasileiro
 * @param date - Objeto Date
 * @returns String formatada (ex: 25/12/2024 14:30)
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
