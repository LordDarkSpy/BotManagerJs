// =============================================================================
// BotManagerJs - Arquivo Principal
// =============================================================================
// Este é o ponto de entrada do bot Discord.
// Aqui configuramos o cliente, carregamos os comandos e iniciamos o bot.
// =============================================================================

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { config } from 'dotenv';
import { ExtendedClient, SlashCommand } from './types/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { readyHandler } from './events/ready.js';
import { interactionCreateHandler } from './events/interactionCreate.js';
import { stopScheduler } from './utils/scheduler.js';

// Importa todos os comandos
import setButton from './commands/set-button.js';
import cargoManagement from './commands/cargo-management.js';
import ausenciaButton from './commands/ausencia-button.js';
import fgtsButton from './commands/fgts-button.js';
import fgtsReport from './commands/fgts-report.js';
import cargoRegister from './commands/cargo-register.js';
import sendMessage from './commands/send-message.js';
import blacklistAdd from './commands/blacklist-add.js';
import blacklistRemove from './commands/blacklist-remove.js';
import punicao from './commands/punicao.js';
import tipoPunicao from './commands/tipo-punicao.js';

// =============================================================================
// Carrega variáveis de ambiente do .env da pasta raiz
// =============================================================================

config({ path: '../.env' });

// Verifica se o token está definido
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ DISCORD_TOKEN não está definido no arquivo .env');
  console.error('   Por favor, crie um arquivo .env com o token do seu bot.');
  process.exit(1);
}

// =============================================================================
// Configuração do Cliente
// =============================================================================

/**
 * Cria o cliente do Discord com as intents necessárias
 * 
 * Intents utilizadas:
 * - Guilds: Para acessar informações dos servidores
 * - GuildMembers: Para acessar informações dos membros
 * - GuildMessages: Para receber eventos de mensagens
 * - DirectMessages: Para receber/enviar DMs
 * - MessageContent: Para ler conteúdo das mensagens (se necessário)
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel, // Necessário para DMs
    Partials.Message,
    Partials.User,
  ],
}) as ExtendedClient;

// =============================================================================
// Carrega Comandos
// =============================================================================

// Inicializa as coleções
client.commands = new Collection<string, SlashCommand>();
client.cooldowns = new Collection();

// Lista de comandos
const commands: SlashCommand[] = [
  setButton,
  cargoManagement,
  ausenciaButton,
  fgtsButton,
  fgtsReport,
  cargoRegister,
  sendMessage,
  blacklistAdd,
  blacklistRemove,
  punicao,
  tipoPunicao
];

// Registra cada comando na coleção
for (const command of commands) {
  client.commands.set(command.data.name, command);
  console.log(`[Commands] Comando carregado: /${command.data.name}`);
}

console.log(`[Commands] Total de ${client.commands.size} comandos carregados.`);

// =============================================================================
// Registra Eventos
// =============================================================================

// Evento: Bot está pronto
client.once('ready', async () => {
  await readyHandler(client);
});

// Evento: Interação recebida (comandos, botões, modais, etc.)
client.on('interactionCreate', async (interaction) => {
  await interactionCreateHandler(interaction);
});

// =============================================================================
// Tratamento de Erros Globais
// =============================================================================

// Erro não capturado
process.on('uncaughtException', (error) => {
  console.error('[Error] Uncaught Exception:', error);
});

// Promise não tratada
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Error] Unhandled Rejection at:', promise, 'reason:', reason);
});

// =============================================================================
// Encerramento Gracioso
// =============================================================================

async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n[Shutdown] Recebido ${signal}. Encerrando graciosamente...`);

  // Para o scheduler
  stopScheduler();

  // Desconecta do Discord
  client.destroy();
  console.log('[Shutdown] Desconectado do Discord.');

  // Desconecta do banco de dados
  await disconnectDatabase();

  console.log('[Shutdown] Encerramento completo.');
  process.exit(0);
}

// Escuta sinais de término
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// =============================================================================
// Inicialização
// =============================================================================

async function start(): Promise<void> {
  console.log('='.repeat(50));
  console.log('      BotManagerJs - Iniciando...');
  console.log('='.repeat(50));

  try {
    // Conecta ao banco de dados
    console.log('[Init] Conectando ao banco de dados...');
    await connectDatabase();

    // Faz login no Discord
    console.log('[Init] Conectando ao Discord...');
    await client.login(token);

  } catch (error) {
    console.error('[Init] Erro fatal durante inicialização:', error);
    process.exit(1);
  }
}

// Inicia o bot
start();
