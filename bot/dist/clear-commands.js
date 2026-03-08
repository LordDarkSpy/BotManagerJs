// =============================================================================
// BotManagerJs - Script de Limpeza de Comandos
// =============================================================================
// Este script remove todos os comandos registrados no Discord.
// Use quando precisar limpar comandos antigos ou duplicados.
// Uso: npm run clear-commands
// =============================================================================
import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
// Carrega variáveis de ambiente do .env da pasta raiz
config({ path: '../.env' });
async function clearCommands() {
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const guildId = process.env.DISCORD_GUILD_ID; // Opcional: para limpar comandos de servidor específico
    if (!token) {
        console.error('❌ DISCORD_TOKEN não definido no .env');
        process.exit(1);
    }
    if (!clientId) {
        console.error('❌ DISCORD_CLIENT_ID não definido no .env');
        process.exit(1);
    }
    const rest = new REST().setToken(token);
    try {
        console.log('='.repeat(50));
        console.log('🗑️  Limpando comandos do Discord...');
        console.log('='.repeat(50));
        // Limpa comandos globais
        console.log('\n🌐 Limpando comandos globais...');
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log('✅ Comandos globais removidos!');
        // Se tiver um guildId, limpa comandos do servidor também
        if (guildId) {
            console.log(`\n🏠 Limpando comandos do servidor ${guildId}...`);
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
            console.log('✅ Comandos do servidor removidos!');
        }
        console.log('\n='.repeat(50));
        console.log('✅ Todos os comandos foram removidos!');
        console.log('='.repeat(50));
        console.log('\n💡 Execute "npm run deploy" para registrar os comandos novamente.');
        console.log();
    }
    catch (error) {
        console.error('❌ Erro ao limpar comandos:', error);
        process.exit(1);
    }
}
clearCommands();
//# sourceMappingURL=clear-commands.js.map