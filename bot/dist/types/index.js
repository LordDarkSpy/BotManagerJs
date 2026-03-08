// =============================================================================
// BotManagerJs - Tipos e Interfaces TypeScript
// =============================================================================
// Este arquivo contém todas as definições de tipos utilizadas pelo bot.
// Centralizar os tipos aqui facilita a manutenção e garante consistência.
// =============================================================================
// =============================================================================
// Tipos de Embed
// =============================================================================
/**
 * Cores padrão para embeds
 */
export const EmbedColors = {
    SUCCESS: 0x00ff00, // Verde - Sucesso
    ERROR: 0xff0000, // Vermelho - Erro
    WARNING: 0xffff00, // Amarelo - Aviso
    INFO: 0x0099ff, // Azul - Informação
    PENDING: 0xff9900, // Laranja - Pendente
    NEUTRAL: 0x808080, // Cinza - Neutro
    PRIMARY: 0x5865f2, // Azul Discord - Primário
};
/**
 * Função auxiliar para parsear IDs de botões
 * @param customId - ID customizado do botão
 * @returns Objeto com as partes do ID parseadas
 */
export function parseButtonId(customId) {
    const parts = customId.split('_');
    return {
        action: parts[0] || '',
        type: parts[1],
        id: parts.slice(2).join('_'),
    };
}
//# sourceMappingURL=index.js.map