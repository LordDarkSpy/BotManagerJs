// =============================================================================
// BotManagerJs - Handler de Modais
// =============================================================================
// Este arquivo processa todas as submissões de modais (formulários) do bot.
// Cada modal é identificado pelo seu customId e processado adequadamente.
// =============================================================================
import { TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../config/database.js';
import { createSuccessEmbed, createErrorEmbed, createSetRequestEmbed, createAusenciaRegisteredEmbed, createFgtsRegisteredEmbed, createSetRejectedEmbed, formatDate } from '../utils/embeds.js';
import { getMembro, canApproveSet, PermissionErrors } from '../utils/permissions.js';
import { logSetSolicitado, logSetReprovado, registrarLog } from '../services/log.service.js';
import { generateTransactionId } from './selectMenus.js';
// =============================================================================
// Handler Principal
// =============================================================================
/**
 * Processa submissões de modais
 * @param interaction - Interação de submissão de modal
 */
export async function handleModal(interaction) {
    const { customId } = interaction;
    console.log(`[Modal] ${interaction.user.tag} submeteu: ${customId}`);
    // Roteia para o handler correto baseado no customId
    if (customId === 'set_submit') {
        await handleSetSubmit(interaction);
    }
    else if (customId.startsWith('set_reject_confirm_')) {
        const solicitacaoId = customId.replace('set_reject_confirm_', '');
        await handleSetRejectConfirm(interaction, solicitacaoId);
    }
    else if (customId === 'ausencia_submit') {
        await handleAusenciaSubmit(interaction);
    }
    else if (customId === 'fgts_submit') {
        await handleFgtsSubmit(interaction);
    }
    else {
        console.warn(`[Modal] Modal desconhecido: ${customId}`);
        await interaction.reply({
            embeds: [createErrorEmbed('Erro', 'Este formulário não está mais disponível.')],
            ephemeral: true
        });
    }
}
// =============================================================================
// Handler de Solicitação de Set
// =============================================================================
/**
 * Processa o formulário de solicitação de Set
 */
async function handleSetSubmit(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    // Extrai dados do modal
    const nome = interaction.fields.getTextInputValue('nome').trim();
    const telefone = interaction.fields.getTextInputValue('telefone').trim() || null;
    const idJogo = interaction.fields.getTextInputValue('idJogo').trim() || null;
    const recrutador = interaction.fields.getTextInputValue('recrutador').trim() || null;
    const tipoRaw = interaction.fields.getTextInputValue('tipo').trim().toUpperCase();
    // Valida o tipo
    if (tipoRaw !== 'ADULTO' && tipoRaw !== 'BABY') {
        await interaction.reply({
            embeds: [createErrorEmbed('Tipo Inválido', 'O tipo deve ser **ADULTO** ou **BABY**.')],
            ephemeral: true
        });
        return;
    }
    const tipo = tipoRaw;
    await interaction.deferReply({ ephemeral: true });
    try {
        // Cria a solicitação no banco
        const solicitacao = await prisma.solicitacaoSet.create({
            data: {
                guildId,
                solicitanteId: userId,
                solicitanteNome: nome,
                telefone,
                idJogo,
                recrutador,
                tipo,
                status: 'PENDENTE'
            }
        });
        // Busca configuração do servidor para obter canal de aprovação
        const config = await prisma.configuracao.findUnique({
            where: { guildId }
        });
        // Se há canal de aprovação configurado, envia lá
        if (config?.canalAprovacaoSet) {
            try {
                const channel = await interaction.client.channels.fetch(config.canalAprovacaoSet);
                if (channel && channel instanceof TextChannel) {
                    // Cria embed da solicitação
                    const embed = createSetRequestEmbed(interaction.user, {
                        nome,
                        telefone: telefone || 'Não informado',
                        idJogo: idJogo || 'Não informado',
                        recrutador: recrutador || 'Não informado',
                        tipo
                    });
                    // Cria botões de aprovação/reprovação
                    const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder()
                        .setCustomId(`set_approve_${solicitacao.id}`)
                        .setLabel('Aprovar')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅'), new ButtonBuilder()
                        .setCustomId(`set_reject_${solicitacao.id}`)
                        .setLabel('Reprovar')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('❌'));
                    // Menciona o cargo de aprovador se configurado
                    let content = '';
                    if (config.cargoAprovadorSet) {
                        content = `<@&${config.cargoAprovadorSet}>`;
                    }
                    await channel.send({ content, embeds: [embed], components: [buttons] });
                }
            }
            catch (error) {
                console.error('[Modal] Erro ao enviar para canal de aprovação:', error);
            }
        }
        // Registra log
        await logSetSolicitado(guildId, userId, nome, JSON.stringify({ nome, telefone, idJogo, recrutador, tipo }));
        await interaction.editReply({
            embeds: [createSuccessEmbed('Solicitação Enviada', 'Sua solicitação de Set foi enviada com sucesso!\n\n' +
                    'Aguarde a análise dos responsáveis. ' +
                    'Você receberá uma notificação quando sua solicitação for analisada.')]
        });
    }
    catch (error) {
        console.error('[Modal] Erro ao processar solicitação de Set:', error);
        await interaction.editReply({
            embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao processar sua solicitação.')]
        });
    }
}
/**
 * Confirma a reprovacao de uma solicitacao de Set e atribui cargo de reprovado
 */
