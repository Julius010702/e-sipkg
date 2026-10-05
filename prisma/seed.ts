import { PrismaClient, RoleUser, JenisSekolah } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Wilayah NTT ────────────────────────────────────────────────────────────
  // Koordinat = titik tengah ibu kota kabupaten/kota masing-masing.
  const wilayahData: { nama: string; lat: number; lng: number }[] = [
    { nama: 'Kota Kupang',          lat: -10.1772, lng: 123.6070 },
    { nama: 'Kabupaten Kupang',     lat: -10.0367, lng: 123.9114 },
    { nama: 'Timor Tengah Selatan', lat: -9.8607,  lng: 124.2839 },
    { nama: 'Timor Tengah Utara',   lat: -9.4507,  lng: 124.4783 },
    { nama: 'Belu',                 lat: -9.1061,  lng: 124.8925 },
    { nama: 'Malaka',               lat: -9.2667,  lng: 124.6833 },
    { nama: 'Alor',                 lat: -8.2333,  lng: 124.5167 },
    { nama: 'Flores Timur',         lat: -8.3500,  lng: 122.9833 },
    { nama: 'Sikka',                lat: -8.6167,  lng: 122.2167 },
    { nama: 'Ende',                 lat: -8.8432,  lng: 121.6614 },
    { nama: 'Ngada',                lat: -8.7667,  lng: 120.9833 },
    { nama: 'Manggarai',            lat: -8.6136,  lng: 120.4675 },
    { nama: 'Manggarai Barat',      lat: -8.4900,  lng: 119.8875 },
    { nama: 'Manggarai Timur',      lat: -8.6667,  lng: 120.5167 },
    { nama: 'Nagekeo',              lat: -8.6667,  lng: 121.1500 },
    { nama: 'Sumba Timur',          lat: -9.6567,  lng: 120.2600 },
    { nama: 'Sumba Barat',          lat: -9.6500,  lng: 119.4167 },
    { nama: 'Sumba Barat Daya',     lat: -9.4167,  lng: 119.2500 },
    { nama: 'Sumba Tengah',         lat: -9.6167,  lng: 119.6833 },
    { nama: 'Lembata',              lat: -8.3667,  lng: 123.4667 },
    { nama: 'Rote Ndao',            lat: -10.7167, lng: 123.1167 },
    { nama: 'Sabu Raijua',          lat: -10.4833, lng: 121.8000 },
  ]

  for (const { nama, lat, lng } of wilayahData) {
    await prisma.wilayah.upsert({
      where:  { nama },
      update: { latitude: lat, longitude: lng },
      create: { nama, provinsi: 'Nusa Tenggara Timur', latitude: lat, longitude: lng },
    })
  }
  console.log('✅ Wilayah seeded (22 kab/kota, dengan koordinat)')

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
  console.log('  BIRO    │ 000000000000000002  │ biro123')
  console.log('  SEKOLAH │ 19850101201001001   │ sekolah123')
  console.log('')
  console.log('⚠  Ganti password setelah login pertama!')
  console.log('━'.repeat(52))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })