import { Interaction } from 'discord.js';
/**
 * Handler principal do evento interactionCreate
 * Roteia cada tipo de interação para seu handler específico
 */
export declare function interactionCreateHandler(interaction: Interaction): Promise<void>;
/**
 * Exportação do evento para registro
 */
export declare const event: {
    name: string;
    once: boolean;
    execute: typeof interactionCreateHandler;
};
//# sourceMappingURL=interactionCreate.d.ts.map