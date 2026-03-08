// =============================================================================
// BotManagerJs - Evento InteractionCreate
// =============================================================================
// Este evento é disparado sempre que uma interação ocorre (comandos, botões,
// modais, menus de seleção). É o coração do sistema de interação do bot.
// =============================================================================
import { handleButton } from '../handlers/buttons.js';
import { handleModal } from '../handlers/modals.js';
import { handleSelectMenu } from '../handlers/selectMenus.js';
import { createErrorEmbed } from '../utils/embeds.js';
/**
 * Handler principal do evento interactionCreate
 * Roteia cada tipo de interação para seu handler específico
 */
export async function interactionCreateHandler(interaction) {
    // Obtém o cliente estendido
    const client = interaction.client;
    try {
        // ==========================================================================
        // Slash Commands
        // ==========================================================================
        if (interaction.isChatInputCommand()) {
            await handleSlashCommand(interaction, client);
            return;
        }
        // ==========================================================================
        // Botões
        // ==========================================================================
        if (interaction.isButton()) {
            await handleButton(interaction);
            return;
        }
        // ==========================================================================
        // Modais
        // ==========================================================================
        if (interaction.isModalSubmit()) {
            await handleModal(interaction);
            return;
        }
        // ==========================================================================
        // Menus de Seleção
        // ==========================================================================
        if (interaction.isStringSelectMenu()) {
            await handleSelectMenu(interaction);
            return;
        }
        // Autocomplete (se implementado no futuro)
        if (interaction.isAutocomplete()) {
            // TODO: Implementar autocomplete se necessário
            return;
        }
    }
    catch (error) {
        console.error('[InteractionCreate] Erro ao processar interação:', error);
        // Tenta enviar mensagem de erro para o usuário
        await sendErrorResponse(interaction, error);
    }
}
// =============================================================================
// Handler de Slash Commands
// =============================================================================
/**
 * Processa comandos slash
 * @param interaction - Interação de comando
 * @param client - Cliente estendido do bot
 */
async function handleSlashCommand(interaction, client) {
    // Busca o comando registrado
    const command = client.commands.get(interaction.commandName);
    // Comando não encontrado
    if (!command) {
        console.warn(`[Command] Comando não encontrado: ${interaction.commandName}`);
        await interaction.reply({
            embeds: [createErrorEmbed('Comando não encontrado', 'Este comando não está mais disponível.')],
            ephemeral: true
        });
        return;
    }
    // Verifica se o comando é apenas para administradores
    if (command.adminOnly && !interaction.memberPermissions?.has('Administrator')) {
        await interaction.reply({
            embeds: [createErrorEmbed('Sem permissão', 'Este comando é apenas para administradores.')],
            ephemeral: true
        });
        return;
    }
    // Verifica cooldown
    if (command.cooldown) {
        const cooldownResult = checkCooldown(interaction, command.cooldown, client);
        if (cooldownResult.onCooldown) {
            await interaction.reply({
                embeds: [createErrorEmbed('Aguarde', `Você pode usar este comando novamente em ${cooldownResult.remaining} segundos.`)],
                ephemeral: true
            });
            return;
        }
    }
    // Log do comando
    console.log(`[Command] ${interaction.user.tag} executou /${interaction.commandName} em ${interaction.guild?.name || 'DM'}`);
    // Executa o comando
    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(`[Command] Erro ao executar /${interaction.commandName}:`, error);
        // Responde com erro
        const errorEmbed = createErrorEmbed('Erro ao executar comando', 'Ocorreu um erro ao processar este comando. Tente novamente mais tarde.');
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        }
        else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}
// =============================================================================
// Sistema de Cooldown
// =============================================================================
/**
 * Verifica se o usuário está em cooldown para um comando
 * @param interaction - Interação do comando
 * @param cooldownSeconds - Tempo de cooldown em segundos
 * @param client - Cliente estendido
 * @returns Objeto com status do cooldown
 */
function checkCooldown(interaction, cooldownSeconds, client) {
    const now = Date.now();
    const userId = interaction.user.id;
    const commandName = interaction.commandName;
    // Inicializa coleção de cooldowns se não existir
    if (!client.cooldowns.has(commandName)) {
        client.cooldowns.set(commandName, new Map());
    }
    const timestamps = client.cooldowns.get(commandName);
    const cooldownAmount = cooldownSeconds * 1000;
    // Verifica se o usuário tem um timestamp registrado
    if (timestamps.has(userId)) {
        const expirationTime = timestamps.get(userId) + cooldownAmount;
        if (now < expirationTime) {
            const remaining = Math.ceil((expirationTime - now) / 1000);
            return { onCooldown: true, remaining };
        }
    }
    // Registra o timestamp atual
    timestamps.set(userId, now);
    // Remove o timestamp após o cooldown expirar
    setTimeout(() => timestamps.delete(userId), cooldownAmount);
    return { onCooldown: false, remaining: 0 };
}
// =============================================================================
// Resposta de Erro Genérica
// =============================================================================
/**
 * Envia uma resposta de erro para o usuário
 * @param interaction - Qualquer tipo de interação
 * @param error - Erro ocorrido
 */
async function sendErrorResponse(interaction, error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorEmbed = createErrorEmbed('Erro', `Ocorreu um erro: ${errorMessage}`);
    try {
        // Tenta responder de acordo com o tipo de interação
        if (interaction.isRepliable()) {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            }
            else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
    catch {
        // Se falhar ao responder, apenas loga
        console.error('[InteractionCreate] Não foi possível enviar resposta de erro');
    }
}
/**
 * Exportação do evento para registro
 */
export const event = {
    name: 'interactionCreate',
    once: false,
    execute: interactionCreateHandler
};
//# sourceMappingURL=interactionCreate.js.map