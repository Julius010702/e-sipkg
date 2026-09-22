-- CreateEnum
CREATE TYPE "JenisSekolah" AS ENUM ('SMA', 'SMK', 'SLB');

-- CreateEnum
CREATE TYPE "StatusGuru" AS ENUM ('PNS', 'PPPK', 'HONORER');

-- CreateEnum
CREATE TYPE "StatusData" AS ENUM ('DRAFT', 'DIKIRIM', 'DISETUJUI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "RoleUser" AS ENUM ('SEKOLAH', 'BIRO', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" "RoleUser" NOT NULL,
    "sekolahId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wilayah" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL DEFAULT 'Nusa Tenggara Timur',

    CONSTRAINT "wilayah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sekolah" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisSekolah" "JenisSekolah" NOT NULL,
    "npsn" TEXT,
    "alamat" TEXT,
    "wilayahId" TEXT NOT NULL,
    "jumlahSiswa" INTEGER NOT NULL DEFAULT 0,
    "jumlahRombel" INTEGER NOT NULL DEFAULT 0,
    "statusData" "StatusData" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sekolah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jabatan_guru" (
    "id" TEXT NOT NULL,
    "namaJabatan" TEXT NOT NULL,
    "kode" TEXT,
    "jamStandar" INTEGER NOT NULL DEFAULT 24,
    "isBK" BOOLEAN NOT NULL DEFAULT false,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jabatan_guru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guru_jabatan" (
    "id" TEXT NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "jabatanId" TEXT NOT NULL,
    "periodeId" TEXT,
    "jumlahGuruPNS" INTEGER NOT NULL DEFAULT 0,
    "jumlahGuruPPPK" INTEGER NOT NULL DEFAULT 0,
    "jumlahGuruHonorer" INTEGER NOT NULL DEFAULT 0,
    "jamMengajarPerMinggu" INTEGER NOT NULL DEFAULT 24,
    "kebutuhanGuru" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tersedia" INTEGER NOT NULL DEFAULT 0,
    "selisih" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guru_jabatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kompetensi_keahlian" (
    "id" TEXT NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "namaJurusan" TEXT NOT NULL,
    "bidangStudi" TEXT,
    "jumlahSiswa" INTEGER NOT NULL DEFAULT 0,
    "jumlahRombel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kompetensi_keahlian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periode_laporan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tahunAjaran" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalAkhir" TIMESTAMP(3) NOT NULL,
    "isAktif" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periode_laporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validasi_log" (
    "id" TEXT NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "statusBaru" "StatusData" NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validasi_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PeriodeLaporanToSekolah" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_sekolahId_key" ON "users"("sekolahId");

-- CreateIndex
CREATE UNIQUE INDEX "wilayah_nama_key" ON "wilayah"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "sekolah_npsn_key" ON "sekolah"("npsn");

-- CreateIndex
CREATE UNIQUE INDEX "jabatan_guru_namaJabatan_key" ON "jabatan_guru"("namaJabatan");

-- CreateIndex
CREATE UNIQUE INDEX "jabatan_guru_kode_key" ON "jabatan_guru"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "guru_jabatan_sekolahId_jabatanId_periodeId_key" ON "guru_jabatan"("sekolahId", "jabatanId", "periodeId");

-- CreateIndex
CREATE UNIQUE INDEX "_PeriodeLaporanToSekolah_AB_unique" ON "_PeriodeLaporanToSekolah"("A", "B");

-- CreateIndex
CREATE INDEX "_PeriodeLaporanToSekolah_B_index" ON "_PeriodeLaporanToSekolah"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sekolah" ADD CONSTRAINT "sekolah_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru_jabatan" ADD CONSTRAINT "guru_jabatan_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru_jabatan" ADD CONSTRAINT "guru_jabatan_jabatanId_fkey" FOREIGN KEY ("jabatanId") REFERENCES "jabatan_guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru_jabatan" ADD CONSTRAINT "guru_jabatan_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "periode_laporan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kompetensi_keahlian" ADD CONSTRAINT "kompetensi_keahlian_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validasi_log" ADD CONSTRAINT "validasi_log_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validasi_log" ADD CONSTRAINT "validasi_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PeriodeLaporanToSekolah" ADD CONSTRAINT "_PeriodeLaporanToSekolah_A_fkey" FOREIGN KEY ("A") REFERENCES "periode_laporan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PeriodeLaporanToSekolah" ADD CONSTRAINT "_PeriodeLaporanToSekolah_B_fkey" FOREIGN KEY ("B") REFERENCES "sekolah"("id") ON DELETE CASCADE ON UPDATE CASCADE;
