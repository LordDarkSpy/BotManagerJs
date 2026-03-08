// =============================================================================
// BotManagerJs - Agendador de Tarefas
// =============================================================================
// Este arquivo configura tarefas agendadas usando node-cron.
// Principalmente usado para notificar sobre retornos de ausência.
// =============================================================================
import cron from 'node-cron';
import { TextChannel } from 'discord.js';
import { prisma } from '../config/database.js';
import { createReturnNotificationEmbed } from './embeds.js';
// =============================================================================
// Variáveis do Módulo
// =============================================================================
// Referência ao cliente do Discord para enviar mensagens
let discordClient = null;
// Task do cron para poder cancelar se necessário
let ausenciaTask = null;
// =============================================================================
// Funções de Inicialização
// =============================================================================
/**
 * Inicializa o scheduler com o cliente do Discord
 * @param client - Cliente Discord.js inicializado
 */
export function initScheduler(client) {
    discordClient = client;
    // Agenda verificação de retornos de ausência
    // Executa todos os dias às 09:00
    ausenciaTask = cron.schedule('0 9 * * *', async () => {
        console.log('[Scheduler] Verificando ausências que terminam hoje...');
        await checkAusenciaReturns();
    }, {
        timezone: 'America/Sao_Paulo' // Fuso horário de Brasília
    });
    console.log('[Scheduler] Agendador de tarefas iniciado.');
    console.log('[Scheduler] Verificação de ausências agendada para 09:00 diariamente.');
}
/**
 * Para o scheduler
 * Chamado durante o encerramento do bot
 */
export function stopScheduler() {
    if (ausenciaTask) {
        ausenciaTask.stop();
        ausenciaTask = null;
        console.log('[Scheduler] Agendador de tarefas parado.');
    }
}
// =============================================================================
// Verificação de Retornos de Ausência
// =============================================================================
/**
 * Verifica e notifica sobre ausências que terminam hoje
 * Esta função é executada diariamente pelo cron job
 */
async function checkAusenciaReturns() {
    if (!discordClient) {
        console.error('[Scheduler] Cliente Discord não inicializado.');
        return;
    }
    try {
        // Data de início e fim do dia atual
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const fimDoDia = new Date(hoje);
        fimDoDia.setHours(23, 59, 59, 999);
        // Busca ausências que terminam hoje e ainda não foram notificadas
        const ausenciasHoje = await prisma.ausencia.findMany({
            where: {
                dataFim: {
                    gte: hoje,
                    lte: fimDoDia
                },
                notificado: false,
                status: 'ATIVA'
            },
            include: {
                membro: true
            }
        });
        console.log(`[Scheduler] Encontradas ${ausenciasHoje.length} ausências terminando hoje.`);
        // Processa cada ausência
        for (const ausencia of ausenciasHoje) {
            await notifyAusenciaReturn(ausencia);
        }
    }
    catch (error) {
        console.error('[Scheduler] Erro ao verificar retornos de ausência:', error);
    }
}
/**
 * Envia notificação de retorno de ausência
 * @param ausencia - Dados da ausência com membro incluído
 */
async function notifyAusenciaReturn(ausencia) {
    if (!discordClient)
        return;
    try {
        // Busca configuração do servidor para obter canal de ausência
        const config = await prisma.configuracao.findUnique({
            where: { guildId: ausencia.guildId }
        });
        // Se há canal de ausência configurado, envia lá
        if (config?.canalAusencia) {
            const channel = await discordClient.channels.fetch(config.canalAusencia);
            if (channel && channel instanceof TextChannel) {
                const embed = createReturnNotificationEmbed(ausencia.membro.discordId);
                await channel.send({
                    content: `<@${ausencia.membro.discordId}>`,
                    embeds: [embed]
                });
            }
        }
        // Tenta enviar DM também
        try {
            const user = await discordClient.users.fetch(ausencia.membro.discordId);
            const embed = createReturnNotificationEmbed(ausencia.membro.discordId);
            embed.setDescription('Seu período de ausência termina **hoje**!\n\n' +
                'Esperamos que esteja tudo bem e que você possa retornar às atividades. ' +
                'Caso precise de mais tempo, por favor registre uma nova ausência.');
            await user.send({ embeds: [embed] });
        }
        catch {
            // Usuário pode ter DMs desabilitadas, ignoramos o erro
            console.log(`[Scheduler] Não foi possível enviar DM para ${ausencia.membro.nome}`);
        }
        // Marca como notificado
        await prisma.ausencia.update({
            where: { id: ausencia.id },
            data: { notificado: true }
        });
        console.log(`[Scheduler] Notificação enviada para ${ausencia.membro.nome}`);
    }
    catch (error) {
        console.error(`[Scheduler] Erro ao notificar ausência ${ausencia.id}:`, error);
    }
}
// =============================================================================
// Funções Auxiliares
// =============================================================================
/**
 * Executa verificação manual de ausências
 * Útil para testes ou execução forçada
 */
export async function forceCheckAusencias() {
    console.log('[Scheduler] Executando verificação manual de ausências...');
    await checkAusenciaReturns();
}
/**
 * Agenda uma notificação única para uma data específica
 * @param date - Data para a notificação
 * @param callback - Função a ser executada
 * @returns ID do timeout para cancelamento
 */
export function scheduleNotification(date, callback) {
    const now = new Date();
    const delay = date.getTime() - now.getTime();
    // Se a data já passou, não agenda
    if (delay <= 0) {
        console.warn('[Scheduler] Data de notificação já passou, executando imediatamente.');
        callback();
        return setTimeout(() => { }, 0);
    }
    return setTimeout(callback, delay);
}
//# sourceMappingURL=scheduler.js.map