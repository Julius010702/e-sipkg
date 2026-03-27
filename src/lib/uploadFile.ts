// src/lib/uploadFile.ts
// Handle upload file logo/lambang sekolah & instansi
// Menggunakan Next.js API Route + sharp untuk optimasi gambar

import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// ==========================================
// KONFIGURASI
// ==========================================

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";

export const UPLOAD_CONFIG = {
  maxSizeMB: 5,
  maxSizeBytes: 5 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".svg"],
  outputSize: {
    logo:   { width: 200, height: 200 },   // logo sekolah
    banner: { width: 1200, height: 400 },  // banner/header
    avatar: { width: 100, height: 100 },   // foto profil
  },
};

export type UploadType = "logo" | "banner" | "avatar";

// ==========================================
// VALIDASI
// ==========================================

export function validateFile(
  file: File | { name: string; size: number; type: string },
  type: UploadType = "logo"
): { valid: boolean; error?: string } {
  if (file.size > UPLOAD_CONFIG.maxSizeBytes) {
    return { valid: false, error: `Ukuran file maksimal ${UPLOAD_CONFIG.maxSizeMB}MB` };
  }
  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    return { valid: false, error: `Format file tidak didukung. Gunakan JPG, PNG, atau WebP` };
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!UPLOAD_CONFIG.allowedExtensions.includes(ext)) {
    return { valid: false, error: `Ekstensi file tidak diizinkan` };
  }
  return { valid: true };
}

// ==========================================
// GENERATE FILENAME
// ==========================================

export function generateFileName(
  originalName: string,
  prefix: string,
  type: UploadType = "logo"
): string {
  const ext       = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const safe      = prefix.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
  return `${type}-${safe}-${timestamp}${ext === ".svg" ? ".svg" : ".webp"}`;
}

// ==========================================
// PASTIKAN FOLDER ADA
// ==========================================

async function ensureDir(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

// ==========================================
// UPLOAD & OPTIMASI
// ==========================================

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

/**
 * Simpan file upload ke disk dengan optimasi menggunakan sharp
 */
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  prefix: string,
  type: UploadType = "logo"
): Promise<UploadResult> {
  try {
    const subDir  = path.join(UPLOAD_DIR, type);
    await ensureDir(subDir);

    const ext      = path.extname(originalName).toLowerCase();
    const filename = generateFileName(originalName, prefix, type);
    const filePath = path.join(subDir, filename);

    // SVG tidak dioptimasi
    if (ext === ".svg") {
      await writeFile(filePath, buffer);
    } else {
      // Optimasi dengan sharp
      try {
        const sharp   = (await import("sharp")).default;
        const size    = UPLOAD_CONFIG.outputSize[type];
        const optimized = await sharp(buffer)
          .resize(size.width, size.height, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer();
        await writeFile(filePath, optimized);
      } catch {
        // Fallback: simpan tanpa optimasi jika sharp gagal
        await writeFile(filePath, buffer);
      }
    }

    // URL publik
    const publicUrl = `/uploads/${type}/${filename}`;
    return { success: true, url: publicUrl, filename };

  } catch (error) {
    console.error("[uploadFile] Error:", error);
    return { success: false, error: "Gagal menyimpan file" };
  }
}

// ==========================================
// UPLOAD DARI FormData (Next.js Route Handler)
// ==========================================

/**
 * Handle upload dari API Route
 * Contoh: const result = await handleUploadFromRequest(req, "logo", sekolahId)
 */
export async function handleUploadFromRequest(
  req: Request,
  type: UploadType = "logo",
  prefix = "upload"
): Promise<UploadResult> {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;

    if (!file) {
      return { success: false, error: "File tidak ditemukan" };
    }

    const validation = validateFile(file, type);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);

    return await uploadFile(buffer, file.name, prefix, type);
  } catch (error) {
    console.error("[handleUploadFromRequest] Error:", error);
    return { success: false, error: "Gagal memproses file" };
  }
}

// ==========================================
// HAPUS FILE LAMA
// ==========================================

/**
 * Hapus file lama saat upload file baru
 * url: "/uploads/logo/logo-sman1-xxx.webp"
 */
export async function deleteFile(publicUrl: string): Promise<void> {
  try {
    if (!publicUrl || !publicUrl.startsWith("/uploads/")) return;
    const relativePath = publicUrl.replace("/uploads/", "");
    const fullPath     = path.join(UPLOAD_DIR, relativePath);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }
  } catch (error) {
    console.error("[deleteFile] Error:", error);
  }
}

// ==========================================
// BASE64 TO BUFFER (untuk client-side upload)
// ==========================================

export function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:[a-z]+\/[a-z]+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

// ==========================================
// URL HELPER
// ==========================================

/**
 * Get full URL upload (termasuk domain untuk production)
 */
export function getUploadUrl(filename: string, type: UploadType = "logo"): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/uploads/${type}/${filename}`;
}

/**
 * Ambil filename dari URL
 */
export function getFilenameFromUrl(url: string): string {
  return url.split("/").pop() || "";
}