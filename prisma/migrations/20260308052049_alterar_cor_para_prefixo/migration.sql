/*
  Warnings:

  - You are about to drop the column `cor` on the `cargos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cargos" DROP COLUMN "cor",
ADD COLUMN     "prefixo" TEXT;
