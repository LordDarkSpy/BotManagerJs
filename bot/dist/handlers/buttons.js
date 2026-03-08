// =============================================================================
// BotManagerJs - Handler de Botões
// =============================================================================
// Este arquivo processa todas as interações de botões do bot.
// Cada botão é identificado pelo seu customId e roteado para a função correta.
// =============================================================================
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { prisma } from '../config/database.js';
import { parseButtonId } from '../types/index.js';
import { createErrorEmbed, createSuccessEmbed, createSetApprovedEmbed } from '../utils/embeds.js';
import { checkBlacklist, hasPendingSetRequest, getMembro, canApproveSet, canManageCargos, PermissionErrors } from '../utils/permissions.js';
import { logSetAprovado, logCargoAlterado } from '../services/log.service.js';
// =============================================================================
// Handler Principal
// =============================================================================
/**
 * Processa interações de botões
 * @param interaction - Interação de botão
 */
export async function handleButton(interaction) {
    const { customId } = interaction;
    const parsed = parseButtonId(customId);
    console.log(`[Button] ${interaction.user.tag} clicou em: ${customId}`);
    // Roteia para o handler correto baseado na ação
    switch (parsed.action) {
        // Botões de Solicitação de Set
        case 'set':
            if (parsed.type === 'open') {
                await handleSetOpenModal(interaction);
            }
            else if (parsed.type === 'approve') {
                await handleSetApprove(interaction, parsed.id);
            }
            else if (parsed.type === 'reject') {
                await handleSetRejectModal(interaction, parsed.id);
            }
            break;
        // Botões de Gestao de Cargos
        case 'cargo':
            if (parsed.type === 'open') {
                await handleCargoOpenSelect(interaction);
            }
            else if (parsed.type === 'change') {
                // parsed.id contem "membroId_cargoId"
                const [membroId, cargoId] = parsed.id.split('_');
                if (cargoId) {
                    // Botao de aplicar cargo diretamente
                    await handleCargoApply(interaction, membroId, cargoId);
                }
                else {
                    // Botao antigo de selecionar cargo
                    await handleCargoChangeSelect(interaction, parsed.id);
                }
            }
            break;
        // Botões de Ausência
        case 'ausencia':
            if (parsed.type === 'open') {
                await handleAusenciaOpenModal(interaction);
            }
            break;
        // Botões de FGTS
        case 'fgts':
            if (parsed.type === 'open') {
                await handleFgtsOpenModal(interaction);
            }
            break;
        default:
            console.warn(`[Button] Ação desconhecida: ${parsed.action}`);
            await interaction.reply({
                embeds: [createErrorEmbed('Erro', 'Este botão não está mais disponível.')],
                ephemeral: true
            });
    }
}
// =============================================================================
// Handlers de Solicitação de Set
// =============================================================================
/**
 * Abre o modal de solicitação de Set
 */
