/*
  Warnings:

  - You are about to drop the `transacoes_fgts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "transacoes_fgts" DROP CONSTRAINT "transacoes_fgts_membroId_fkey";

-- DropTable
DROP TABLE "transacoes_fgts";

-- CreateTable
CREATE TABLE "pagamentos_fgts" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "membroId" TEXT NOT NULL,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "idTransacao" TEXT NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_fgts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_fgts_idTransacao_key" ON "pagamentos_fgts"("idTransacao");

-- CreateIndex
CREATE INDEX "pagamentos_fgts_guildId_mesReferencia_anoReferencia_idx" ON "pagamentos_fgts"("guildId", "mesReferencia", "anoReferencia");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_fgts_guildId_membroId_mesReferencia_anoReferenci_key" ON "pagamentos_fgts"("guildId", "membroId", "mesReferencia", "anoReferencia");

-- AddForeignKey
ALTER TABLE "pagamentos_fgts" ADD CONSTRAINT "pagamentos_fgts_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "membros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
