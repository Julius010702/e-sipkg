// src/types/jabatan.ts

import type { JenisJabatan, UnitOrganisasi, OPD, Urusan } from "./index";

export interface Jabatan {
  id: string;
  kodeJabatan: string;
  namaJabatan: string;
  jenisJabatan: JenisJabatan;
  indukJabatanId?: string;
  indukJabatan?: Pick<Jabatan, "id" | "namaJabatan" | "kodeJabatan">;
  subJabatan?: Pick<Jabatan, "id" | "namaJabatan" | "kodeJabatan">[];
  unitOrganisasiId?: string;
  unitOrganisasi?: UnitOrganisasi;
  opdId?: string;
  opd?: OPD;
  sekolahId?: string;
  urusanId?: string;
  urusan?: Urusan;
  syaratJabatan?: string;
  anjab?: {
    id: string;
    progressPersen: number;
    abk?: { id: string; efektivitasJabatan?: string; statusKebutuhan?: string };
  };
  bezeting?: { jumlahPNS: number; jumlahPPPK: number }[];
  pemangku?: { id: string }[];
  _count?: { pemangku: number; subJabatan: number };
  createdAt: string;
  updatedAt: string;
}

export interface JabatanFormInput {
  indukJabatanId?: string;
  unitOrganisasiId?: string;
  opdId?: string;
  sekolahId?: string;
  urusanId?: string;
  jenisJabatan: JenisJabatan;
  namaJabatan: string;
  kodeJabatan: string;
  syaratJabatan?: string;
}

// Tree node untuk org chart
export interface JabatanNode {
  id: string;
  kodeJabatan: string;
  namaJabatan: string;
  jenisJabatan: JenisJabatan;
  pemangku?: string;
  jumlahPemangku?: number;
  progressAnjab?: number;
  children?: JabatanNode[];
}

// Konversi flat Jabatan[] ke tree
export function buildJabatanTree(jabatanList: Jabatan[]): JabatanNode[] {
  const map = new Map<string, JabatanNode>();
  const roots: JabatanNode[] = [];

  jabatanList.forEach((j) => {
    map.set(j.id, {
      id: j.id,
      kodeJabatan: j.kodeJabatan,
      namaJabatan: j.namaJabatan,
      jenisJabatan: j.jenisJabatan,
      jumlahPemangku: j._count?.pemangku ?? 0,
      progressAnjab: j.anjab?.progressPersen ?? 0,
      children: [],
    });
  });

  jabatanList.forEach((j) => {
    const node = map.get(j.id)!;
    if (j.indukJabatanId && map.has(j.indukJabatanId)) {
      map.get(j.indukJabatanId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}