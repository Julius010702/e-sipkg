/*
  Warnings:

  - The values [HONORER] on the enum `StatusGuru` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `nip` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - Made the column `nip` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusGuru_new" AS ENUM ('PNS', 'PPPK');
ALTER TYPE "StatusGuru" RENAME TO "StatusGuru_old";
ALTER TYPE "StatusGuru_new" RENAME TO "StatusGuru";
DROP TYPE "StatusGuru_old";
COMMIT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "nip" SET NOT NULL,
ALTER COLUMN "nip" SET DATA TYPE VARCHAR(20);
