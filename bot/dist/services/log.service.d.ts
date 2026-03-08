import { Client } from 'discord.js';
import { LogAction, LogData } from '../types/index.js';
/**
 * Inicializa o serviço de logs com o cliente do Discord
 * @param client - Cliente Discord.js inicializado
 */
export declare function initLogService(client: Client): void;
/**
 * Registra uma ação no banco de dados e opcionalmente envia para um canal
 * @param data - Dados do log a ser registrado
 * @returns ID do log criado
 */
export declare function registrarLog(data: LogData): Promise<string>;
/**
 * Busca logs por servidor com paginação
 * @param guildId - ID do servidor
 * @param page - Número da página (começa em 1)
 * @param pageSize - Quantidade de itens por página
 * @returns Logs paginados
 */
export declare function buscarLogs(guildId: string, page?: number, pageSize?: number): Promise<{
    logs: {
        id: string;
        createdAt: Date;
        guildId: string;
        acao: string;
        detalhes: string | null;
        executorId: string;
        executorNome: string | null;
        alvoId: string | null;
        alvoNome: string | null;
        ip: string | null;
        userAgent: string | null;
    }[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}>;
/**
 * Busca logs por tipo de ação
 * @param guildId - ID do servidor
 * @param acao - Tipo de ação
 * @param limit - Limite de resultados
 * @returns Lista de logs
 */
export declare function buscarLogsPorAcao(guildId: string, acao: LogAction, limit?: number): Promise<{
    id: string;
    createdAt: Date;
    guildId: string;
    acao: string;
    detalhes: string | null;
    executorId: string;
    executorNome: string | null;
    alvoId: string | null;
    alvoNome: string | null;
    ip: string | null;
    userAgent: string | null;
}[]>;
/**
 * Busca logs de um usuário específico (como executor ou alvo)
 * @param guildId - ID do servidor
 * @param userId - ID do usuário
 * @param limit - Limite de resultados
 * @returns Lista de logs
 */
export declare function buscarLogsPorUsuario(guildId: string, userId: string, limit?: number): Promise<{
    id: string;
    createdAt: Date;
    guildId: string;
    acao: string;
    detalhes: string | null;
    executorId: string;
    executorNome: string | null;
    alvoId: string | null;
    alvoNome: string | null;
    ip: string | null;
    userAgent: string | null;
}[]>;
/**
 * Busca logs por período
 * @param guildId - ID do servidor
 * @param dataInicio - Data de início
 * @param dataFim - Data de fim
 * @returns Lista de logs
 */
export declare function buscarLogsPorPeriodo(guildId: string, dataInicio: Date, dataFim: Date): Promise<{
    id: string;
    createdAt: Date;
    guildId: string;
    acao: string;
    detalhes: string | null;
    executorId: string;
    executorNome: string | null;
    alvoId: string | null;
    alvoNome: string | null;
    ip: string | null;
    userAgent: string | null;
}[]>;
/**
 * Registra log de Set solicitado
 */
export declare function logSetSolicitado(guildId: string, solicitanteId: string, solicitanteNome: string, dados: string): Promise<void>;
/**
 * Registra log de Set aprovado
 */
export declare function logSetAprovado(guildId: string, aprovadorId: string, aprovadorNome: string, solicitanteId: string, solicitanteNome: string): Promise<void>;
/**
 * Registra log de Set reprovado
 */
export declare function logSetReprovado(guildId: string, aprovadorId: string, aprovadorNome: string, solicitanteId: string, solicitanteNome: string, motivo?: string): Promise<void>;
/**
 * Registra log de alteração de cargo
 */
export declare function logCargoAlterado(guildId: string, executorId: string, executorNome: string, alvoId: string, alvoNome: string, cargoAntigo: string, cargoNovo: string): Promise<void>;
/**
 * Registra log de adição à blacklist
 */
export declare function logBlacklistAdd(guildId: string, executorId: string, executorNome: string, alvoId: string, alvoNome: string, motivo: string): Promise<void>;
/**
 * Registra log de remoção da blacklist
 */
export declare function logBlacklistRemove(guildId: string, executorId: string, executorNome: string, alvoId: string, alvoNome: string): Promise<void>;
//# sourceMappingURL=log.service.d.ts.map