async function handleSetOpenModal(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    // Verifica se está na blacklist
    const blacklistEntry = await checkBlacklist(userId, guildId);
    if (blacklistEntry) {
        await interaction.reply({
            embeds: [createErrorEmbed('Acesso Negado', `Você está na blacklist e não pode solicitar Set.\n\n**Motivo:** ${blacklistEntry.motivo}`)],
            ephemeral: true
        });
        return;
    }
    // Verifica se já é membro
    const membro = await getMembro(userId, guildId);
    if (membro) {
        await interaction.reply({
            embeds: [createErrorEmbed('Erro', PermissionErrors.ALREADY_MEMBER)],
            ephemeral: true
        });
        return;
    }
    // Verifica se já tem solicitação pendente
    const hasPending = await hasPendingSetRequest(userId, guildId);
    if (hasPending) {
        await interaction.reply({
            embeds: [createErrorEmbed('Erro', PermissionErrors.PENDING_REQUEST)],
            ephemeral: true
        });
        return;
    }
    // Cria o modal de solicitação
    const modal = new ModalBuilder()
        .setCustomId('set_submit')
        .setTitle('Solicitação de Set');
    // Campo: Nome
    const nomeInput = new TextInputBuilder()
        .setCustomId('nome')
        .setLabel('Seu nome completo ou apelido')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(50)
        .setPlaceholder('Ex: João Silva');
    // Campo: Telefone
    const telefoneInput = new TextInputBuilder()
        .setCustomId('telefone')
        .setLabel('Telefone de contato (com DDD)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(20)
        .setPlaceholder('Ex: (11) 99999-9999');
    // Campo: ID no Jogo
    const idJogoInput = new TextInputBuilder()
        .setCustomId('idJogo')
        .setLabel('Seu ID no jogo')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(50)
        .setPlaceholder('Ex: 12345678');
    // Campo: Recrutador
    const recrutadorInput = new TextInputBuilder()
        .setCustomId('recrutador')
        .setLabel('Quem te recrutou?')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(50)
        .setPlaceholder('Ex: Maria ou @maria');
    // Campo: Tipo (Adult/Baby)
    const tipoInput = new TextInputBuilder()
        .setCustomId('tipo')
        .setLabel('Tipo (digite ADULTO ou BABY)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(10)
        .setPlaceholder('ADULTO ou BABY');
    // Adiciona os campos ao modal
    modal.addComponents(new ActionRowBuilder().addComponents(nomeInput), new ActionRowBuilder().addComponents(telefoneInput), new ActionRowBuilder().addComponents(idJogoInput), new ActionRowBuilder().addComponents(recrutadorInput), new ActionRowBuilder().addComponents(tipoInput));
    await interaction.showModal(modal);
}
/**
 * Aprova uma solicitacao de Set e atribui o cargo no Discord
 */
async function handleSetApprove(interaction, solicitacaoId) {
    const guildId = interaction.guildId;
    const member = interaction.member;
    const guild = interaction.guild;
    // Verifica permissao
    const canApprove = await canApproveSet(member, guildId);
    if (!canApprove) {
        await interaction.reply({
            embeds: [createErrorEmbed('Sem Permissao', PermissionErrors.CANNOT_APPROVE_SET)],
            ephemeral: true
        });
        return;
    }
    // Busca a solicitacao
    const solicitacao = await prisma.solicitacaoSet.findUnique({
        where: { id: solicitacaoId }
    });
    if (!solicitacao || solicitacao.status !== 'PENDENTE') {
        await interaction.reply({
            embeds: [createErrorEmbed('Erro', 'Esta solicitacao ja foi processada ou nao existe.')],
            ephemeral: true
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    try {
        // Busca configuracao para obter os cargos de SET
        const config = await prisma.configuracao.findUnique({
            where: { guildId }
        });
        // Cria o membro no banco de dados
        const novoMembro = await prisma.membro.create({
            data: {
                guildId,
                discordId: solicitacao.solicitanteId,
                nome: solicitacao.solicitanteNome,
                telefone: solicitacao.telefone,
                idJogo: solicitacao.idJogo,
                recrutadorNome: solicitacao.recrutador,
                tipo: solicitacao.tipo,
                status: 'ATIVO'
            }
        });
        // Atualiza a solicitacao
        await prisma.solicitacaoSet.update({
            where: { id: solicitacaoId },
            data: {
                status: 'APROVADO',
                aprovadorId: interaction.user.id,
                aprovadorNome: interaction.user.username,
                dataDecisao: new Date(),
                membroId: novoMembro.id
            }
        });
        // Busca o membro do Discord para atribuir cargo
        let cargoAtribuido = false;
        try {
            const discordMember = await guild.members.fetch(solicitacao.solicitanteId);
            // Determina qual cargo atribuir baseado no tipo de SET
            const cargoId = solicitacao.tipo === 'BABY'
                ? config?.cargoSetBaby
                : config?.cargoSetAdulto;
            if (cargoId) {
                await discordMember.roles.add(cargoId);
                cargoAtribuido = true;
                console.log(`[Set] Cargo ${cargoId} atribuido a ${discordMember.user.tag}`);
            }
        }
        catch (error) {
            console.error('[Set] Erro ao atribuir cargo no Discord:', error);
        }
        // Busca o usuario aprovado
        const solicitante = await interaction.client.users.fetch(solicitacao.solicitanteId);
        // Tenta enviar DM
        try {
            await solicitante.send({
                embeds: [createSuccessEmbed('Set Aprovado!', 'Sua solicitacao de Set foi **aprovada**! Bem-vindo(a) a organizacao!')]
            });
        }
        catch {
            console.log(`[Set] Nao foi possivel enviar DM para ${solicitante.tag}`);
        }
        // Atualiza o embed original
        const approvedEmbed = createSetApprovedEmbed(solicitante, interaction.user);
        await interaction.message.edit({ embeds: [approvedEmbed], components: [] });
        // Registra log
        await logSetAprovado(guildId, interaction.user.id, interaction.user.username, solicitacao.solicitanteId, solicitacao.solicitanteNome);
        const mensagemCargo = cargoAtribuido
            ? '\nCargo atribuido no Discord com sucesso!'
            : '\nAviso: Cargo nao foi atribuido (verifique as configuracoes).';
        await interaction.editReply({
            embeds: [createSuccessEmbed('Aprovado', `Set de ${solicitacao.solicitanteNome} foi aprovado com sucesso!${mensagemCargo}`)]
        });
    }
    catch (error) {
        console.error('[Set] Erro ao aprovar:', error);
        await interaction.editReply({
            embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao aprovar a solicitacao.')]
        });
    }
}
/**
 * Abre modal para reprovar com motivo
 */
async function handleSetRejectModal(interaction, solicitacaoId) {
    const guildId = interaction.guildId;
    const member = interaction.member;
    // Verifica permissão
    const canApprove = await canApproveSet(member, guildId);
    if (!canApprove) {
        await interaction.reply({
            embeds: [createErrorEmbed('Sem Permissão', PermissionErrors.CANNOT_APPROVE_SET)],
            ephemeral: true
        });
        return;
    }
    // Cria modal para motivo
    const modal = new ModalBuilder()
        .setCustomId(`set_reject_confirm_${solicitacaoId}`)
        .setTitle('Reprovar Solicitação');
    const motivoInput = new TextInputBuilder()
        .setCustomId('motivo')
        .setLabel('Motivo da reprovação')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(500)
        .setPlaceholder('Opcional: explique o motivo da reprovação');
    modal.addComponents(new ActionRowBuilder().addComponents(motivoInput));
    await interaction.showModal(modal);
}
// =============================================================================
// Handlers de Gestão de Cargos
// =============================================================================
/**
 * Abre o menu de seleção de membros para gestão de cargos
 */
async function handleCargoOpenSelect(interaction) {
    const guildId = interaction.guildId;
    const member = interaction.member;
    // Verifica permissão
    const canManage = await canManageCargos(member, guildId);
    if (!canManage) {
        await interaction.reply({
            embeds: [createErrorEmbed('Sem Permissão', PermissionErrors.CANNOT_MANAGE_CARGOS)],
            ephemeral: true
        });
        return;
    }
    // Busca membros cadastrados
    const membros = await prisma.membro.findMany({
        where: { guildId, status: 'ATIVO' },
        include: { cargo: true },
        take: 25 // Limite do select menu
    });
    if (membros.length === 0) {
        await interaction.reply({
            embeds: [createErrorEmbed('Sem Membros', 'Não há membros cadastrados para gerenciar.')],
            ephemeral: true
        });
        return;
    }
    // Cria select menu com membros
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('cargo_select_member')
        .setPlaceholder('Selecione um membro')
        .addOptions(membros.map(m => new StringSelectMenuOptionBuilder()
        .setLabel(m.nome)
        .setDescription(`Cargo atual: ${m.cargo?.nome || 'Nenhum'}`)
        .setValue(m.id)));
    await interaction.reply({
        content: '**Selecione o membro que deseja gerenciar:**',
        components: [new ActionRowBuilder().addComponents(selectMenu)],
        ephemeral: true
    });
}
/**
 * Abre seleção de novo cargo para um membro
 */
async function handleCargoChangeSelect(interaction, membroId) {
    const guildId = interaction.guildId;
    // Busca cargos disponíveis
    const cargos = await prisma.cargo.findMany({
        where: { guildId },
        orderBy: { hierarquia: 'asc' }
    });
    if (cargos.length === 0) {
        await interaction.reply({
            embeds: [createErrorEmbed('Sem Cargos', 'Não há cargos cadastrados. Use /cargo-cadastrar primeiro.')],
            ephemeral: true
        });
        return;
    }
    // Cria select menu com cargos
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`cargo_set_${membroId}`)
        .setPlaceholder('Selecione o novo cargo')
        .addOptions(cargos.map(c => new StringSelectMenuOptionBuilder()
        .setLabel(c.nome)
        .setDescription(`Hierarquia: ${c.hierarquia}`)
        .setValue(c.id)));
    await interaction.reply({
        content: '**Selecione o novo cargo para este membro:**',
        components: [new ActionRowBuilder().addComponents(selectMenu)],
        ephemeral: true
    });
}
/**
 * Aplica um cargo a um membro e sincroniza com o Discord
 */
async function handleCargoApply(interaction, membroId, cargoId) {
    const guildId = interaction.guildId;
    const member = interaction.member;
    const guild = interaction.guild;
    // Verifica permissao
    const canManage = await canManageCargos(member, guildId);
    if (!canManage) {
        await interaction.reply({
            embeds: [createErrorEmbed('Sem Permissao', PermissionErrors.CANNOT_MANAGE_CARGOS)],
            ephemeral: true
        });
        return;
    }
    await interaction.deferUpdate();
    try {
        // Busca membro e cargos
        const [membro, novoCargo] = await Promise.all([
            prisma.membro.findUnique({
                where: { id: membroId },
                include: { cargo: true }
            }),
            prisma.cargo.findUnique({
                where: { id: cargoId }
            })
        ]);
        if (!membro || !novoCargo) {
            await interaction.followUp({
                embeds: [createErrorEmbed('Erro', 'Membro ou cargo nao encontrado.')],
                ephemeral: true
            });
            return;
        }
        const cargoAntigoNome = membro.cargo?.nome || 'Nenhum';
        const cargoAntigoDiscordId = membro.cargo?.discordRoleId;
        // Atualiza o cargo do membro no banco
        await prisma.membro.update({
            where: { id: membroId },
            data: { cargoId }
        });
        // Sincroniza com o Discord
        let sincronizadoDiscord = false;
        try {
            const discordMember = await guild.members.fetch(membro.discordId);
            // Remove cargo antigo do Discord se existir
            if (cargoAntigoDiscordId) {
                const oldRole = guild.roles.cache.get(cargoAntigoDiscordId);
                if (oldRole && discordMember.roles.cache.has(oldRole.id)) {
                    await discordMember.roles.remove(oldRole);
                }
            }
            // Adiciona novo cargo do Discord se configurado
            if (novoCargo.discordRoleId) {
                const newRole = guild.roles.cache.get(novoCargo.discordRoleId);
                if (newRole) {
                    await discordMember.roles.add(newRole);
                    sincronizadoDiscord = true;
                }
            }
        }
        catch (error) {
            console.error('[Cargo] Erro ao sincronizar com Discord:', error);
        }
        // Registra log
        await logCargoAlterado(guildId, interaction.user.id, interaction.user.username, membro.discordId, membro.nome, cargoAntigoNome, novoCargo.nome);
        const mensagemSync = sincronizadoDiscord
            ? '\nCargo sincronizado com o Discord!'
            : novoCargo.discordRoleId
                ? '\nAviso: Nao foi possivel sincronizar com o Discord.'
                : '';
        await interaction.editReply({
            content: null,
            embeds: [createSuccessEmbed('Cargo Alterado', `**Membro:** ${membro.nome}\n` +
                    `**Cargo anterior:** ${cargoAntigoNome}\n` +
                    `**Novo cargo:** ${novoCargo.nome}\n` +
                    `**Alterado por:** ${interaction.user.username}${mensagemSync}`)],
            components: []
        });
    }
    catch (error) {
        console.error('[Cargo] Erro ao alterar cargo:', error);
        await interaction.followUp({
            embeds: [createErrorEmbed('Erro', 'Ocorreu um erro ao alterar o cargo.')],
            ephemeral: true
        });
    }
}
// =============================================================================
// Handlers de Ausencia
// =============================================================================
/**
 * Abre modal de registro de ausencia
 */
async function handleAusenciaOpenModal(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    // Verifica se é membro cadastrado
    const membro = await getMembro(userId, guildId);
    if (!membro) {
        await interaction.reply({
            embeds: [createErrorEmbed('Erro', PermissionErrors.NOT_MEMBER)],
            ephemeral: true
        });
        return;
    }
    // Cria modal
    const modal = new ModalBuilder()
        .setCustomId('ausencia_submit')
        .setTitle('Registro de Ausência');
    const dataInicioInput = new TextInputBuilder()
        .setCustomId('dataInicio')
        .setLabel('Data de início (DD/MM/AAAA)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(10)
        .setPlaceholder('Ex: 25/12/2024');
    const dataFimInput = new TextInputBuilder()
        .setCustomId('dataFim')
        .setLabel('Data de retorno (DD/MM/AAAA)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(10)
        .setPlaceholder('Ex: 01/01/2025');
    const motivoInput = new TextInputBuilder()
        .setCustomId('motivo')
        .setLabel('Motivo (opcional)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(500)
        .setPlaceholder('Explique o motivo da sua ausência');
    modal.addComponents(new ActionRowBuilder().addComponents(dataInicioInput), new ActionRowBuilder().addComponents(dataFimInput), new ActionRowBuilder().addComponents(motivoInput));
    await interaction.showModal(modal);
}
// =============================================================================
// Handlers de FGTS
// =============================================================================
/**
 * Abre modal de pagamento de FGTS
 * FGTS e uma taxa obrigatoria que todos os membros devem pagar mensalmente
 */
async function handleFgtsOpenModal(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    // Verifica se e membro cadastrado
    const membro = await getMembro(userId, guildId);
    if (!membro) {
        await interaction.reply({
            embeds: [createErrorEmbed('Erro', PermissionErrors.NOT_MEMBER)],
            ephemeral: true
        });
        return;
    }
    // Obtem mes/ano atual para sugerir no placeholder
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    // Cria modal
    const modal = new ModalBuilder()
        .setCustomId('fgts_submit')
        .setTitle('Pagamento de FGTS');
    const mesInput = new TextInputBuilder()
        .setCustomId('mes')
        .setLabel('Mes de referencia (1-12)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(2)
        .setPlaceholder(`Ex: ${mesAtual}`)
        .setValue(String(mesAtual));
    const anoInput = new TextInputBuilder()
        .setCustomId('ano')
        .setLabel('Ano de referencia')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(4)
        .setPlaceholder(`Ex: ${anoAtual}`)
        .setValue(String(anoAtual));
    const valorInput = new TextInputBuilder()
        .setCustomId('valor')
        .setLabel('Valor pago')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(20)
        .setPlaceholder('Ex: 100.00');
    const observacaoInput = new TextInputBuilder()
        .setCustomId('observacao')
        .setLabel('Observacao (opcional)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(500)
        .setPlaceholder('Observacoes adicionais');
    modal.addComponents(new ActionRowBuilder().addComponents(mesInput), new ActionRowBuilder().addComponents(anoInput), new ActionRowBuilder().addComponents(valorInput), new ActionRowBuilder().addComponents(observacaoInput));
    await interaction.showModal(modal);
}
//# sourceMappingURL=buttons.js.map