async function handleSetRejectConfirm(interaction, solicitacaoId) {
    const guildId = interaction.guildId;
    const guild = interaction.guild;
    const member = interaction.member;
    // Verifica permissao novamente
    const canApprove = await canApproveSet(member, guildId);
    if (!canApprove) {
        await interaction.reply({
            embeds: [createErrorEmbed('Sem Permissao', PermissionErrors.CANNOT_APPROVE_SET)],
            ephemeral: true
        });
        return;
    }
    const motivo = interaction.fields.getTextInputValue('motivo').trim() || 'Nao especificado';
    await interaction.deferReply({ ephemeral: true });
    try {
        // Busca a solicitacao
        const solicitacao = await prisma.solicitacaoSet.findUnique({
            where: { id: solicitacaoId }
        });
        if (!solicitacao || solicitacao.status !== 'PENDENTE') {
            await interaction.editReply({
                embeds: [createErrorEmbed('Erro', 'Esta solicitacao ja foi processada ou nao existe.')]
            });
            return;
        }
        // Busca configuracao para cargo de reprovado
        const config = await prisma.configuracao.findUnique({
            where: { guildId }
        });
        // Atualiza a solicitacao
        await prisma.solicitacaoSet.update({
            where: { id: solicitacaoId },
            data: {
                status: 'REPROVADO',
                aprovadorId: interaction.user.id,
                aprovadorNome: interaction.user.username,
                dataDecisao: new Date(),
                motivoRejeicao: motivo
            }
        });
        // Atribui cargo de reprovado no Discord se configurado
        let cargoAtribuido = false;
        if (config?.cargoSetReprovado) {
            try {
                const discordMember = await guild.members.fetch(solicitacao.solicitanteId);
                await discordMember.roles.add(config.cargoSetReprovado);
                cargoAtribuido = true;
                console.log(`[Set] Cargo de reprovado atribuido a ${discordMember.user.tag}`);
            }
            catch (error) {
                console.error('[Set] Erro ao atribuir cargo de reprovado:', error);
            }
        }
        // Busca o usuario reprovado
        const solicitante = await interaction.client.users.fetch(solicitacao.solicitanteId);
        // Tenta enviar DM
        try {
            await solicitante.send({
                embeds: [createErrorEmbed('Set Reprovado', `Sua solicitacao de Set foi **reprovada**.\n\n**Motivo:** ${motivo}`)]
            });
        }
        catch {
            console.log(`[Set] Nao foi possivel enviar DM para ${solicitante.tag}`);
        }
        // Atualiza o embed original da mensagem
        const rejectedEmbed = createSetRejectedEmbed(solicitante, interaction.user, motivo);
        // Registra log
        await logSetReprovado(guildId, interaction.user.id, interaction.user.username, solicitacao.solicitanteId, solicitacao.solicitanteNome, motivo);
        const mensagemCargo = cargoAtribuido
            ? '\nCargo de reprovado atribuido no Discord.'
            : '';
        await interaction.editReply({
            embeds: [createSuccessEmbed('Reprovado', `Set de ${solicitacao.solicitanteNome} foi reprovado.${mensagemCargo}`)]
        });
    }
    catch (error) {
        console.error('[Modal] Erro ao reprovar Set:', error);
        await interaction.editReply({
            embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao reprovar a solicitacao.')]
        });
    }
}
// =============================================================================
// Handler de Ausência
// =============================================================================
/**
 * Processa o formulário de ausência
 */
