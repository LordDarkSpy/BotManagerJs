-- =============================================================================
-- Migration: Adiciona sistema de punicoes escalonaveis e cargos de SET
-- =============================================================================

-- Adiciona campos de cargo de SET na tabela configuracoes
ALTER TABLE "configuracoes" 
ADD COLUMN IF NOT EXISTS "cargoSetBaby" TEXT,
ADD COLUMN IF NOT EXISTS "cargoSetAdulto" TEXT,
ADD COLUMN IF NOT EXISTS "cargoSetReprovado" TEXT;

-- Cria tabela de tipos de punicao
CREATE TABLE IF NOT EXISTS "tipos_punicao" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guildId" TEXT NOT NULL,
  "codigo" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT,
  "nivel" INTEGER NOT NULL,
  "diasValidade" INTEGER NOT NULL,
  "diasDuracao" INTEGER,
  "removerCargos" BOOLEAN NOT NULL DEFAULT false,
  "aplicarCargo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indice unico para codigo por servidor
CREATE UNIQUE INDEX IF NOT EXISTS "tipos_punicao_guildId_codigo_key" 
ON "tipos_punicao"("guildId", "codigo");

-- Indice para busca por nivel
CREATE INDEX IF NOT EXISTS "tipos_punicao_guildId_nivel_idx" 
ON "tipos_punicao"("guildId", "nivel");

-- Cria tabela de punicoes aplicadas
CREATE TABLE IF NOT EXISTS "punicoes" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guildId" TEXT NOT NULL,
  "membroId" TEXT NOT NULL,
  "tipoPunicaoId" TEXT NOT NULL,
  "motivo" TEXT NOT NULL,
  "evidencia" TEXT,
  "aplicadoPorId" TEXT NOT NULL,
  "aplicadoPorNome" TEXT NOT NULL,
  "dataAplicacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataExpiracao" TIMESTAMP(3),
  "dataRemocao" TIMESTAMP(3),
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "removidoPorId" TEXT,
  "removidoPorNome" TEXT,
  "motivoRemocao" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices para punicoes
CREATE INDEX IF NOT EXISTS "punicoes_guildId_membroId_idx" 
ON "punicoes"("guildId", "membroId");

CREATE INDEX IF NOT EXISTS "punicoes_guildId_ativo_idx" 
ON "punicoes"("guildId", "ativo");

CREATE INDEX IF NOT EXISTS "punicoes_membroId_dataAplicacao_idx" 
ON "punicoes"("membroId", "dataAplicacao");

-- Foreign keys
ALTER TABLE "punicoes" 
ADD CONSTRAINT "punicoes_membroId_fkey" 
FOREIGN KEY ("membroId") REFERENCES "membros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "punicoes" 
ADD CONSTRAINT "punicoes_tipoPunicaoId_fkey" 
FOREIGN KEY ("tipoPunicaoId") REFERENCES "tipos_punicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Dados de exemplo: Tipos de punicao padrao
-- INSERT INTO "tipos_punicao" ("id", "guildId", "codigo", "nome", "nivel", "diasValidade", "diasDuracao", "descricao")
-- VALUES 
--   ('tipo_adv1', 'SEU_GUILD_ID', 'ADV-1', 'Advertencia Nivel 1', 1, 30, NULL, 'Primeira advertencia'),
--   ('tipo_adv2', 'SEU_GUILD_ID', 'ADV-2', 'Advertencia Nivel 2', 2, 30, NULL, 'Segunda advertencia em 30 dias'),
--   ('tipo_adv3', 'SEU_GUILD_ID', 'ADV-3', 'Advertencia Nivel 3', 3, 30, NULL, 'Terceira advertencia em 30 dias'),
--   ('tipo_susp', 'SEU_GUILD_ID', 'SUSPENSAO', 'Suspensao', 4, 60, 7, 'Suspensao de 7 dias'),
--   ('tipo_ban', 'SEU_GUILD_ID', 'BAN', 'Banimento', 5, 365, NULL, 'Banimento permanente');
