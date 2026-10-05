// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getSessionFromRequest } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

// Peta MIME → ekstensi aman. Ekstensi file TIDAK PERNAH diambil dari input user.
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

// Magic bytes — cek beberapa byte pertama file untuk memastikan isinya
// benar-benar gambar sesuai tipe yang diklaim, bukan cuma percaya Content-Type.
function isValidImageSignature(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false
  const sig = buffer.subarray(0, 4)
  switch (mimeType) {
    case 'image/jpeg':
      return sig[0] === 0xff && sig[1] === 0xd8
    case 'image/png':
      return sig[0] === 0x89 && sig[1] === 0x50 && sig[2] === 0x4e && sig[3] === 0x47
    case 'image/gif':
      return buffer.subarray(0, 3).toString('ascii') === 'GIF'
    case 'image/webp':
      return buffer.subarray(0, 4).toString('ascii') === 'RIFF'
    default:
      return false
  }
}

export async function POST(req: NextRequest) {
  // Wajib login sebagai ADMIN — jangan andalkan middleware saja untuk /api/*
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File wajib diisi' }, { status: 400 })
    }

    const safeExt = ALLOWED_TYPES[file.type]
    if (!safeExt) {
      return NextResponse.json({ error: 'Format file harus JPG, PNG, WEBP, atau GIF' }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (!isValidImageSignature(buffer, file.type)) {
      return NextResponse.json({ error: 'File tidak valid atau rusak' }, { status: 400 })
    }

    // Nama file acak — nama asli dari user tidak pernah dipakai untuk path.
    const filename = `slides/${crypto.randomUUID()}.${safeExt}`

    // Vercel Blob butuh BLOB_READ_WRITE_TOKEN, yang cuma otomatis tersedia
    // setelah project di-deploy ke Vercel dengan Blob store terhubung. Di
    // lingkungan lokal (belum ada token itu), simpan langsung ke folder
    // public/uploads/ supaya fitur upload tetap bisa dites tanpa Vercel.
    let publicPath: string
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: file.type,
      })
      publicPath = blob.url
    } else {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'slides')
      fs.mkdirSync(uploadDir, { recursive: true })
      const localFilename = `${crypto.randomUUID()}.${safeExt}`
      fs.writeFileSync(path.join(uploadDir, localFilename), buffer)
      publicPath = `/uploads/slides/${localFilename}`
    }

    return NextResponse.json({ data: { path: publicPath } }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Gagal mengunggah file' }, { status: 500 })
  }
}