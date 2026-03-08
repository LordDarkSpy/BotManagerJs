// =============================================================================
// BotManagerJs - Evento Ready
// =============================================================================
// Este evento é disparado quando o bot se conecta ao Discord com sucesso.
// Aqui inicializamos serviços e definimos status do bot.
// =============================================================================

import { Client, ActivityType } from 'discord.js';
import { initScheduler } from '../utils/scheduler.js';
import { initLogService } from '../services/log.service.js';

/**
 * Handler do evento ready
 * Executado uma única vez quando o bot fica online
 */
export async function readyHandler(client: Client): Promise<void> {
  // Verifica se o cliente está pronto
  if (!client.user) {
    console.error('[Ready] Cliente não tem usuário associado!');
    return;
  }

  console.log('='.repeat(50));
  console.log(`[Ready] Bot conectado como ${client.user.tag}`);
  console.log(`[Ready] Servindo ${client.guilds.cache.size} servidor(es)`);
  console.log('='.repeat(50));

  // Define o status/atividade do bot
  client.user.setPresence({
    activities: [
      {
        name: 'Gerenciando membros',
        type: ActivityType.Watching
      }
    ],
    status: 'online'
  });

  // Inicializa o scheduler de tarefas (notificações de ausência)
  initScheduler(client);

  // Inicializa o serviço de logs
  initLogService(client);

  // Lista os servidores conectados
  console.log('[Ready] Servidores conectados:');
  client.guilds.cache.forEach((guild) => {
    console.log(`  - ${guild.name} (${guild.id}) - ${guild.memberCount} membros`);
  });

  console.log('[Ready] Bot totalmente inicializado e pronto para uso!');
}

/**
 * Exportação do evento para registro
 */
export const event = {
  name: 'ready',
  once: true,
  execute: readyHandler
};
