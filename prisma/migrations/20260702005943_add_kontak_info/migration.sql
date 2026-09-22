-- CreateTable
CREATE TABLE "KontakInfo" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "unit" TEXT NOT NULL DEFAULT 'Bagian Kelembagaan dan Analisis Jabatan',
    "alamat" TEXT NOT NULL DEFAULT 'Jl. El Tari No. 52, Kota Kupang, NTT',
    "telepon" TEXT NOT NULL DEFAULT '(0380) 821710',
    "email" TEXT NOT NULL DEFAULT 'biroorganisasi@nttprov.go.id',
    "jamKerja" TEXT NOT NULL DEFAULT 'Senin–Jumat, 07.30–16.00 WITA',
    "namaInstansi" TEXT NOT NULL DEFAULT 'Biro Organisasi Setda',
    "namaProvinsi" TEXT NOT NULL DEFAULT 'Provinsi Nusa Tenggara Timur',
    "emailAkses" TEXT NOT NULL DEFAULT 'biroorganisasi@nttprov.go.id',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KontakInfo_pkey" PRIMARY KEY ("id")
);
