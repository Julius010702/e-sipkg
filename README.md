# e-SIPKG — Sistem Pemerataan Guru NTT
> Next.js 14 + PostgreSQL + Prisma ORM

---

## 🚀 Setup & Instalasi

### 1. Install dependencies
```bash
npm install
```

### 2. Konfigurasi environment
```bash
cp .env.example .env
```
Edit `.env` dan sesuaikan `DATABASE_URL`:
```
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/pemerataan_guru?schema=public"
NEXTAUTH_SECRET="ganti-dengan-secret-panjang-random"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Buat database & jalankan migrasi
```bash
# Buat database di PostgreSQL terlebih dahulu:
# CREATE DATABASE pemerataan_guru;

npx prisma db push
```

### 4. Isi data awal (seed)
```bash
npm run db:seed
```

Akun default setelah seed:
| Role    | Email                      | Password     |
|---------|----------------------------|--------------|
| Admin   | admin@esipkg.id            | admin123     |
| Biro    | biro@esipkg.id             | biro123      |
| Sekolah | sman1kupang@esipkg.id      | sekolah123   |

### 5. Jalankan development server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Peran

| Peran   | Akses                                              |
|---------|----------------------------------------------------|
| Sekolah | Input data guru, lihat dashboard, kirim laporan    |
| Biro    | Validasi data, analisis kebutuhan, pemerataan      |
| Admin   | Kelola user, master jabatan, wilayah, periode      |

---

## ⚙️ Formula Kalkulasi

**Guru Mapel:**
```
Kebutuhan = (Jam Mengajar × Jumlah Rombel) / 24
```

**Guru BK:**
```
Kebutuhan = Jumlah Siswa / 150
```

**Selisih:**
```
Selisih = Kebutuhan - Tersedia
+ (positif) = Kekurangan guru
- (negatif) = Kelebihan guru
```

---

## 🛠️ Commands

```bash
npm run dev          # Development server
npm run build        # Build production
npm run db:push      # Sinkronisasi schema ke database
npm run db:seed      # Isi data awal
npm run db:studio    # Buka Prisma Studio (GUI database)
npm run db:migrate   # Buat migration baru
```

---

## 🗂️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT (jose) + httpOnly cookies
- **Styling:** Tailwind CSS
- **Validation:** Zod
Sip, berarti yang kamu butuhkan memang **perintah terminal**. Berikut cheat sheet yang biasa dipakai saat mengembangkan proyek Prisma + PostgreSQL.

```bash
# Validasi schema
npx prisma validate

# Format schema
npx prisma format

# Generate Prisma Client
npx prisma generate

# Migration pertama (membuat semua tabel)
npx prisma migrate dev --name init

# Menambah kolom
npx prisma migrate dev --name add_nama_kolom

# Menghapus kolom
npx prisma migrate dev --name remove_nama_kolom

# Mengubah tipe data
npx prisma migrate dev --name update_nama_kolom

# Menambah tabel baru
npx prisma migrate dev --name create_nama_tabel

# Menghapus tabel
npx prisma migrate dev --name remove_nama_tabel

# Menambah relasi
npx prisma migrate dev --name add_relation

# Mengubah relasi
npx prisma migrate dev --name update_relation

# Menambah enum
npx prisma migrate dev --name add_enum

# Mengubah enum
npx prisma migrate dev --name update_enum

# Sinkronkan schema ke database tanpa migration (hanya development)
npx prisma db push

# Membuka Prisma Studio
npx prisma studio

# Melihat status migration
npx prisma migrate status

# Deploy migration (server production)
npx prisma migrate deploy

# Reset database (menghapus semua data)
npx prisma migrate reset
```

### Contoh nyata untuk proyek e-SIPKG

Misalnya kamu:

* menambah tabel **Pengumuman** → jalankan:

  ```bash
  npx prisma migrate dev --name create_pengumuman
  ```

* menambah kolom **website** di `Sekolah` → jalankan:

  ```bash
  npx prisma migrate dev --name add_website_sekolah
  ```

* menghapus kolom **alamat** → jalankan:

  ```bash
  npx prisma migrate dev --name remove_alamat_sekolah
  ```

* menambah tabel **DataGuru** → jalankan:

  ```bash
  npx prisma migrate dev --name create_data_guru
  ```

* mengubah relasi `Sekolah` dengan `Guru` → jalankan:

  ```bash
  npx prisma migrate dev --name update_relation_sekolah_guru
  ```

### Pola penamaan migration yang disarankan

* `init`
* `create_<nama_tabel>`
* `add_<nama_kolom>`
* `remove_<nama_kolom>`
* `update_<nama_kolom>`
* `rename_<nama_kolom>`
* `add_relation_<nama>`
* `update_relation_<nama>`
* `add_enum_<nama>`
* `update_enum_<nama>`

Dengan pola ini, riwayat migration akan rapi dan mudah dipahami ketika proyek berkembang.
