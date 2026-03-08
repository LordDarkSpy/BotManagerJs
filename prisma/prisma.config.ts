// =============================================================================
// BotManagerJs - Configuração do Prisma 7
// =============================================================================
// Este arquivo configura a conexão com o banco de dados para o Prisma 7+
// =============================================================================

import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Carrega as variáveis de ambiente do arquivo .env na pasta raiz
import { config } from 'dotenv'
config({ path: path.join(__dirname, '../.env') })

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
  migrate: {
    async url() {
      return process.env.DATABASE_URL || ''
    }
  }
})
