-- AlterTable
ALTER TABLE "configuracoes" ADD COLUMN     "cargoSetAdulto" TEXT,
ADD COLUMN     "cargoSetBaby" TEXT,
ADD COLUMN     "cargoSetReprovado" TEXT;

-- CreateTable
CREATE TABLE "tipos_punicao" (
    "id" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_punicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "punicoes" (
    "id" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "punicoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tipos_punicao_guildId_nivel_idx" ON "tipos_punicao"("guildId", "nivel");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_punicao_guildId_codigo_key" ON "tipos_punicao"("guildId", "codigo");

-- CreateIndex
CREATE INDEX "punicoes_guildId_membroId_idx" ON "punicoes"("guildId", "membroId");

-- CreateIndex
CREATE INDEX "punicoes_guildId_ativo_idx" ON "punicoes"("guildId", "ativo");

-- CreateIndex
CREATE INDEX "punicoes_membroId_dataAplicacao_idx" ON "punicoes"("membroId", "dataAplicacao");

-- AddForeignKey
ALTER TABLE "punicoes" ADD CONSTRAINT "punicoes_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "membros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "punicoes" ADD CONSTRAINT "punicoes_tipoPunicaoId_fkey" FOREIGN KEY ("tipoPunicaoId") REFERENCES "tipos_punicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
