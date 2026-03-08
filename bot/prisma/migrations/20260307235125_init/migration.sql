-- CreateEnum
CREATE TYPE "TipoMembro" AS ENUM ('ADULTO', 'BABY');

-- CreateEnum
CREATE TYPE "StatusMembro" AS ENUM ('ATIVO', 'INATIVO', 'BANIDO', 'AUSENTE');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADO', 'REPROVADO');

-- CreateEnum
CREATE TYPE "StatusAusencia" AS ENUM ('ATIVA', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "botName" TEXT,
    "botDescription" TEXT,
    "botImage" TEXT,
    "canalAprovacaoSet" TEXT,
    "canalFgts" TEXT,
    "canalCaixa" TEXT,
    "canalAusencia" TEXT,
    "canalLogs" TEXT,
    "cargoAprovadorSet" TEXT,
    "cargoGestorCargos" TEXT,
    "cargoAdministrador" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "hierarquia" INTEGER NOT NULL,
    "discordRoleId" TEXT,
    "cor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membros" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "idJogo" TEXT,
    "recrutadorId" TEXT,
    "recrutadorNome" TEXT,
    "tipo" "TipoMembro" NOT NULL DEFAULT 'ADULTO',
    "cargoId" TEXT,
    "status" "StatusMembro" NOT NULL DEFAULT 'ATIVO',
    "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSaida" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_set" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "solicitanteNome" TEXT NOT NULL,
    "telefone" TEXT,
    "idJogo" TEXT,
    "recrutador" TEXT,
    "tipo" "TipoMembro" NOT NULL DEFAULT 'ADULTO',
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "aprovadorId" TEXT,
    "aprovadorNome" TEXT,
    "dataDecisao" TIMESTAMP(3),
    "motivoRejeicao" TEXT,
    "membroId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ausencias" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "membroId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "notificado" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusAusencia" NOT NULL DEFAULT 'ATIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ausencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes_fgts" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "membroId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "idTransacao" TEXT NOT NULL,
    "dataDeposito" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transacoes_fgts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_caixa" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "membroId" TEXT NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL,
    "imageUrl" TEXT,
    "categoria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movimentacoes_caixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blacklist" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "nome" TEXT,
    "motivo" TEXT NOT NULL,
    "adicionadoPorId" TEXT NOT NULL,
    "adicionadoPorNome" TEXT,
    "dataExpiracao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "detalhes" TEXT,
    "executorId" TEXT NOT NULL,
    "executorNome" TEXT,
    "alvoId" TEXT,
    "alvoNome" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_guildId_key" ON "configuracoes"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "cargos_guildId_nome_key" ON "cargos"("guildId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "membros_guildId_discordId_key" ON "membros"("guildId", "discordId");

-- CreateIndex
CREATE UNIQUE INDEX "transacoes_fgts_idTransacao_key" ON "transacoes_fgts"("idTransacao");

-- CreateIndex
CREATE UNIQUE INDEX "blacklist_guildId_discordId_key" ON "blacklist"("guildId", "discordId");

-- CreateIndex
CREATE INDEX "logs_guildId_acao_idx" ON "logs"("guildId", "acao");

-- CreateIndex
CREATE INDEX "logs_guildId_createdAt_idx" ON "logs"("guildId", "createdAt");

-- AddForeignKey
ALTER TABLE "membros" ADD CONSTRAINT "membros_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "cargos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_set" ADD CONSTRAINT "solicitacoes_set_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "membros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ausencias" ADD CONSTRAINT "ausencias_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "membros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes_fgts" ADD CONSTRAINT "transacoes_fgts_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "membros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_caixa" ADD CONSTRAINT "movimentacoes_caixa_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "membros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
