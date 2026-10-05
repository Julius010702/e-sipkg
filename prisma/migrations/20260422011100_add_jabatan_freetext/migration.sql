/*
  Warnings:

  - You are about to drop the column `jabatanId` on the `guru_jabatan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sekolahId,namaJabatan,jenjangJabatan,periodeId]` on the table `guru_jabatan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `namaJabatan` to the `guru_jabatan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JenjangJabatan" AS ENUM ('AHLI_PERTAMA', 'AHLI_MUDA', 'AHLI_MADYA', 'AHLI_UTAMA');

-- DropForeignKey
ALTER TABLE "guru_jabatan" DROP CONSTRAINT "guru_jabatan_jabatanId_fkey";

-- DropIndex
DROP INDEX "guru_jabatan_sekolahId_jabatanId_periodeId_key";

-- AlterTable
ALTER TABLE "guru_jabatan" DROP COLUMN "jabatanId",
ADD COLUMN     "isBK" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jenjangJabatan" "JenjangJabatan" NOT NULL DEFAULT 'AHLI_PERTAMA',
ADD COLUMN     "namaJabatan" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "guru_jabatan_sekolahId_namaJabatan_jenjangJabatan_periodeId_key" ON "guru_jabatan"("sekolahId", "namaJabatan", "jenjangJabatan", "periodeId");
