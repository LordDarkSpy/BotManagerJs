import { StringSelectMenuInteraction } from 'discord.js';
/**
 * Processa interações de menus de seleção
 * @param interaction - Interação de menu de seleção
 */
export declare function handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<void>;
/**
 * Gera um ID único para transações
 * Formato: FGTS-AAAAMMDDHHMM-XXXX (onde XXXX é aleatório)
 */
export declare function generateTransactionId(): string;
//# sourceMappingURL=selectMenus.d.ts.map