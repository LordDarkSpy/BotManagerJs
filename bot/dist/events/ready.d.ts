import { Client } from 'discord.js';
/**
 * Handler do evento ready
 * Executado uma única vez quando o bot fica online
 */
export declare function readyHandler(client: Client): Promise<void>;
/**
 * Exportação do evento para registro
 */
export declare const event: {
    name: string;
    once: boolean;
    execute: typeof readyHandler;
};
//# sourceMappingURL=ready.d.ts.map