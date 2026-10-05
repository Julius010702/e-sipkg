-- CreateEnum
CREATE TYPE "StatusPermohonan" AS ENUM ('PENDING', 'DISETUJUI', 'DITOLAK');

-- CreateTable
CREATE TABLE "permohonan_jabatan" (
    "id" TEXT NOT NULL,
    "namaJabatan" TEXT NOT NULL,
    "alasan" TEXT,
    "status" "StatusPermohonan" NOT NULL DEFAULT 'PENDING',
    "catatanAdmin" TEXT,
    "sekolahId" TEXT NOT NULL,
    "diajukanOlehId" TEXT NOT NULL,
    "diprosesOlehId" TEXT,
    "diprosesPada" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permohonan_jabatan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "permohonan_jabatan" ADD CONSTRAINT "permohonan_jabatan_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permohonan_jabatan" ADD CONSTRAINT "permohonan_jabatan_diajukanOlehId_fkey" FOREIGN KEY ("diajukanOlehId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permohonan_jabatan" ADD CONSTRAINT "permohonan_jabatan_diprosesOlehId_fkey" FOREIGN KEY ("diprosesOlehId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