async function handleAusenciaSubmit(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    // Extrai dados do modal
    const dataInicioStr = interaction.fields.getTextInputValue('dataInicio').trim();
    const dataFimStr = interaction.fields.getTextInputValue('dataFim').trim();
    const motivo = interaction.fields.getTextInputValue('motivo').trim() || null;
    // Valida e parseia as datas (formato DD/MM/AAAA)
    const dataInicio = parseDate(dataInicioStr);
    const dataFim = parseDate(dataFimStr);
    if (!dataInicio || !dataFim) {
        await interaction.reply({
            embeds: [createErrorEmbed('Data Inválida', 'As datas devem estar no formato DD/MM/AAAA (ex: 25/12/2024).')],
            ephemeral: true
        });
        return;
    }
    if (dataFim <= dataInicio) {
        await interaction.reply({
            embeds: [createErrorEmbed('Data Inválida', 'A data de retorno deve ser posterior à data de início.')],
            ephemeral: true
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    try {
        // Busca o membro
        const membro = await getMembro(userId, guildId);
        if (!membro) {
            await interaction.editReply({
                embeds: [createErrorEmbed('Erro', PermissionErrors.NOT_MEMBER)]
            });
            return;
        }
        // Cria a ausência
        await prisma.ausencia.create({
            data: {
                guildId,
                membroId: membro.id,
                dataInicio,
                dataFim,
                motivo,
                status: 'ATIVA'
            }
        });
        // Atualiza status do membro para AUSENTE
        await prisma.membro.update({
            where: { id: membro.id },
            data: { status: 'AUSENTE' }
        });
        // Busca configuração para enviar ao canal
        const config = await prisma.configuracao.findUnique({
            where: { guildId }
        });
        if (config?.canalAusencia) {
            try {
                const channel = await interaction.client.channels.fetch(config.canalAusencia);
                if (channel && channel instanceof TextChannel) {
                    const embed = createAusenciaRegisteredEmbed(interaction.user, formatDate(dataInicio), formatDate(dataFim), motivo || undefined);
                    await channel.send({ embeds: [embed] });
                }
            }
            catch (error) {
                console.error('[Modal] Erro ao enviar para canal de ausência:', error);
            }
        }
        // Registra log
        await registrarLog({
            guildId,
            acao: 'AUSENCIA_REGISTRADA',
            executorId: userId,
            executorNome: membro.nome,
            detalhes: `Período: ${formatDate(dataInicio)} até ${formatDate(dataFim)}${motivo ? `. Motivo: ${motivo}` : ''}`
        });
        await interaction.editReply({
            embeds: [createSuccessEmbed('Ausência Registrada', `Sua ausência foi registrada com sucesso!\n\n` +
                    `**Período:** ${formatDate(dataInicio)} até ${formatDate(dataFim)}\n` +
                    `**Motivo:** ${motivo || 'Não informado'}\n\n` +
                    `Você será notificado no dia do seu retorno.`)]
        });
    }
    catch (error) {
        console.error('[Modal] Erro ao registrar ausência:', error);
        await interaction.editReply({
            embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao registrar sua ausência.')]
        });
    }
}
// =============================================================================
// Handler de FGTS
// =============================================================================
/**
 * Processa o formulario de pagamento de FGTS
 * O FGTS e uma taxa obrigatoria mensal que todos os membros devem pagar
 */
async function handleFgtsSubmit(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    // Extrai dados do modal
    const mesStr = interaction.fields.getTextInputValue('mes').trim();
    const anoStr = interaction.fields.getTextInputValue('ano').trim();
    const valorStr = interaction.fields.getTextInputValue('valor').trim();
    const observacao = interaction.fields.getTextInputValue('observacao').trim() || null;
    // Valida mes
    const mes = parseInt(mesStr);
    if (isNaN(mes) || mes < 1 || mes > 12) {
        await interaction.reply({
            embeds: [createErrorEmbed('Mes Invalido', 'O mes deve ser um numero entre 1 e 12.')],
            ephemeral: true
        });
        return;
    }
    // Valida ano
    const ano = parseInt(anoStr);
    const anoAtual = new Date().getFullYear();
    if (isNaN(ano) || ano < 2020 || ano > anoAtual + 1) {
        await interaction.reply({
            embeds: [createErrorEmbed('Ano Invalido', `O ano deve ser um numero valido entre 2020 e ${anoAtual + 1}.`)],
            ephemeral: true
        });
        return;
    }
    // Parseia o valor
    const valor = parseFloat(valorStr.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
        await interaction.reply({
            embeds: [createErrorEmbed('Valor Invalido', 'O valor deve ser um numero positivo (ex: 100.00 ou 100,00).')],
            ephemeral: true
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    try {
        // Busca o membro
        const membro = await getMembro(userId, guildId);
        if (!membro) {
            await interaction.editReply({
                embeds: [createErrorEmbed('Erro', PermissionErrors.NOT_MEMBER)]
            });
            return;
        }
        // Verifica se ja pagou este periodo
        const pagamentoExistente = await prisma.pagamentoFgts.findUnique({
            where: {
                guildId_membroId_mesReferencia_anoReferencia: {
                    guildId,
                    membroId: membro.id,
                    mesReferencia: mes,
                    anoReferencia: ano
                }
            }
        });
        if (pagamentoExistente) {
            await interaction.editReply({
                embeds: [createErrorEmbed('Pagamento Duplicado', `Voce ja registrou o pagamento do FGTS para **${mes.toString().padStart(2, '0')}/${ano}**.\n\n` +
                        `ID do pagamento anterior: \`${pagamentoExistente.idTransacao}\``)]
            });
            return;
        }
        // Gera ID unico do pagamento
        const idTransacao = generateTransactionId();
        // Cria o pagamento
        await prisma.pagamentoFgts.create({
            data: {
                guildId,
                membroId: membro.id,
                mesReferencia: mes,
                anoReferencia: ano,
                valor,
                idTransacao,
                observacao
            }
        });
        // Busca configuracao para enviar ao canal
        const config = await prisma.configuracao.findUnique({
            where: { guildId }
        });
        const nomeMes = getNomeMes(mes);
        if (config?.canalFgts) {
            try {
                const channel = await interaction.client.channels.fetch(config.canalFgts);
                if (channel && channel instanceof TextChannel) {
                    const embed = createFgtsRegisteredEmbed(interaction.user, valor, idTransacao, mes, ano);
                    await channel.send({ embeds: [embed] });
                }
            }
            catch (error) {
                console.error('[Modal] Erro ao enviar para canal de FGTS:', error);
            }
        }
        // Registra log
        await registrarLog({
            guildId,
            acao: 'FGTS_PAGO',
            executorId: userId,
            executorNome: membro.nome,
            detalhes: `Valor: R$ ${valor.toFixed(2)} - Ref: ${nomeMes}/${ano} - ID: ${idTransacao}`
        });
        await interaction.editReply({
            embeds: [createSuccessEmbed('FGTS Pago', `Seu pagamento de FGTS foi registrado com sucesso!\n\n` +
                    `**Referencia:** ${nomeMes}/${ano}\n` +
                    `**Valor:** R$ ${valor.toFixed(2)}\n` +
                    `**ID do Pagamento:** \`${idTransacao}\`\n` +
                    `${observacao ? `**Observacao:** ${observacao}` : ''}`)]
        });
    }
    catch (error) {
        console.error('[Modal] Erro ao registrar FGTS:', error);
        await interaction.editReply({
            embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao registrar seu pagamento.')]
        });
    }
}
/**
 * Retorna o nome do mes por extenso
 */
function getNomeMes(mes) {
    const meses = [
        'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1] || 'Mes invalido';
}
// =============================================================================
// Funcoes Auxiliares
// =============================================================================
/**
 * Parseia uma data no formato DD/MM/AAAA
 * @param dateStr - String da data
 * @returns Objeto Date ou null se inválido
 */
function parseDate(dateStr) {
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match)
        return null;
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    // Verifica se a data é válida
    if (date.getDate() !== parseInt(day) ||
        date.getMonth() !== parseInt(month) - 1 ||
        date.getFullYear() !== parseInt(year)) {
        return null;
    }
    return date;
}
//# sourceMappingURL=modals.js.map