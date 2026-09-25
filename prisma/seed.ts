import { PrismaClient, RoleUser, JenisSekolah } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Wilayah NTT ────────────────────────────────────────────────────────────
  const wilayahData = [
    'Kota Kupang', 'Kabupaten Kupang', 'Timor Tengah Selatan',
    'Timor Tengah Utara', 'Belu', 'Malaka', 'Alor', 'Flores Timur',
    'Sikka', 'Ende', 'Ngada', 'Manggarai', 'Manggarai Barat',
    'Manggarai Timur', 'Nagekeo', 'Sumba Timur', 'Sumba Barat',
    'Sumba Barat Daya', 'Sumba Tengah', 'Lembata', 'Rote Ndao',
    'Sabu Raijua',
  ]

  for (const nama of wilayahData) {
    await prisma.wilayah.upsert({
      where:  { nama },
      update: {},
      create: { nama, provinsi: 'Nusa Tenggara Timur' },
    })
  }
  console.log('✅ Wilayah seeded (22 kab/kota)')

  // ── Jabatan Guru ───────────────────────────────────────────────────────────
  const jabatanData = [
    { namaJabatan: 'Matematika',              kode: 'MAT',  jamStandar: 24, isBK: false },
    { namaJabatan: 'Bahasa Indonesia',        kode: 'BIND', jamStandar: 24, isBK: false },
    { namaJabatan: 'Bahasa Inggris',          kode: 'BING', jamStandar: 24, isBK: false },
    { namaJabatan: 'Fisika',                  kode: 'FIS',  jamStandar: 24, isBK: false },
    { namaJabatan: 'Kimia',                   kode: 'KIM',  jamStandar: 24, isBK: false },
    { namaJabatan: 'Biologi',                 kode: 'BIO',  jamStandar: 24, isBK: false },
    { namaJabatan: 'Sejarah',                 kode: 'SEJ',  jamStandar: 24, isBK: false },
    { namaJabatan: 'Geografi',                kode: 'GEO',  jamStandar: 24, isBK: false },
    { namaJabatan: 'Ekonomi',                 kode: 'EKO',  jamStandar: 24, isBK: false },
    { namaJabatan: 'Sosiologi',               kode: 'SOS',  jamStandar: 24, isBK: false },
    { namaJabatan: 'PKn',                     kode: 'PKN',  jamStandar: 24, isBK: false },
    { namaJabatan: 'Pendidikan Agama Islam',  kode: 'PAI',  jamStandar: 24, isBK: false },
    { namaJabatan: 'Pendidikan Agama Kristen',kode: 'PAK',  jamStandar: 24, isBK: false },
    { namaJabatan: 'PJOK',                    kode: 'PJOK', jamStandar: 24, isBK: false },
    { namaJabatan: 'Seni Budaya',             kode: 'SB',   jamStandar: 24, isBK: false },
    { namaJabatan: 'TIK / Informatika',       kode: 'TIK',  jamStandar: 24, isBK: false },
    { namaJabatan: 'Bimbingan Konseling',     kode: 'BK',   jamStandar: 24, isBK: true  },
  ]

  for (const jabatan of jabatanData) {
    await prisma.jabatanGuru.upsert({
      where:  { namaJabatan: jabatan.namaJabatan },
      update: {},
      create: jabatan,
    })
  }
  console.log('✅ Jabatan guru seeded (17 jabatan)')

  // ── Periode Laporan Aktif ──────────────────────────────────────────────────
  await prisma.periodeLaporan.upsert({
    where:  { id: 'periode-2024-2025-1' },
    update: {},
    create: {
      id:           'periode-2024-2025-1',
      nama:         'Semester Ganjil 2024/2025',
      tahunAjaran:  '2024/2025',
      semester:     1,
      tanggalMulai: new Date('2024-07-15'),
      tanggalAkhir: new Date('2024-12-31'),
      isAktif:      true,
    },
  })
  console.log('✅ Periode laporan seeded')

  // ── Users — SEMUA LOGIN PAKAI NIP ─────────────────────────────────────────
  //
  // Perubahan dari seed lama:
  //   - field `email` tidak lagi wajib (hanya opsional / info kontak)
  //   - field `nip` WAJIB untuk SEMUA role (ADMIN, BIRO, SEKOLAH)
  //   - upsert menggunakan `where: { nip }` bukan `where: { email }`
  //

  // Admin
  await prisma.user.upsert({
    where:  { nip: '000000000000000001' },
    // "update" diisi supaya menjalankan seed ulang di database yang SUDAH
    // ADA akunnya (mis. reset lokal) benar-benar mengembalikan password ke
    // default — sebelumnya update:{} membuat seed cuma menampilkan pesan
    // "admin123" tanpa benar-benar mengganti password yang lama.
    update: {
      password: await bcrypt.hash('admin123', 10),
      nama:     'Administrator Sistem',
      role:     RoleUser.ADMIN,
    },
    create: {
      nip:      '000000000000000001',
      password: await bcrypt.hash('admin123', 10),
      nama:     'Administrator Sistem',
      role:     RoleUser.ADMIN,
      email:    'admin@esipkg.id',   // opsional — info kontak
    },
  })

  // Biro
  await prisma.user.upsert({
    where:  { nip: '000000000000000002' },
    update: {
      password: await bcrypt.hash('biro123', 10),
      nama:     'Biro Organisasi NTT',
      role:     RoleUser.BIRO,
    },
    create: {
      nip:      '000000000000000002',
      password: await bcrypt.hash('biro123', 10),
      nama:     'Biro Organisasi NTT',
      role:     RoleUser.BIRO,
      email:    'biro@esipkg.id',    // opsional — info kontak
    },
  })

  // Sekolah demo — SMA Negeri 1 Kupang
  const wilayahKupang = await prisma.wilayah.findFirst({
    where: { nama: 'Kota Kupang' },
  })

  if (wilayahKupang) {
    const sekolah = await prisma.sekolah.upsert({
      where:  { npsn: '50305001' },
      update: {},
      create: {
        nama:         'SMA Negeri 1 Kupang',
        jenisSekolah: JenisSekolah.SMA,
        npsn:         '50305001',
        alamat:       'Jl. Ahmad Yani No. 1, Kota Kupang',
        wilayahId:    wilayahKupang.id,
        jumlahSiswa:  900,
        jumlahRombel: 27,
      },
    })

    await prisma.user.upsert({
      where:  { nip: '19850101201001001' },
      update: {
        password:   await bcrypt.hash('sekolah123', 10),
        nama:       'Operator SMA Negeri 1 Kupang',
        role:       RoleUser.SEKOLAH,
        sekolahId:  sekolah.id,
      },
      create: {
        nip:        '19850101201001001',
        password:   await bcrypt.hash('sekolah123', 10),
        nama:       'Operator SMA Negeri 1 Kupang',
        role:       RoleUser.SEKOLAH,
        sekolahId:  sekolah.id,
        email:      'sman1kupang@esipkg.id', // opsional
      },
    })
  }

  console.log('✅ Users seeded')

  // ── Pengumuman contoh untuk Dashboard Admin ───────────────────────────────
  await prisma.pengumuman.createMany({
    data: [
      {
        judul:   'Pemutakhiran Data Sekolah',
        isi:     'Harap setiap sekolah melakukan pemutakhiran data guru dan rombel secara berkala.',
        tanggal: new Date('2026-09-20'),
      },
      {
        judul:   'Jadwal Validasi Semester Ganjil',
        isi:     'Validasi data guru akan dilaksanakan pada periode 15 – 30 September 2026.',
        tanggal: new Date('2026-09-15'),
      },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Pengumuman seeded')
  console.log('')
  console.log('━'.repeat(52))
  console.log('🎉 Seeding selesai!')
  console.log('━'.repeat(52))
  console.log('')
  console.log('Akun default (login pakai NIP + password):')
  console.log('')
  console.log('  Role    │ NIP                 │ Password')
  console.log('  ────────┼─────────────────────┼───────────')
  console.log('  ADMIN   │ 000000000000000001  │ admin123')
  console.log('  WILAYAH │ 000000000000000003  │ wilayah123')
  console.log('  BIRO    │ 000000000000000002  │ biro123')
  console.log('  SEKOLAH │ 19850101201001001   │ sekolah123')
  console.log('')
  console.log('⚠  Ganti password setelah login pertama!')
  console.log('━'.repeat(52))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })