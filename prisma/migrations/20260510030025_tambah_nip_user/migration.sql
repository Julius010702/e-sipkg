/*
  Warnings:

  - A unique constraint covering the columns `[nip]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "nip" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_key" ON "users"("nip");
