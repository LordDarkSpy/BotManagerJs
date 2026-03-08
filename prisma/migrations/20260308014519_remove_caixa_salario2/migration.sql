/*
  Warnings:

  - You are about to drop the column `canalCaixa` on the `configuracoes` table. All the data in the column will be lost.
  - You are about to drop the `movimentacoes_caixa` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "movimentacoes_caixa" DROP CONSTRAINT "movimentacoes_caixa_membroId_fkey";

-- AlterTable
ALTER TABLE "configuracoes" DROP COLUMN "canalCaixa";

-- DropTable
DROP TABLE "movimentacoes_caixa";

-- DropEnum
DROP TYPE "TipoMovimentacao";
