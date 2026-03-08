import { EmbedBuilder, User } from 'discord.js';
/**
 * Cria um embed de sucesso
 * @param title - Título do embed
 * @param description - Descrição/mensagem
 * @returns EmbedBuilder configurado
 */
export declare function createSuccessEmbed(title: string, description: string): EmbedBuilder;
/**
 * Cria um embed de erro
 * @param title - Título do embed
 * @param description - Descrição do erro
 * @returns EmbedBuilder configurado
 */
export declare function createErrorEmbed(title: string, description: string): EmbedBuilder;
/**
 * Cria um embed de aviso
 * @param title - Título do embed
 * @param description - Descrição do aviso
 * @returns EmbedBuilder configurado
 */
export declare function createWarningEmbed(title: string, description: string): EmbedBuilder;
/**
 * Cria um embed informativo
 * @param title - Título do embed
 * @param description - Descrição/informação
 * @returns EmbedBuilder configurado
 */
export declare function createInfoEmbed(title: string, description: string): EmbedBuilder;
/**
 * Cria o embed do botão de solicitação de Set
 * Este é o embed que aparece quando o admin usa /set-button
 * @param botName - Nome personalizado do bot (opcional)
 * @param botImage - URL da imagem do bot (opcional)
 * @returns EmbedBuilder configurado
 */
export declare function createSetButtonEmbed(botName?: string, botImage?: string): EmbedBuilder;
/**
 * Cria o embed de uma solicitação de Set pendente
 * Este embed aparece no canal de aprovação para os aprovadores analisarem
 * @param solicitante - Usuário que fez a solicitação
 * @param dados - Dados preenchidos no formulário
 * @returns EmbedBuilder configurado
 */
export declare function createSetRequestEmbed(solicitante: User, dados: {
    nome: string;
    telefone: string;
    idJogo: string;
    recrutador: string;
    tipo: string;
}): EmbedBuilder;
/**
 * Cria o embed de Set aprovado
 * @param solicitante - Usuário que teve o Set aprovado
 * @param aprovador - Usuário que aprovou
 * @returns EmbedBuilder configurado
 */
export declare function createSetApprovedEmbed(solicitante: User, aprovador: User): EmbedBuilder;
/**
 * Cria o embed de Set reprovado
 * @param solicitante - Usuário que teve o Set reprovado
 * @param aprovador - Usuário que reprovou
 * @param motivo - Motivo da reprovação
 * @returns EmbedBuilder configurado
 */
export declare function createSetRejectedEmbed(solicitante: User, aprovador: User, motivo?: string): EmbedBuilder;
/**
 * Cria o embed do botão de gestão de cargos
 * @returns EmbedBuilder configurado
 */
export declare function createCargoManagementEmbed(): EmbedBuilder;
/**
 * Cria embed mostrando a alteração de cargo de um membro
 * @param membro - Nome do membro
 * @param cargoAntigo - Nome do cargo anterior
 * @param cargoNovo - Nome do novo cargo
 * @param executor - Usuário que fez a alteração
 * @returns EmbedBuilder configurado
 */
export declare function createCargoChangeEmbed(membro: string, cargoAntigo: string, cargoNovo: string, executor: User): EmbedBuilder;
/**
 * Cria o embed do botão de registro de ausência
 * @returns EmbedBuilder configurado
 */
export declare function createAusenciaButtonEmbed(): EmbedBuilder;
/**
 * Cria embed de confirmação de ausência registrada
 * @param membro - Usuário que registrou ausência
 * @param dataInicio - Data de início formatada
 * @param dataFim - Data de fim formatada
 * @param motivo - Motivo da ausência
 * @returns EmbedBuilder configurado
 */
export declare function createAusenciaRegisteredEmbed(membro: User, dataInicio: string, dataFim: string, motivo?: string): EmbedBuilder;
/**
 * Cria embed de notificação de retorno
 * @param membroId - ID do membro que deve retornar
 * @returns EmbedBuilder configurado
 */
export declare function createReturnNotificationEmbed(membroId: string): EmbedBuilder;
/**
 * Cria o embed do botao de pagamento de FGTS
 * O FGTS e uma taxa obrigatoria mensal que todos os membros devem pagar
 * @returns EmbedBuilder configurado
 */
export declare function createFgtsButtonEmbed(): EmbedBuilder;
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
export declare function createFgtsRegisteredEmbed(membro: User, valor: number, idTransacao: string, mes?: number, ano?: number, imageUrl?: string): EmbedBuilder;
/**
 * Cria embed de relatório de FGTS
 * @param transacoes - Lista de transações
 * @param dataInicio - Data de início do período
 * @param dataFim - Data de fim do período
 * @param total - Soma total dos valores
 * @returns EmbedBuilder configurado
 */
export declare function createFgtsReportEmbed(transacoes: Array<{
    membro: string;
    valor: number;
    data: Date;
}>, dataInicio: string, dataFim: string, total: number): EmbedBuilder;
/**
 * Cria embed de adição à blacklist
 * @param usuario - Nome/ID do usuário banido
 * @param motivo - Motivo do banimento
 * @param executor - Quem adicionou à blacklist
 * @returns EmbedBuilder configurado
 */
export declare function createBlacklistAddedEmbed(usuario: string, motivo: string, executor: User): EmbedBuilder;
/**
 * Cria embed de remoção da blacklist
 * @param usuario - Nome/ID do usuário removido
 * @param executor - Quem removeu da blacklist
 * @returns EmbedBuilder configurado
 */
export declare function createBlacklistRemovedEmbed(usuario: string, executor: User): EmbedBuilder;
/**
 * Formata um valor numérico para moeda brasileira (R$)
 * @param valor - Valor numérico
 * @returns String formatada (ex: R$ 1.234,56)
 */
export declare function formatCurrency(valor: number): string;
/**
 * Formata uma data para o padrão brasileiro
 * @param date - Objeto Date
 * @returns String formatada (ex: 25/12/2024)
 */
export declare function formatDate(date: Date): string;
/**
 * Formata data e hora para o padrão brasileiro
 * @param date - Objeto Date
 * @returns String formatada (ex: 25/12/2024 14:30)
 */
export declare function formatDateTime(date: Date): string;
//# sourceMappingURL=embeds.d.ts.map