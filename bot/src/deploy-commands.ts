// =============================================================================
// BotManagerJs - Script de Deploy de Comandos
// =============================================================================
// Este script registra os comandos slash no Discord.
// Execute este script sempre que adicionar ou modificar comandos.
// Uso: pnpm run deploy-commands
// =============================================================================

import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';

// Carrega variáveis de ambiente do .env da pasta raiz
config({ path: '../.env' });

// Importa todos os comandos
import setButton from './commands/set-button.js';
import cargoManagement from './commands/cargo-management.js';
import ausenciaButton from './commands/ausencia-button.js';
import fgtsButton from './commands/fgts-button.js';
import fgtsReport from './commands/fgts-report.js';
import fgtsPendentes from './commands/fgts-pendentes.js';
import cargoRegister from './commands/cargo-register.js';
import sendMessage from './commands/send-message.js';
import blacklistAdd from './commands/blacklist-add.js';
import blacklistRemove from './commands/blacklist-remove.js';
import punicao from './commands/punicao.js';
import tipoPunicao from './commands/tipo-punicao.js';

// =============================================================================
// Lista de Comandos
// =============================================================================

const commands = [
  setButton,
  cargoManagement,
  ausenciaButton,
  fgtsButton,
  fgtsReport,
  fgtsPendentes,
  cargoRegister,
  sendMessage,
  blacklistAdd,
  blacklistRemove,
  punicao,
  tipoPunicao
];

// =============================================================================
// Deploy dos Comandos
// =============================================================================

async function deployCommands(): Promise<void> {
  // Verifica variáveis de ambiente
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID; // Opcional - para registro instantâneo

  if (!token) {
    console.error('❌ DISCORD_TOKEN não definido no .env');
    process.exit(1);
  }

  if (!clientId) {
    console.error('❌ DISCORD_CLIENT_ID não definido no .env');
    process.exit(1);
  }

  // Prepara os dados dos comandos
  const commandsData = commands.map(cmd => cmd.data.toJSON());

  // Configura o REST client
  const rest = new REST().setToken(token);

  try {
    console.log('='.repeat(50));
    console.log(`🔄 Iniciando deploy de ${commandsData.length} comandos...`);
    console.log('='.repeat(50));

    // Lista os comandos que serão registrados
    console.log('\n📋 Comandos a serem registrados:');
    commandsData.forEach((cmd, index) => {
      console.log(`  ${index + 1}. /${cmd.name} - ${cmd.description}`);
    });
    console.log();

    // Se GUILD_ID definido, registra no servidor específico (instantâneo)
    // Caso contrário, registra globalmente (até 1 hora para propagar)
    let data: unknown[];
    
    if (guildId) {
      console.log(`📍 Registrando comandos no servidor: ${guildId}`);
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandsData }
      ) as unknown[];
    } else {
      console.log('🌐 Registrando comandos globalmente...');
      data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commandsData }
      ) as unknown[];
    }

    console.log('='.repeat(50));
    console.log(`✅ ${data.length} comandos registrados com sucesso!`);
    console.log('='.repeat(50));

    if (guildId) {
      console.log('\n💡 Comandos registrados no servidor - atualização instantânea!');
    } else {
      console.log('\n💡 Dicas:');
      console.log('  - Os comandos podem levar até 1 hora para aparecer globalmente.');
      console.log('  - Para atualizações instantâneas, defina DISCORD_GUILD_ID no .env');
    }
    console.log();
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
    process.exit(1);
  }
}

// =============================================================================
// Execução
// =============================================================================

deployCommands();
