import { Client } from 'discord.js';
/**
 * Inicializa o scheduler com o cliente do Discord
 * @param client - Cliente Discord.js inicializado
 */
export declare function initScheduler(client: Client): void;
/**
 * Para o scheduler
 * Chamado durante o encerramento do bot
 */
export declare function stopScheduler(): void;
/**
 * Executa verificação manual de ausências
 * Útil para testes ou execução forçada
 */
export declare function forceCheckAusencias(): Promise<void>;
/**
 * Agenda uma notificação única para uma data específica
 * @param date - Data para a notificação
 * @param callback - Função a ser executada
 * @returns ID do timeout para cancelamento
 */
export declare function scheduleNotification(date: Date, callback: () => void): NodeJS.Timeout;
//# sourceMappingURL=scheduler.d.ts.map