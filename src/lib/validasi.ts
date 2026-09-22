import { z } from 'zod'

// ── Guru Jabatan ─────────────────────────────────────────────
export const guruJabatanSchema = z.object({
  namaJabatan: z
    .string({ required_error: 'Nama jabatan wajib diisi' })
    .min(2, 'Nama jabatan minimal 2 karakter')
    .max(100, 'Nama jabatan maksimal 100 karakter')
    .transform(v => v.trim()),

  jenjangJabatan: z.enum(
    ['AHLI_PERTAMA', 'AHLI_MUDA', 'AHLI_MADYA', 'AHLI_UTAMA'],
    { required_error: 'Jenjang jabatan wajib dipilih' }
  ),

  isBK: z.boolean().default(false),

  jumlahGuruPNS: z
    .number({ invalid_type_error: 'Jumlah guru PNS harus berupa angka' })
    .int().min(0, 'Tidak boleh negatif').default(0),

  jumlahGuruPPPK: z
    .number({ invalid_type_error: 'Jumlah guru PPPK harus berupa angka' })
    .int().min(0, 'Tidak boleh negatif').default(0),

  jamMengajarPerMinggu: z
    .number({ invalid_type_error: 'Jam mengajar harus berupa angka' })
    .int().min(1, 'Minimal 1 jam').max(40, 'Maksimal 40 jam').default(24),

  jumlahRombel: z
    .number({ invalid_type_error: 'Jumlah rombel harus berupa angka' })
    .int().min(1, 'Jumlah rombel minimal 1').default(1),
})

export type GuruJabatanInput = z.infer<typeof guruJabatanSchema>

// ── Sekolah ──────────────────────────────────────────────────
export const sekolahSchema = z.object({
  nama:          z.string().min(3, 'Nama sekolah minimal 3 karakter'),
  jenisSekolah:  z.enum(['SMA', 'SMK', 'SLB']),
  npsn:          z.string().optional().nullable(),
  alamat:        z.string().optional().nullable(),
  wilayahId:     z.string().min(1, 'Wilayah wajib dipilih'),
  jumlahSiswa:   z.number().int().min(0).default(0),
  jumlahRombel:  z.number().int().min(0).default(0),
  kepalaSekolah: z.string().optional().nullable(),
  nipKepala:     z.string().optional().nullable(),
})

export type SekolahInput = z.infer<typeof sekolahSchema>

// ── Kompetensi Keahlian ───────────────────────────────────────
export const kompetensiKeahlianSchema = z.object({
  namaJurusan:  z.string().min(2, 'Nama jurusan minimal 2 karakter'),
  bidangStudi:  z.string().optional().nullable(),
  jumlahSiswa:  z.number().int().min(0).default(0),
  jumlahRombel: z.number().int().min(0).default(0),
})

export type KompetensiKeahlianInput = z.infer<typeof kompetensiKeahlianSchema>

// ── Periode Laporan ───────────────────────────────────────────
export const periodeLaporanSchema = z.object({
  nama:         z.string().min(3),
  tahunAjaran:  z.string().min(7, 'Format: 2024/2025'),
  semester:     z.number().int().min(1).max(2),
  tanggalMulai: z.string().datetime(),
  tanggalAkhir: z.string().datetime(),
  isAktif:      z.boolean().default(false),
})

export type PeriodeLaporanInput = z.infer<typeof periodeLaporanSchema>

// ── Auth / Login ──────────────────────────────────────────────
// Login pakai NIP (sekolah) ATAU email (biro/admin)
export const loginSchema = z.object({
  nip: z
    .string()
    .min(5, 'NIP minimal 5 karakter')
    .max(30, 'NIP maksimal 30 karakter')
    .transform(v => v.trim())
    .optional(),

  email: z
    .string()
    .email('Format email tidak valid')
    .transform(v => v.trim())
    .optional(),

  password: z
    .string({ required_error: 'Password wajib diisi' })
    .min(6, 'Password minimal 6 karakter'),
}).refine(data => data.nip || data.email, {
  message: 'NIP atau email wajib diisi',
})

export type LoginInput = z.infer<typeof loginSchema>

// ── User (CRUD Admin) ─────────────────────────────────────────
export const userSchema = z.object({
  email: z
    .string({ required_error: 'Email wajib diisi' })
    .email('Format email tidak valid')
    .transform(v => v.trim()),

  nip: z
    .string()
    .min(5, 'NIP minimal 5 karakter')
    .max(30, 'NIP maksimal 30 karakter')
    .transform(v => v.trim())
    .optional()
    .nullable(),

  password: z
    .string()
    .min(6, 'Password minimal 6 karakter')
    .optional(),

  nama: z
    .string({ required_error: 'Nama wajib diisi' })
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .transform(v => v.trim()),

  role: z.enum(['ADMIN', 'BIRO', 'SEKOLAH'], {
    required_error: 'Role wajib dipilih',
  }),

  sekolahId: z.string().optional().nullable(),
})

export type UserInput = z.infer<typeof userSchema>