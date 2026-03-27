-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN_PUSAT', 'ADMIN_SEKOLAH');

-- CreateEnum
CREATE TYPE "StatusPegawai" AS ENUM ('PNS', 'PPPK');

-- CreateEnum
CREATE TYPE "JenisSekolah" AS ENUM ('SMA', 'SMK', 'SLB');

-- CreateEnum
CREATE TYPE "JenisJabatan" AS ENUM ('STRUKTURAL', 'FUNGSIONAL', 'PELAKSANA');

-- CreateEnum
CREATE TYPE "KondisiFisik" AS ENUM ('BAIK', 'SEDANG', 'KURANG');

-- CreateEnum
CREATE TYPE "EfektivitasJabatan" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateEnum
CREATE TYPE "StatusUser" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "StatusKebutuhan" AS ENUM ('KURANG', 'LEBIH', 'SESUAI');

-- CreateTable
CREATE TABLE "type_unit_kerja" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "type_unit_kerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opd" (
    "id" TEXT NOT NULL,
    "indukUnitKerja" TEXT,
    "kawil" TEXT,
    "nama" TEXT NOT NULL,
    "typeUnitKerjaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eselon" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eselon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_organisasi" (
    "id" TEXT NOT NULL,
    "opdId" TEXT NOT NULL,
    "eselonId" TEXT NOT NULL,
    "namaUnit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_organisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urusan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "urusan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sekolah" (
    "id" TEXT NOT NULL,
    "npsn" TEXT,
    "nama" TEXT NOT NULL,
    "jenisSekolah" "JenisSekolah" NOT NULL,
    "opdId" TEXT,
    "unitOrganisasiId" TEXT,
    "alamat" TEXT,
    "kecamatan" TEXT,
    "kabupatenKota" TEXT,
    "provinsi" TEXT NOT NULL DEFAULT 'Nusa Tenggara Timur',
    "telepon" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "kepalaSekolah" TEXT,
    "wakilKepala" TEXT,
    "sekretaris" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sekolah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "StatusUser" NOT NULL DEFAULT 'AKTIF',
    "sekolahId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jabatan" (
    "id" TEXT NOT NULL,
    "indukJabatanId" TEXT,
    "kodeJabatan" TEXT NOT NULL,
    "namaJabatan" TEXT NOT NULL,
    "jenisJabatan" "JenisJabatan" NOT NULL,
    "unitOrganisasiId" TEXT,
    "opdId" TEXT,
    "sekolahId" TEXT,
    "urusanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jabatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anjab" (
    "id" TEXT NOT NULL,
    "jabatanId" TEXT NOT NULL,
    "ikhtisarJabatan" TEXT,
    "uraianTugas" TEXT,
    "bahanKerja" JSONB,
    "perangkatKerja" JSONB,
    "hasilKerja" JSONB,
    "tanggungjawab" JSONB,
    "pangkatGolonganTerendah" TEXT,
    "pangkatGolonganTertinggi" TEXT,
    "pendidikanTerendah" TEXT,
    "bidangPendidikanTerendah" TEXT,
    "pendidikanTertinggi" TEXT,
    "bidangPendidikanTertinggi" TEXT,
    "kursusPelatihanPemimpin" JSONB,
    "pengalamanKerja" JSONB,
    "pengetahuan" JSONB,
    "keterampilan" JSONB,
    "progressPersen" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anjab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abk" (
    "id" TEXT NOT NULL,
    "anjabId" TEXT NOT NULL,
    "detailBebanKerja" JSONB,
    "totalBebanKerja" DOUBLE PRECISION,
    "efektivitasNilai" DOUBLE PRECISION,
    "efektivitasJabatan" "EfektivitasJabatan",
    "kebutuhanPegawai" DOUBLE PRECISION,
    "statusKebutuhan" "StatusKebutuhan",
    "jumlahKurangLebih" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bezeting" (
    "id" TEXT NOT NULL,
    "jabatanId" TEXT NOT NULL,
    "namaJabatan" TEXT NOT NULL,
    "golonganSaranRendah" TEXT,
    "golonganSaranTinggi" TEXT,
    "jumlahPNS" INTEGER NOT NULL DEFAULT 0,
    "jumlahPPPK" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bezeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pemangku" (
    "id" TEXT NOT NULL,
    "jabatanId" TEXT NOT NULL,
    "namaPemangku" TEXT NOT NULL,
    "nip" TEXT,
    "statusPegawai" "StatusPegawai" NOT NULL,
    "pangkatGolongan" TEXT,
    "pendidikan" TEXT,
    "bidangPendidikan" TEXT,
    "pengalamanKerja" JSONB,
    "keterampilan" JSONB,
    "kondisiFisik" "KondisiFisik" DEFAULT 'BAIK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pemangku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guru" (
    "id" TEXT NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "nip" TEXT,
    "nama" TEXT NOT NULL,
    "statusPegawai" "StatusPegawai" NOT NULL,
    "jenisKelamin" TEXT,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "pangkatGolongan" TEXT,
    "tmtGolongan" TIMESTAMP(3),
    "pendidikanTerakhir" TEXT,
    "bidangStudi" TEXT,
    "mataPelajaran" TEXT,
    "statusSertifikasi" BOOLEAN DEFAULT false,
    "nomorSertifikasi" TEXT,
    "tmtMasuk" TIMESTAMP(3),
    "alamat" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "foto" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perhitungan_guru" (
    "id" TEXT NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "tahunAjaran" TEXT NOT NULL,
    "jumlahRombel" INTEGER,
    "jumlahJamPelajaran" INTEGER,
    "bebanMengajar" INTEGER DEFAULT 24,
    "jumlahGuruTersedia" INTEGER,
    "jumlahGuruPNS" INTEGER,
    "jumlahGuruPPPK" INTEGER,
    "kebutuhanGuru" DOUBLE PRECISION,
    "kekuranganGuru" INTEGER,
    "kelebihanGuru" INTEGER,
    "statusKebutuhan" "StatusKebutuhan",
    "prediksiData" JSONB,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perhitungan_guru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rekap_final" (
    "id" TEXT NOT NULL,
    "tahun" TEXT NOT NULL,
    "totalSekolah" INTEGER,
    "totalGuruPNS" INTEGER,
    "totalGuruPPPK" INTEGER,
    "totalKebutuhan" INTEGER,
    "totalKekurangan" INTEGER,
    "totalKelebihan" INTEGER,
    "distribusiData" JSONB,
    "rekomendasiData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rekap_final_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profil_admin_pusat" (
    "id" TEXT NOT NULL,
    "kabupatenKota" TEXT,
    "namaDaerah" TEXT,
    "namaKepala" TEXT,
    "namaWakil" TEXT,
    "namaSekretaris" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "alamat" TEXT,
    "opd" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "hakiInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profil_admin_pusat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_config" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "namaUnit" TEXT,
    "keterangan" TEXT,
    "slides" JSONB,
    "alamat" TEXT,
    "email" TEXT,
    "kontak" TEXT,
    "hakiInfo" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "type_unit_kerja_nama_key" ON "type_unit_kerja"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "eselon_kode_key" ON "eselon"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "sekolah_npsn_key" ON "sekolah"("npsn");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "jabatan_kodeJabatan_key" ON "jabatan"("kodeJabatan");

-- CreateIndex
CREATE UNIQUE INDEX "anjab_jabatanId_key" ON "anjab"("jabatanId");

-- CreateIndex
CREATE UNIQUE INDEX "abk_anjabId_key" ON "abk"("anjabId");

-- CreateIndex
CREATE UNIQUE INDEX "pemangku_nip_key" ON "pemangku"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "guru_nip_key" ON "guru"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "perhitungan_guru_sekolahId_tahunAjaran_key" ON "perhitungan_guru"("sekolahId", "tahunAjaran");

-- CreateIndex
CREATE UNIQUE INDEX "rekap_final_tahun_key" ON "rekap_final"("tahun");

-- AddForeignKey
ALTER TABLE "opd" ADD CONSTRAINT "opd_typeUnitKerjaId_fkey" FOREIGN KEY ("typeUnitKerjaId") REFERENCES "type_unit_kerja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_organisasi" ADD CONSTRAINT "unit_organisasi_opdId_fkey" FOREIGN KEY ("opdId") REFERENCES "opd"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_organisasi" ADD CONSTRAINT "unit_organisasi_eselonId_fkey" FOREIGN KEY ("eselonId") REFERENCES "eselon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sekolah" ADD CONSTRAINT "sekolah_opdId_fkey" FOREIGN KEY ("opdId") REFERENCES "opd"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sekolah" ADD CONSTRAINT "sekolah_unitOrganisasiId_fkey" FOREIGN KEY ("unitOrganisasiId") REFERENCES "unit_organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jabatan" ADD CONSTRAINT "jabatan_indukJabatanId_fkey" FOREIGN KEY ("indukJabatanId") REFERENCES "jabatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jabatan" ADD CONSTRAINT "jabatan_unitOrganisasiId_fkey" FOREIGN KEY ("unitOrganisasiId") REFERENCES "unit_organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jabatan" ADD CONSTRAINT "jabatan_opdId_fkey" FOREIGN KEY ("opdId") REFERENCES "opd"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jabatan" ADD CONSTRAINT "jabatan_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jabatan" ADD CONSTRAINT "jabatan_urusanId_fkey" FOREIGN KEY ("urusanId") REFERENCES "urusan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anjab" ADD CONSTRAINT "anjab_jabatanId_fkey" FOREIGN KEY ("jabatanId") REFERENCES "jabatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abk" ADD CONSTRAINT "abk_anjabId_fkey" FOREIGN KEY ("anjabId") REFERENCES "anjab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bezeting" ADD CONSTRAINT "bezeting_jabatanId_fkey" FOREIGN KEY ("jabatanId") REFERENCES "jabatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemangku" ADD CONSTRAINT "pemangku_jabatanId_fkey" FOREIGN KEY ("jabatanId") REFERENCES "jabatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru" ADD CONSTRAINT "guru_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perhitungan_guru" ADD CONSTRAINT "perhitungan_guru_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE CASCADE ON UPDATE CASCADE;
