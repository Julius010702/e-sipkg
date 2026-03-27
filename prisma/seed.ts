// prisma/seed.ts
// E-SIPKG — Database Seeder Lengkap
// Jalankan: npm run db:seed

import "dotenv/config";
import { PrismaClient, Role, JenisSekolah, JenisJabatan, StatusPegawai, StatusUser } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database E-SIPKG...\n");

  // ==========================================
  // 1. ESELON
  // ==========================================
  console.log("📌 Seeding Eselon...");
  const eselonData = [
    { kode: "I",    nama: "Eselon I" },
    { kode: "II-A", nama: "Eselon II-A" },
    { kode: "II-B", nama: "Eselon II-B" },
    { kode: "III-A",nama: "Eselon III-A" },
    { kode: "III-B",nama: "Eselon III-B" },
    { kode: "IV-A", nama: "Eselon IV-A" },
    { kode: "IV-B", nama: "Eselon IV-B" },
    { kode: "V",    nama: "Eselon V" },
  ];

  const eselon: Record<string, { id: string }> = {};
  for (const data of eselonData) {
    const e = await prisma.eselon.upsert({
      where: { kode: data.kode },
      update: {},
      create: data,
    });
    eselon[data.kode] = e;
  }
  console.log(`   ✅ ${eselonData.length} eselon tersimpan`);

  // ==========================================
  // 2. TYPE UNIT KERJA
  // ==========================================
  console.log("📌 Seeding Type Unit Kerja...");
  const typeUnitKerjaData = [
    { nama: "Dinas" },
    { nama: "Badan" },
    { nama: "Kantor" },
    { nama: "Sekretariat" },
    { nama: "Inspektorat" },
    { nama: "Biro" },
    { nama: "UPT" },
    { nama: "Satuan Pendidikan" },
  ];

  const typeUnitKerja: Record<string, { id: string }> = {};
  for (const data of typeUnitKerjaData) {
    const t = await prisma.typeUnitKerja.upsert({
      where: { nama: data.nama },
      update: {},
      create: data,
    });
    typeUnitKerja[data.nama] = t;
  }
  console.log(`   ✅ ${typeUnitKerjaData.length} type unit kerja tersimpan`);

  // ==========================================
  // 3. OPD
  // ==========================================
  console.log("📌 Seeding OPD...");
  const opdDinas = await prisma.oPD.upsert({
    where: { id: "opd-dinas-pendidikan-ntt" },
    update: {},
    create: {
      id: "opd-dinas-pendidikan-ntt",
      nama: "Dinas Pendidikan dan Kebudayaan Provinsi NTT",
      kawil: "Provinsi Nusa Tenggara Timur",
      typeUnitKerjaId: typeUnitKerja["Dinas"].id,
    },
  });

  const opdKabKota = [
    { id: "opd-kab-kupang",       nama: "Dinas Pendidikan Kabupaten Kupang",          kawil: "Kabupaten Kupang" },
    { id: "opd-kota-kupang",      nama: "Dinas Pendidikan Kota Kupang",               kawil: "Kota Kupang" },
    { id: "opd-kab-tts",          nama: "Dinas Pendidikan Kabupaten TTS",             kawil: "Kabupaten Timor Tengah Selatan" },
    { id: "opd-kab-ttu",          nama: "Dinas Pendidikan Kabupaten TTU",             kawil: "Kabupaten Timor Tengah Utara" },
    { id: "opd-kab-belu",         nama: "Dinas Pendidikan Kabupaten Belu",            kawil: "Kabupaten Belu" },
    { id: "opd-kab-malaka",       nama: "Dinas Pendidikan Kabupaten Malaka",          kawil: "Kabupaten Malaka" },
    { id: "opd-kab-flores-timur", nama: "Dinas Pendidikan Kabupaten Flores Timur",    kawil: "Kabupaten Flores Timur" },
    { id: "opd-kab-sikka",        nama: "Dinas Pendidikan Kabupaten Sikka",           kawil: "Kabupaten Sikka" },
    { id: "opd-kab-ende",         nama: "Dinas Pendidikan Kabupaten Ende",            kawil: "Kabupaten Ende" },
    { id: "opd-kab-ngada",        nama: "Dinas Pendidikan Kabupaten Ngada",           kawil: "Kabupaten Ngada" },
    { id: "opd-kab-nagekeo",      nama: "Dinas Pendidikan Kabupaten Nagekeo",         kawil: "Kabupaten Nagekeo" },
    { id: "opd-kab-manggarai",    nama: "Dinas Pendidikan Kabupaten Manggarai",       kawil: "Kabupaten Manggarai" },
    { id: "opd-kab-manggarai-b",  nama: "Dinas Pendidikan Kabupaten Manggarai Barat", kawil: "Kabupaten Manggarai Barat" },
    { id: "opd-kab-manggarai-t",  nama: "Dinas Pendidikan Kabupaten Manggarai Timur",kawil: "Kabupaten Manggarai Timur" },
    { id: "opd-kab-sumba-barat",  nama: "Dinas Pendidikan Kabupaten Sumba Barat",     kawil: "Kabupaten Sumba Barat" },
    { id: "opd-kab-sumba-timur",  nama: "Dinas Pendidikan Kabupaten Sumba Timur",     kawil: "Kabupaten Sumba Timur" },
    { id: "opd-kab-sumba-tengah", nama: "Dinas Pendidikan Kabupaten Sumba Tengah",    kawil: "Kabupaten Sumba Tengah" },
    { id: "opd-kab-sumba-bd",     nama: "Dinas Pendidikan Kabupaten Sumba Barat Daya",kawil: "Kabupaten Sumba Barat Daya" },
    { id: "opd-kab-rote-ndao",    nama: "Dinas Pendidikan Kabupaten Rote Ndao",       kawil: "Kabupaten Rote Ndao" },
    { id: "opd-kab-sabu",         nama: "Dinas Pendidikan Kabupaten Sabu Raijua",     kawil: "Kabupaten Sabu Raijua" },
    { id: "opd-kab-alor",         nama: "Dinas Pendidikan Kabupaten Alor",            kawil: "Kabupaten Alor" },
    { id: "opd-kab-lembata",      nama: "Dinas Pendidikan Kabupaten Lembata",         kawil: "Kabupaten Lembata" },
  ];

  for (const data of opdKabKota) {
    await prisma.oPD.upsert({
      where: { id: data.id },
      update: {},
      create: { ...data, typeUnitKerjaId: typeUnitKerja["Dinas"].id },
    });
  }
  console.log(`   ✅ ${opdKabKota.length + 1} OPD tersimpan`);

  // ==========================================
  // 4. UNIT ORGANISASI
  // ==========================================
  console.log("📌 Seeding Unit Organisasi...");
  const unitOrganisasiData = [
    {
      id: "uo-sekretariat-dinas",
      opdId: opdDinas.id,
      eselonKode: "III-A",
      namaUnit: "Sekretariat Dinas Pendidikan dan Kebudayaan",
    },
    {
      id: "uo-bidang-sma",
      opdId: opdDinas.id,
      eselonKode: "III-A",
      namaUnit: "Bidang Pembinaan SMA",
    },
    {
      id: "uo-bidang-smk",
      opdId: opdDinas.id,
      eselonKode: "III-A",
      namaUnit: "Bidang Pembinaan SMK",
    },
    {
      id: "uo-bidang-slb",
      opdId: opdDinas.id,
      eselonKode: "III-A",
      namaUnit: "Bidang Pembinaan Pendidikan Khusus (SLB)",
    },
    {
      id: "uo-bidang-ketenagaan",
      opdId: opdDinas.id,
      eselonKode: "III-A",
      namaUnit: "Bidang Ketenagaan",
    },
    {
      id: "uo-subbag-umum",
      opdId: opdDinas.id,
      eselonKode: "IV-A",
      namaUnit: "Sub Bagian Umum dan Kepegawaian",
    },
    {
      id: "uo-subbag-perencanaan",
      opdId: opdDinas.id,
      eselonKode: "IV-A",
      namaUnit: "Sub Bagian Perencanaan dan Evaluasi",
    },
    {
      id: "uo-subbag-keuangan",
      opdId: opdDinas.id,
      eselonKode: "IV-A",
      namaUnit: "Sub Bagian Keuangan",
    },
  ];

  const unitOrganisasi: Record<string, { id: string }> = {};
  for (const data of unitOrganisasiData) {
    const uo = await prisma.unitOrganisasi.upsert({
      where: { id: data.id },
      update: {},
      create: {
        id: data.id,
        opdId: data.opdId,
        eselonId: eselon[data.eselonKode].id,
        namaUnit: data.namaUnit,
      },
    });
    unitOrganisasi[data.id] = uo;
  }
  console.log(`   ✅ ${unitOrganisasiData.length} unit organisasi tersimpan`);

  // ==========================================
  // 5. URUSAN
  // ==========================================
  console.log("📌 Seeding Urusan...");
  const urusanData = [
    { id: "urusan-pendidikan",       nama: "Urusan Pendidikan" },
    { id: "urusan-ketenagaan",       nama: "Urusan Ketenagaan" },
    { id: "urusan-kurikulum",        nama: "Urusan Kurikulum" },
    { id: "urusan-kesiswaan",        nama: "Urusan Kesiswaan" },
    { id: "urusan-sarana-prasarana", nama: "Urusan Sarana dan Prasarana" },
    { id: "urusan-umum",             nama: "Urusan Umum" },
    { id: "urusan-keuangan",         nama: "Urusan Keuangan" },
    { id: "urusan-perencanaan",      nama: "Urusan Perencanaan dan Evaluasi" },
    { id: "urusan-humas",            nama: "Urusan Hubungan Masyarakat" },
    { id: "urusan-penjaminan-mutu",  nama: "Urusan Penjaminan Mutu Pendidikan" },
    { id: "urusan-kepegawaian",      nama: "Urusan Kepegawaian" },
    { id: "urusan-tu",               nama: "Urusan Tata Usaha" },
  ];

  const urusan: Record<string, { id: string }> = {};
  for (const data of urusanData) {
    const u = await prisma.urusan.upsert({
      where: { id: data.id },
      update: {},
      create: data,
    });
    urusan[data.id] = u;
  }
  console.log(`   ✅ ${urusanData.length} urusan tersimpan`);

  // ==========================================
  // 6. SEKOLAH SAMPLE
  // ==========================================
  console.log("📌 Seeding Sekolah contoh...");
  const sekolahData = [
    {
      id: "sman-1-kupang",
      npsn: "50304394",
      nama: "SMAN 1 Kupang",
      jenisSekolah: JenisSekolah.SMA,
      opdId: "opd-kota-kupang",
      unitOrganisasiId: "uo-bidang-sma",
      alamat: "Jl. Frans Seda No. 1",
      kecamatan: "Oebobo",
      kabupatenKota: "Kota Kupang",
      telepon: "0380-823456",
      email: "sman1kupang@gmail.com",
      kepalaSekolah: "Drs. Yohannes Benu, M.Pd",
      wakilKepala: "Maria Takaeb, S.Pd",
      sekretaris: "Thomas Lende, S.Pd",
    },
    {
      id: "smkn-1-kupang",
      npsn: "50304410",
      nama: "SMKN 1 Kupang",
      jenisSekolah: JenisSekolah.SMK,
      opdId: "opd-kota-kupang",
      unitOrganisasiId: "uo-bidang-smk",
      alamat: "Jl. WJ Lalamentik No. 45",
      kecamatan: "Oebobo",
      kabupatenKota: "Kota Kupang",
      telepon: "0380-821234",
      email: "smkn1kupang@gmail.com",
      kepalaSekolah: "Drs. Petrus Mau, M.Pd",
      wakilKepala: "Yuliana Selan, S.Pd",
      sekretaris: "Agustinus Lelo, S.Pd",
    },
    {
      id: "slbn-kupang",
      npsn: "50303999",
      nama: "SLB Negeri Kupang",
      jenisSekolah: JenisSekolah.SLB,
      opdId: "opd-kota-kupang",
      unitOrganisasiId: "uo-bidang-slb",
      alamat: "Jl. Timor Raya No. 10",
      kecamatan: "Kelapa Lima",
      kabupatenKota: "Kota Kupang",
      telepon: "0380-833456",
      email: "slbnkupang@gmail.com",
      kepalaSekolah: "Helena Ndun, S.Pd, M.Pd",
      wakilKepala: "Benediktus Tefa, S.Pd",
      sekretaris: "Rosalia Kore, S.Pd",
    },
    {
      id: "sman-1-soe",
      npsn: "50303100",
      nama: "SMAN 1 Soe",
      jenisSekolah: JenisSekolah.SMA,
      opdId: "opd-kab-tts",
      alamat: "Jl. Diponegoro No. 5",
      kecamatan: "Soe",
      kabupatenKota: "Kabupaten Timor Tengah Selatan",
      telepon: "0388-21234",
      email: "sman1soe@gmail.com",
      kepalaSekolah: "Drs. Markus Benu, M.Pd",
    },
    {
      id: "sman-1-ende",
      npsn: "50300200",
      nama: "SMAN 1 Ende",
      jenisSekolah: JenisSekolah.SMA,
      opdId: "opd-kab-ende",
      alamat: "Jl. Eltari No. 3",
      kecamatan: "Ende",
      kabupatenKota: "Kabupaten Ende",
      telepon: "0381-21000",
      email: "sman1ende@gmail.com",
      kepalaSekolah: "Yosefina Mbu, S.Pd, M.Pd",
    },
  ];

  for (const data of sekolahData) {
    await prisma.sekolah.upsert({
      where: { id: data.id },
      update: {},
      create: data,
    });
  }
  console.log(`   ✅ ${sekolahData.length} sekolah tersimpan`);

  // ==========================================
  // 7. USERS
  // ==========================================
  console.log("📌 Seeding Users...");

  const passwordHash = await bcrypt.hash("Admin@123", 12);
  const passwordSekolah = await bcrypt.hash("Sekolah@123", 12);

  const usersData = [
    // Admin Pusat
    {
      id: "user-admin-pusat",
      nama: "Administrator Pusat",
      email: "admin@disdikprov.ntt.go.id",
      password: passwordHash,
      role: Role.ADMIN_PUSAT,
      status: StatusUser.AKTIF,
      sekolahId: null,
    },
    {
      id: "user-admin-pusat-2",
      nama: "Operator Dinas",
      email: "operator@disdikprov.ntt.go.id",
      password: passwordHash,
      role: Role.ADMIN_PUSAT,
      status: StatusUser.AKTIF,
      sekolahId: null,
    },
    // Admin Sekolah
    {
      id: "user-sman1-kupang",
      nama: "Admin SMAN 1 Kupang",
      email: "admin@sman1kupang.sch.id",
      password: passwordSekolah,
      role: Role.ADMIN_SEKOLAH,
      status: StatusUser.AKTIF,
      sekolahId: "sman-1-kupang",
    },
    {
      id: "user-smkn1-kupang",
      nama: "Admin SMKN 1 Kupang",
      email: "admin@smkn1kupang.sch.id",
      password: passwordSekolah,
      role: Role.ADMIN_SEKOLAH,
      status: StatusUser.AKTIF,
      sekolahId: "smkn-1-kupang",
    },
    {
      id: "user-slbn-kupang",
      nama: "Admin SLB Negeri Kupang",
      email: "admin@slbnkupang.sch.id",
      password: passwordSekolah,
      role: Role.ADMIN_SEKOLAH,
      status: StatusUser.AKTIF,
      sekolahId: "slbn-kupang",
    },
    {
      id: "user-sman1-soe",
      nama: "Admin SMAN 1 Soe",
      email: "admin@sman1soe.sch.id",
      password: passwordSekolah,
      role: Role.ADMIN_SEKOLAH,
      status: StatusUser.AKTIF,
      sekolahId: "sman-1-soe",
    },
    {
      id: "user-sman1-ende",
      nama: "Admin SMAN 1 Ende",
      email: "admin@sman1ende.sch.id",
      password: passwordSekolah,
      role: Role.ADMIN_SEKOLAH,
      status: StatusUser.AKTIF,
      sekolahId: "sman-1-ende",
    },
  ];

  for (const data of usersData) {
    await prisma.user.upsert({
      where: { id: data.id },
      update: {},
      create: data,
    });
  }
  console.log(`   ✅ ${usersData.length} user tersimpan`);

  // ==========================================
  // 8. JABATAN CONTOH (SMAN 1 Kupang)
  // ==========================================
  console.log("📌 Seeding Jabatan contoh (SMAN 1 Kupang)...");
  const jabatanData = [
    {
      id: "jab-kepala-sekolah-sman1",
      kodeJabatan: "S.001.KS",
      namaJabatan: "Kepala Sekolah",
      jenisJabatan: JenisJabatan.STRUKTURAL,
      sekolahId: "sman-1-kupang",
      urusanId: "urusan-pendidikan",
    },
    {
      id: "jab-wakasek-kurikulum-sman1",
      indukJabatanId: "jab-kepala-sekolah-sman1",
      kodeJabatan: "S.001.WKK",
      namaJabatan: "Wakil Kepala Sekolah Bidang Kurikulum",
      jenisJabatan: JenisJabatan.STRUKTURAL,
      sekolahId: "sman-1-kupang",
      urusanId: "urusan-kurikulum",
    },
    {
      id: "jab-wakasek-kesiswaan-sman1",
      indukJabatanId: "jab-kepala-sekolah-sman1",
      kodeJabatan: "S.001.WKS",
      namaJabatan: "Wakil Kepala Sekolah Bidang Kesiswaan",
      jenisJabatan: JenisJabatan.STRUKTURAL,
      sekolahId: "sman-1-kupang",
      urusanId: "urusan-kesiswaan",
    },
    {
      id: "jab-wakasek-sarpras-sman1",
      indukJabatanId: "jab-kepala-sekolah-sman1",
      kodeJabatan: "S.001.WKP",
      namaJabatan: "Wakil Kepala Sekolah Bidang Sarana Prasarana",
      jenisJabatan: JenisJabatan.STRUKTURAL,
      sekolahId: "sman-1-kupang",
      urusanId: "urusan-sarana-prasarana",
    },
    {
      id: "jab-guru-matpel-sman1",
      indukJabatanId: "jab-kepala-sekolah-sman1",
      kodeJabatan: "F.001.GM",
      namaJabatan: "Guru Mata Pelajaran",
      jenisJabatan: JenisJabatan.FUNGSIONAL,
      sekolahId: "sman-1-kupang",
      urusanId: "urusan-kurikulum",
    },
    {
      id: "jab-guru-bk-sman1",
      indukJabatanId: "jab-kepala-sekolah-sman1",
      kodeJabatan: "F.001.GBK",
      namaJabatan: "Guru Bimbingan Konseling",
      jenisJabatan: JenisJabatan.FUNGSIONAL,
      sekolahId: "sman-1-kupang",
      urusanId: "urusan-kesiswaan",
    },
    {
      id: "jab-kepala-tu-sman1",
      indukJabatanId: "jab-kepala-sekolah-sman1",
      kodeJabatan: "S.001.KTU",
      namaJabatan: "Kepala Tata Usaha",
      jenisJabatan: JenisJabatan.STRUKTURAL,
      sekolahId: "sman-1-kupang",
      urusanId: "urusan-tu",
    },
    {
      id: "jab-staf-tu-sman1",
      indukJabatanId: "jab-kepala-tu-sman1",
      kodeJabatan: "P.001.STU",
      namaJabatan: "Staf Tata Usaha",
      jenisJabatan: JenisJabatan.PELAKSANA,
      sekolahId: "sman-1-kupang",
      urusanId: "urusan-tu",
    },
  ];

  for (const data of jabatanData) {
    await prisma.jabatan.upsert({
      where: { kodeJabatan: data.kodeJabatan },
      update: {},
      create: data,
    });
  }
  console.log(`   ✅ ${jabatanData.length} jabatan tersimpan`);

  // ==========================================
  // 9. DATA GURU CONTOH (SMAN 1 Kupang)
  // ==========================================
  console.log("📌 Seeding Data Guru contoh (SMAN 1 Kupang)...");
  const guruData = [
    {
      id: "guru-001",
      sekolahId: "sman-1-kupang",
      nip: "197001011995031001",
      nama: "Drs. Yohannes Benu, M.Pd",
      statusPegawai: StatusPegawai.PNS,
      jenisKelamin: "L",
      tempatLahir: "Kupang",
      tanggalLahir: new Date("1970-01-01"),
      pangkatGolongan: "Pembina Tk.I / IV-b",
      tmtGolongan: new Date("2015-04-01"),
      pendidikanTerakhir: "S2",
      bidangStudi: "Manajemen Pendidikan",
      mataPelajaran: "Matematika",
      statusSertifikasi: true,
      nomorSertifikasi: "13110302710001",
      tmtMasuk: new Date("1995-03-01"),
      alamat: "Jl. Timor Raya No. 5, Kupang",
      telepon: "081234567001",
      email: "yohannes.benu@gmail.com",
      aktif: true,
    },
    {
      id: "guru-002",
      sekolahId: "sman-1-kupang",
      nip: "198203152006042002",
      nama: "Maria Takaeb, S.Pd",
      statusPegawai: StatusPegawai.PNS,
      jenisKelamin: "P",
      tempatLahir: "Ende",
      tanggalLahir: new Date("1982-03-15"),
      pangkatGolongan: "Penata / III-c",
      tmtGolongan: new Date("2018-10-01"),
      pendidikanTerakhir: "S1",
      bidangStudi: "Pendidikan Bahasa Indonesia",
      mataPelajaran: "Bahasa Indonesia",
      statusSertifikasi: true,
      nomorSertifikasi: "13110302820002",
      tmtMasuk: new Date("2006-04-01"),
      alamat: "Jl. Eltari No. 12, Kupang",
      telepon: "081234567002",
      email: "maria.takaeb@gmail.com",
      aktif: true,
    },
    {
      id: "guru-003",
      sekolahId: "sman-1-kupang",
      nip: "199005202015031003",
      nama: "Thomas Lende, S.Pd",
      statusPegawai: StatusPegawai.PNS,
      jenisKelamin: "L",
      tempatLahir: "Kupang",
      tanggalLahir: new Date("1990-05-20"),
      pangkatGolongan: "Penata Muda Tk.I / III-b",
      tmtGolongan: new Date("2019-04-01"),
      pendidikanTerakhir: "S1",
      bidangStudi: "Pendidikan Fisika",
      mataPelajaran: "Fisika",
      statusSertifikasi: false,
      tmtMasuk: new Date("2015-03-01"),
      alamat: "Jl. Soeharto No. 8, Kupang",
      telepon: "081234567003",
      email: "thomas.lende@gmail.com",
      aktif: true,
    },
    {
      id: "guru-004",
      sekolahId: "sman-1-kupang",
      nama: "Yuliana Bire, S.Pd",
      statusPegawai: StatusPegawai.PPPK,
      jenisKelamin: "P",
      tempatLahir: "Flores",
      tanggalLahir: new Date("1993-07-11"),
      pangkatGolongan: "IX",
      pendidikanTerakhir: "S1",
      bidangStudi: "Pendidikan Kimia",
      mataPelajaran: "Kimia",
      statusSertifikasi: false,
      tmtMasuk: new Date("2022-01-01"),
      alamat: "Jl. Nangka No. 3, Kupang",
      telepon: "081234567004",
      email: "yuliana.bire@gmail.com",
      aktif: true,
    },
    {
      id: "guru-005",
      sekolahId: "sman-1-kupang",
      nama: "Benediktus Tefa, S.Pd",
      statusPegawai: StatusPegawai.PPPK,
      jenisKelamin: "L",
      tempatLahir: "Atambua",
      tanggalLahir: new Date("1991-11-22"),
      pangkatGolongan: "IX",
      pendidikanTerakhir: "S1",
      bidangStudi: "Pendidikan Biologi",
      mataPelajaran: "Biologi",
      statusSertifikasi: false,
      tmtMasuk: new Date("2022-01-01"),
      alamat: "Jl. Veteran No. 7, Kupang",
      telepon: "081234567005",
      email: "benediktus.tefa@gmail.com",
      aktif: true,
    },
    {
      id: "guru-006",
      sekolahId: "sman-1-kupang",
      nip: "197512282000031004",
      nama: "Agustinus Lelo, S.Pd, M.Pd",
      statusPegawai: StatusPegawai.PNS,
      jenisKelamin: "L",
      tempatLahir: "Kupang",
      tanggalLahir: new Date("1975-12-28"),
      pangkatGolongan: "Pembina / IV-a",
      tmtGolongan: new Date("2014-10-01"),
      pendidikanTerakhir: "S2",
      bidangStudi: "Pendidikan Sejarah",
      mataPelajaran: "Sejarah",
      statusSertifikasi: true,
      nomorSertifikasi: "13110302750004",
      tmtMasuk: new Date("2000-03-01"),
      alamat: "Perumahan Kolhua Blok C No. 5, Kupang",
      telepon: "081234567006",
      email: "agustinus.lelo@gmail.com",
      aktif: true,
    },
  ];

  for (const data of guruData) {
    await prisma.guru.upsert({
      where: { id: data.id },
      update: {},
      create: data,
    });
  }
  console.log(`   ✅ ${guruData.length} guru tersimpan`);

  // ==========================================
  // 10. ANJAB CONTOH (Guru Mata Pelajaran)
  // ==========================================
  console.log("📌 Seeding ANJAB contoh...");
  await prisma.anjab.upsert({
    where: { jabatanId: "jab-guru-matpel-sman1" },
    update: {},
    create: {
      jabatanId: "jab-guru-matpel-sman1",
      ikhtisarJabatan:
        "Melaksanakan kegiatan pembelajaran dan bimbingan kepada peserta didik agar tumbuh dan berkembang sesuai dengan tujuan pendidikan nasional.",
      uraianTugas:
        "Menyusun RPP, melaksanakan pembelajaran, mengevaluasi hasil belajar siswa, melaksanakan remedial dan pengayaan, membimbing siswa dalam kegiatan ekstrakurikuler.",
      bahanKerja: [
        { no: 1, bahan: "Kurikulum/Silabus", penggunaan: "Acuan penyusunan RPP" },
        { no: 2, bahan: "Buku Teks Pelajaran", penggunaan: "Bahan ajar utama" },
        { no: 3, bahan: "Data Nilai Siswa", penggunaan: "Evaluasi hasil belajar" },
        { no: 4, bahan: "Lembar Kerja Siswa", penggunaan: "Media pembelajaran" },
      ],
      perangkatKerja: [
        { no: 1, perangkat: "Komputer/Laptop", penggunaan: "Penyusunan bahan ajar" },
        { no: 2, perangkat: "Proyektor/LCD", penggunaan: "Media presentasi" },
        { no: 3, perangkat: "Papan Tulis", penggunaan: "Media pembelajaran konvensional" },
        { no: 4, perangkat: "Alat Peraga", penggunaan: "Praktik pembelajaran" },
      ],
      hasilKerja: [
        { no: 1, hasil: "RPP (Rencana Pelaksanaan Pembelajaran)", satuan: "Dokumen", jumlah: 1 },
        { no: 2, hasil: "Jadwal Pelajaran", satuan: "Dokumen", jumlah: 1 },
        { no: 3, hasil: "Nilai Hasil Evaluasi Siswa", satuan: "Dokumen", jumlah: 1 },
        { no: 4, hasil: "Laporan Remedial/Pengayaan", satuan: "Laporan", jumlah: 1 },
        { no: 5, hasil: "Bahan Ajar", satuan: "Modul", jumlah: 1 },
      ],
      tanggungjawab: [
        "Ketepatan dan kebenaran materi yang disampaikan kepada peserta didik",
        "Kelancaran proses pembelajaran di kelas",
        "Ketepatan waktu pelaksanaan evaluasi pembelajaran",
        "Kebenaran penilaian hasil belajar peserta didik",
        "Kerahasiaan soal ujian",
      ],
      pangkatGolonganTerendah: "Penata Muda / III-a",
      pangkatGolonganTertinggi: "Pembina Utama / IV-e",
      pendidikanTerendah: "S1",
      bidangPendidikanTerendah: "Kependidikan sesuai mata pelajaran yang diajarkan",
      pendidikanTertinggi: "S3",
      bidangPendidikanTertinggi: "Kependidikan / Ilmu terkait",
      kursusPelatihanPemimpin: [
        "Pelatihan Pra Jabatan",
        "Pendidikan dan Latihan Profesi Guru (PLPG) / PPG",
      ],
      pengalamanKerja: [
        "Pernah mengajar minimal 2 tahun di satuan pendidikan",
        "Memiliki pengalaman dalam pengembangan kurikulum",
      ],
      pengetahuan: [
        "Pengetahuan tentang kurikulum yang berlaku",
        "Pengetahuan tentang psikologi perkembangan anak",
        "Pengetahuan tentang metodologi pembelajaran",
        "Pengetahuan tentang penilaian dan evaluasi pendidikan",
      ],
      keterampilan: [
        "Kemampuan mengoperasikan komputer dan teknologi informasi",
        "Kemampuan berkomunikasi dengan efektif",
        "Kemampuan mengelola kelas",
        "Kemampuan mengembangkan bahan ajar",
      ],
      progressPersen: 100,
    },
  });

  // ==========================================
  // 11. ABK CONTOH (Guru Mata Pelajaran)
  // ==========================================
  console.log("📌 Seeding ABK contoh...");
  const anjabGuruMatpel = await prisma.anjab.findUnique({
    where: { jabatanId: "jab-guru-matpel-sman1" },
  });

  if (anjabGuruMatpel) {
    const detailBebanKerja = [
      { no: 1, uraianTugas: "Menyusun RPP per semester",            satuanHasil: "Dokumen", volumeKerja: 2,   normaWaktu: 480, bebanKerja: 960   },
      { no: 2, uraianTugas: "Melaksanakan pembelajaran tatap muka", satuanHasil: "JP",      volumeKerja: 864, normaWaktu: 45,  bebanKerja: 38880 },
      { no: 3, uraianTugas: "Menyusun soal ulangan harian",         satuanHasil: "Set",     volumeKerja: 8,   normaWaktu: 120, bebanKerja: 960   },
      { no: 4, uraianTugas: "Memeriksa dan menilai hasil ulangan",  satuanHasil: "Lembar",  volumeKerja: 288, normaWaktu: 5,   bebanKerja: 1440  },
      { no: 5, uraianTugas: "Melaksanakan remedial/pengayaan",      satuanHasil: "Kegiatan",volumeKerja: 8,   normaWaktu: 90,  bebanKerja: 720   },
      { no: 6, uraianTugas: "Menyusun laporan hasil evaluasi",      satuanHasil: "Laporan", volumeKerja: 2,   normaWaktu: 180, bebanKerja: 360   },
      { no: 7, uraianTugas: "Mengikuti rapat dewan guru",           satuanHasil: "Kali",    volumeKerja: 12,  normaWaktu: 120, bebanKerja: 1440  },
    ];
    const totalBeban = detailBebanKerja.reduce((sum, d) => sum + d.bebanKerja, 0);
    const jamEfektif = 72000; // menit/tahun (1250 jam × 60 menit)
    const ejNilai = parseFloat((totalBeban / jamEfektif).toFixed(2));
    let ejKategori = "E";
    if (ejNilai >= 0.91) ejKategori = "A";
    else if (ejNilai >= 0.76) ejKategori = "B";
    else if (ejNilai >= 0.61) ejKategori = "C";
    else if (ejNilai >= 0.51) ejKategori = "D";

    await prisma.aBK.upsert({
      where: { anjabId: anjabGuruMatpel.id },
      update: {},
      create: {
        anjabId: anjabGuruMatpel.id,
        detailBebanKerja,
        totalBebanKerja: totalBeban,
        efektivitasNilai: ejNilai,
        efektivitasJabatan: ejKategori as any,
        kebutuhanPegawai: parseFloat((totalBeban / jamEfektif).toFixed(2)),
        statusKebutuhan: "KURANG",
        jumlahKurangLebih: -3,
      },
    });
  }
  console.log("   ✅ ABK contoh tersimpan");

  // ==========================================
  // 12. BEZETING CONTOH
  // ==========================================
  console.log("📌 Seeding Bezeting contoh...");
  await prisma.bezeting.upsert({
    where: { id: "bezeting-guru-matpel-sman1" },
    update: {},
    create: {
      id: "bezeting-guru-matpel-sman1",
      jabatanId: "jab-guru-matpel-sman1",
      namaJabatan: "Guru Mata Pelajaran",
      golonganSaranRendah: "III-a",
      golonganSaranTinggi: "IV-e",
      jumlahPNS: 3,
      jumlahPPPK: 2,
    },
  });
  console.log("   ✅ Bezeting contoh tersimpan");

  // ==========================================
  // 13. PERHITUNGAN GURU CONTOH
  // ==========================================
  console.log("📌 Seeding Perhitungan Guru contoh...");
  await prisma.perhitunganGuru.upsert({
    where: {
      sekolahId_tahunAjaran: {
        sekolahId: "sman-1-kupang",
        tahunAjaran: "2024/2025",
      },
    },
    update: {},
    create: {
      sekolahId: "sman-1-kupang",
      tahunAjaran: "2024/2025",
      jumlahRombel: 30,
      jumlahJamPelajaran: 36,
      bebanMengajar: 24,
      jumlahGuruTersedia: 5,
      jumlahGuruPNS: 3,
      jumlahGuruPPPK: 2,
      kebutuhanGuru: 45,
      kekuranganGuru: 40,
      kelebihanGuru: 0,
      statusKebutuhan: "KURANG",
      prediksiData: [
        { tahun: "2025/2026", prediksi: 47 },
        { tahun: "2026/2027", prediksi: 49 },
        { tahun: "2027/2028", prediksi: 50 },
        { tahun: "2028/2029", prediksi: 52 },
        { tahun: "2029/2030", prediksi: 54 },
      ],
      catatan: "Kebutuhan guru sangat mendesak terutama untuk mata pelajaran MIPA dan Bahasa Inggris.",
    },
  });
  console.log("   ✅ Perhitungan guru contoh tersimpan");

  // ==========================================
  // 14. PROFIL ADMIN PUSAT
  // ==========================================
  console.log("📌 Seeding Profil Admin Pusat...");
  await prisma.profilAdminPusat.upsert({
    where: { id: "profil-pusat-ntt" },
    update: {},
    create: {
      id: "profil-pusat-ntt",
      kabupatenKota: "Kota Kupang",
      namaDaerah: "Provinsi Nusa Tenggara Timur",
      namaKepala: "Drs. Ambrosius Kodo, M.Pd",
      namaWakil: "Maria Goreti Bria, S.Pd, M.M",
      namaSekretaris: "Yosefus Goa, S.H, M.H",
      telepon: "0380-823456",
      email: "disdikbudntt@gmail.com",
      alamat: "Jl. Frans Seda No. 2, Kupang, NTT 85111",
      opd: "Dinas Pendidikan dan Kebudayaan Provinsi NTT",
      websiteUrl: "https://disdikbud.nttprov.go.id",
      hakiInfo: "© 2024 Dinas Pendidikan dan Kebudayaan Provinsi NTT. Hak Cipta Dilindungi.",
    },
  });
  console.log("   ✅ Profil admin pusat tersimpan");

  // ==========================================
  // 15. LANDING PAGE CONFIG
  // ==========================================
  console.log("📌 Seeding Landing Config...");
  await prisma.landingConfig.upsert({
    where: { id: "landing-config-main" },
    update: {},
    create: {
      id: "landing-config-main",
      namaUnit: "Dinas Pendidikan dan Kebudayaan Provinsi NTT",
      keterangan:
        "Sistem Informasi Perhitungan Kebutuhan Guru (E-SIPKG) adalah platform digital untuk mengelola analisis jabatan, analisis beban kerja, dan perhitungan kebutuhan guru secara transparan, akurat, dan merata di seluruh wilayah Provinsi Nusa Tenggara Timur.",
      slides: [
        {
          judul: "Selamat Datang di E-SIPKG",
          deskripsi: "Sistem Informasi Perhitungan Kebutuhan Guru SMA, SMK, dan SLB Provinsi NTT",
          imageUrl: "/images/slide-1.jpg",
        },
        {
          judul: "Analisis Jabatan Digital",
          deskripsi: "Kelola ANJAB dan ABK dengan mudah, cepat, dan terintegrasi",
          imageUrl: "/images/slide-2.jpg",
        },
        {
          judul: "Pemerataan Guru NTT",
          deskripsi: "Mendukung distribusi guru yang merata di seluruh kabupaten/kota NTT",
          imageUrl: "/images/slide-3.jpg",
        },
      ],
      alamat: "Jl. Frans Seda No. 2, Kupang, Nusa Tenggara Timur 85111",
      email: "disdikbudntt@gmail.com",
      kontak: "(0380) 823456",
      hakiInfo: "© 2024 Dinas Pendidikan dan Kebudayaan Provinsi NTT",
    },
  });
  console.log("   ✅ Landing config tersimpan");

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log("\n" + "=".repeat(50));
  console.log("✅ SEEDING SELESAI!");
  console.log("=".repeat(50));
  console.log("\n📋 Akun Login:");
  console.log("─────────────────────────────────────────");
  console.log("👤 ADMIN PUSAT");
  console.log("   Email    : admin@disdikprov.ntt.go.id");
  console.log("   Password : Admin@123");
  console.log("");
  console.log("🏫 ADMIN SEKOLAH (contoh)");
  console.log("   Email    : admin@sman1kupang.sch.id");
  console.log("   Password : Sekolah@123");
  console.log("");
  console.log("   Email    : admin@smkn1kupang.sch.id");
  console.log("   Password : Sekolah@123");
  console.log("─────────────────────────────────────────\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error saat seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });