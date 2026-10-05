// app/api/biro/laporan/export/word/route.ts
// Requires: npm install docx
import { NextRequest, NextResponse } from 'next/server'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, PageOrientation, BorderStyle, WidthType, ShadingType, VerticalAlign,
  ImageRun,
} from 'docx'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import { getSessionFromRequest } from '@/lib/auth'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || (session.role !== 'ADMIN' && session.role !== 'BIRO' && session.role !== 'WILAYAH')) {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 })
  }
  await logActivity(session.id, session.nama, 'Mengunduh laporan kebutuhan guru (Word)')

  // Kalau diakses akun WILAYAH, laporan dibatasi hanya sekolah di
  // wilayah (kabupaten/kota) yang ditugaskan ke akun itu.
  const wilayahScope = session.role === 'WILAYAH'
    ? await prisma.wilayah.findUnique({ where: { id: session.wilayahId! } })
    : null

  // Baca logo dari public/ folder — path relatif ke root proyek Next.js
  const logoPath = path.join(process.cwd(), 'public', 'logo-ntt.png')
  const logoBuffer = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null
  const sekolahList = await prisma.sekolah.findMany({
    where: wilayahScope ? { wilayahId: wilayahScope.id } : undefined,
    include: { wilayah: true, guruJabatan: true },
    orderBy: [{ wilayah: { nama: 'asc' } }, { nama: 'asc' }],
  })

  const anjabData = sekolahList.map((s) => {
    const kebutuhanGuru = Math.round(s.guruJabatan.reduce((sum, g) => sum + g.kebutuhanGuru, 0))
    const pns           = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPNS, 0)
    const pppk          = s.guruJabatan.reduce((sum, g) => sum + g.jumlahGuruPPPK, 0)
    const totalASN      = pns + pppk
    const selisih       = totalASN - kebutuhanGuru
    return {
      nama: s.nama, jenisSekolah: s.jenisSekolah, wilayah: s.wilayah.nama,
      kebutuhanGuru, pns, pppk, totalASN,
      kurang: selisih < 0 ? Math.abs(selisih) : null,
      lebih:  selisih > 0 ? selisih : null,
    }
  })

  const totalKebutuhan = anjabData.reduce((s,r) => s+r.kebutuhanGuru, 0)
  const totalPNS       = anjabData.reduce((s,r) => s+r.pns, 0)
  const totalPPPK      = anjabData.reduce((s,r) => s+r.pppk, 0)
  const totalASN       = totalPNS + totalPPPK
  const totalKurang    = anjabData.reduce((s,r) => s+(r.kurang||0), 0)
  const totalLebih     = anjabData.reduce((s,r) => s+(r.lebih||0), 0)

  const now     = new Date()
  const tanggal = now.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
  const tahun   = now.getFullYear()

  // A4 landscape — docx-js swaps width/height internally when orientation = LANDSCAPE
  const MARGIN = 850 // ~1.5 cm
  const colW   = [520, 3800, 720, 2700, 1300, 1000, 1000, 1200, 1050, 1050]

  const border     = { style: BorderStyle.SINGLE, size: 4, color: '4472C4' }
  const borders    = { top:border, bottom:border, left:border, right:border }
  const hdrBorder  = { style: BorderStyle.SINGLE, size: 6, color: '1F3864' }
  const hdrBorders = { top:hdrBorder, bottom:hdrBorder, left:hdrBorder, right:hdrBorder }

  const cell = (txt: string|number, w: number, opts: {
    align?: (typeof AlignmentType)[keyof typeof AlignmentType]
    bold?: boolean; color?: string; fill?: string
  } = {}) => new TableCell({
    borders, width:{ size:w, type:WidthType.DXA },
    margins:{ top:60, bottom:60, left:100, right:100 },
    shading: opts.fill ? { fill:opts.fill, type:ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children:[new Paragraph({
      alignment: opts.align ?? AlignmentType.CENTER,
      children:[new TextRun({ text:String(txt??''), font:'Arial', size:16,
        bold:!!opts.bold, color:opts.color??'000000' })]
    })]
  })

  const hdrCell = (txt: string, w: number, rowSpan?: number, colSpan?: number) =>
    new TableCell({
      borders:hdrBorders, width:{ size:w, type:WidthType.DXA },
      margins:{ top:80, bottom:80, left:100, right:100 },
      shading:{ fill:'1F3864', type:ShadingType.CLEAR },
      ...(rowSpan ? { rowSpan } : {}),
      ...(colSpan ? { columnSpan:colSpan } : {}),
      verticalAlign:VerticalAlign.CENTER,
      children:[new Paragraph({ alignment:AlignmentType.CENTER,
        children:[new TextRun({ text:txt, font:'Arial', size:16, bold:true, color:'FFFFFF' })] })]
    })

  const dataRow = (s: typeof anjabData[0], i: number) => {
    const bg = i%2===0 ? 'FFFFFF' : 'EEF2F8'
    return new TableRow({ children:[
      cell(i+1,            colW[0], { fill:bg }),
      cell(s.nama,         colW[1], { align:AlignmentType.LEFT, fill:bg }),
      cell(s.jenisSekolah, colW[2], { fill:bg }),
      cell(s.wilayah,      colW[3], { align:AlignmentType.LEFT, fill:bg }),
      cell(s.kebutuhanGuru,colW[4], { bold:true, fill:bg }),
      cell(s.pns,          colW[5], { fill:bg }),
      cell(s.pppk,         colW[6], { fill:bg }),
      cell(s.totalASN,     colW[7], { bold:true, fill:bg }),
      cell(s.kurang??'',   colW[8], { bold:!!s.kurang, color:s.kurang?'CC0000':'000000', fill:bg }),
      cell(s.lebih??'',    colW[9], { bold:!!s.lebih,  color:s.lebih?'1E7E34':'000000', fill:bg }),
    ]})
  }

  const table = new Table({
    width:{ size:colW.reduce((a,b)=>a+b,0), type:WidthType.DXA },
    columnWidths: colW,
    rows:[
      new TableRow({ tableHeader:true, children:[
        hdrCell('No',colW[0],2), hdrCell('Nama Sekolah',colW[1],2),
        hdrCell('Jenis',colW[2],2), hdrCell('Kabupaten/Kota',colW[3],2),
        hdrCell('Kebutuhan\nGuru',colW[4],2),
        hdrCell('Bezeting ASN', colW[5]+colW[6], undefined, 2),
        hdrCell('Total ASN',colW[7],2),
        hdrCell('Kebutuhan', colW[8]+colW[9], undefined, 2),
      ]}),
      new TableRow({ tableHeader:true, children:[
        hdrCell('PNS',colW[5]), hdrCell('PPPK',colW[6]),
        hdrCell('Kurang',colW[8]), hdrCell('Lebih',colW[9]),
      ]}),
      ...anjabData.map(dataRow),
      new TableRow({ children:[
        new TableCell({
          borders:hdrBorders, columnSpan:4,
          width:{ size:colW[0]+colW[1]+colW[2]+colW[3], type:WidthType.DXA },
          margins:{ top:80, bottom:80, left:100, right:100 },
          shading:{ fill:'D6E4F0', type:ShadingType.CLEAR }, verticalAlign:VerticalAlign.CENTER,
          children:[new Paragraph({ alignment:AlignmentType.CENTER,
            children:[new TextRun({ text:'TOTAL KESELURUHAN', font:'Arial', bold:true, size:17, color:'1F3864' })] })]
        }),
        cell(totalKebutuhan, colW[4], { bold:true, fill:'D6E4F0', color:'1F3864' }),
        cell(totalPNS,       colW[5], { bold:true, fill:'D6E4F0', color:'1F3864' }),
        cell(totalPPPK,      colW[6], { bold:true, fill:'D6E4F0', color:'1F3864' }),
        cell(totalASN,       colW[7], { bold:true, fill:'D6E4F0', color:'1F3864' }),
        cell(totalKurang||'',colW[8], { bold:true, fill:'D6E4F0', color:'CC0000' }),
        cell(totalLebih||'', colW[9], { bold:true, fill:'D6E4F0', color:'1E7E34' }),
      ]}),
    ]
  })

  const doc = new Document({
    sections:[{
      properties:{ page:{
        size:{ width:11906, height:16838, orientation:PageOrientation.LANDSCAPE },
        margin:{ top:MARGIN, right:MARGIN, bottom:MARGIN, left:MARGIN }
      }},
      children:[
        // Logo (jika file ada di public/logo-ntt.png)
        ...(logoBuffer ? [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new ImageRun({
            data: logoBuffer,
            transformation: { width: 70, height: 70 },
            type: 'png',
          })],
        })] : []),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:0},
          children:[new TextRun({ text:'PEMERINTAH PROVINSI NUSA TENGGARA TIMUR',
            font:'Arial', size:20, bold:true, color:'1F3864' })] }),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:0},
          children:[new TextRun({ text:'DINAS PENDIDIKAN DAN KEBUDAYAAN',
            font:'Arial', size:28, bold:true, color:'1F3864' })] }),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:0},
          children:[new TextRun({ text:'Biro Kepegawaian — Bidang Perencanaan dan Pemerataan Guru',
            font:'Arial', size:18, color:'595959' })] }),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:40},
          border:{ bottom:{ style:BorderStyle.DOUBLE, size:6, color:'1F3864' } },
          children:[new TextRun({ text:'Jl. W.J. Lalamentik No. 1, Kupang  |  Telp. (0380) 831584  |  dikbud@nttprov.go.id',
            font:'Arial', size:16, color:'888888' })] }),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:160, after:40},
          children:[new TextRun({ text:'REKAPITULASI ANALISIS JABATAN DAN ANALISIS BEBAN KERJA (ANJAB & ABK)',
            font:'Arial', size:22, bold:true, underline:{} })] }),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:40},
          children:[new TextRun({ text: wilayahScope ? `Guru SMA / SMK / SLB — ${wilayahScope.nama}` : `Guru SMA / SMK / SLB Provinsi Nusa Tenggara Timur`,
            font:'Arial', size:20, bold:true })] }),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:200},
          children:[new TextRun({ text:`Tahun Pelajaran ${tahun-1}/${tahun}   |   Dicetak: ${tanggal}`,
            font:'Arial', size:18, italics:true, color:'888888' })] }),
        table,
        new Paragraph({ spacing:{before:240,after:60},
          children:[new TextRun({ text:'Keterangan:', font:'Arial', size:16, bold:true })] }),
        ...['• Guru Mapel: (Jam Mengajar × Jumlah Rombel) / 24',
            '• Guru BK: Jumlah Siswa / 150',
            '• Kurang = Kebutuhan > Total ASN (PNS+PPPK)',
            '• Lebih = Total ASN (PNS+PPPK) > Kebutuhan',
        ].map(t => new Paragraph({ spacing:{after:0},
          children:[new TextRun({ text:t, font:'Arial', size:16, color:'595959' })] })),
        new Paragraph({ spacing:{before:400} }),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:0},
          children:[new TextRun({ text:'Kepala Dinas Pendidikan dan Kebudayaan', font:'Arial', size:18 })] }),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:0},
          children:[new TextRun({ text:`Kupang, ${tanggal}`, font:'Arial', size:18 })] }),
        new Paragraph({ spacing:{after:0}, children:[new TextRun('')] }),
        new Paragraph({ spacing:{after:0}, children:[new TextRun('')] }),
        new Paragraph({ spacing:{after:0}, children:[new TextRun('')] }),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:0},
          children:[new TextRun({ text:'........................................', font:'Arial', size:18, bold:true })] }),
        new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:0},
          children:[new TextRun({ text:'NIP. .......................................', font:'Arial', size:18 })] }),
      ]
    }]
  })

  const buf = await Packer.toBuffer(doc)
  const namaFile = wilayahScope
    ? `ANJAB_ABK_${wilayahScope.nama.replace(/\s+/g, '_')}_${tahun}.docx`
    : `ANJAB_ABK_NTT_${tahun}.docx`
  return new NextResponse(new Uint8Array(buf), {
    headers:{
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${namaFile}"`,
    }
  })
}