// app/api/biro/laporan/export/excel/route.ts
// Requires: npm install exceljs
import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
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
  await logActivity(session.id, session.nama, 'Mengunduh laporan kebutuhan guru (Excel)')

  // Kalau diakses akun WILAYAH, laporan dibatasi hanya sekolah di
  // wilayah (kabupaten/kota) yang ditugaskan ke akun itu.
  const wilayahScope = session.role === 'WILAYAH'
    ? await prisma.wilayah.findUnique({ where: { id: session.wilayahId! } })
    : null

  // Baca logo sebagai base64 string — menghindari konflik tipe Buffer ExcelJS
  const logoPath   = path.join(process.cwd(), 'public', 'logo-ntt.png')
  const logoBase64 = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath).toString('base64')
    : null

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

  const totalKebutuhan = anjabData.reduce((s, r) => s + r.kebutuhanGuru, 0)
  const totalPNS       = anjabData.reduce((s, r) => s + r.pns, 0)
  const totalPPPK      = anjabData.reduce((s, r) => s + r.pppk, 0)
  const totalASN       = totalPNS + totalPPPK
  const totalKurang    = anjabData.reduce((s, r) => s + (r.kurang || 0), 0)
  const totalLebih     = anjabData.reduce((s, r) => s + (r.lebih || 0), 0)

  const now     = new Date()
  const tanggal = now.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
  const tahun   = now.getFullYear()

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Dinas Pendidikan Provinsi NTT'

  const ws = wb.addWorksheet('ANJAB & ABK', {
    pageSetup: { paperSize:9, orientation:'landscape', fitToPage:true, fitToWidth:1 }
  })

  ws.columns = [
    { key:'no',       width:5  }, { key:'nama',     width:35 },
    { key:'jenis',    width:8  }, { key:'wilayah',  width:22 },
    { key:'kebutuhan',width:12 }, { key:'pns',      width:10 },
    { key:'pppk',     width:10 }, { key:'totalasn', width:12 },
    { key:'kurang',   width:10 }, { key:'lebih',    width:10 },
  ]

  ws.getRow(1).height = 30
  ws.getRow(2).height = 30

  if (logoBase64) {
    const logoId = wb.addImage({ base64: logoBase64, extension: 'png' })
    ws.addImage(logoId, {
      tl: { col: 4.4, row: 0 },
      ext: { width: 60, height: 60 },
      editAs: 'oneCell',
    })
  }

  const kopLines = [
    { txt: 'PEMERINTAH PROVINSI NUSA TENGGARA TIMUR',
      font: { name:'Arial', bold:true, size:10, color:{argb:'FF1F3864'} }, h: 15 },
    { txt: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
      font: { name:'Arial', bold:true, size:14, color:{argb:'FF1F3864'} }, h: 22 },
    { txt: 'Biro Kepegawaian — Bidang Perencanaan dan Pemerataan Guru',
      font: { name:'Arial', size:9, color:{argb:'FF595959'} }, h: 14 },
    { txt: 'Jl. W.J. Lalamentik No. 1, Kupang  |  Telp. (0380) 831584  |  dikbud@nttprov.go.id',
      font: { name:'Arial', size:8, color:{argb:'FF888888'} }, h: 13 },
  ]
  kopLines.forEach(({ txt, font, h }, i) => {
    const rowNum = i + 3
    ws.mergeCells(rowNum, 1, rowNum, 10)
    const r = ws.getRow(rowNum)
    r.getCell(1).value     = txt
    r.getCell(1).alignment = { horizontal:'center', vertical:'middle' }
    r.getCell(1).font      = font
    r.height = h
  })
  ws.getRow(6).eachCell((c: ExcelJS.Cell) => {
    c.border = { bottom: { style:'medium', color:{argb:'FF1F3864'} } }
  })

  ws.mergeCells(7,1,7,10)
  ws.getCell('A7').value = 'REKAPITULASI ANALISIS JABATAN DAN ANALISIS BEBAN KERJA (ANJAB & ABK)'
  ws.getCell('A7').alignment = { horizontal:'center' }
  ws.getCell('A7').font = { name:'Arial', bold:true, size:12, underline:true }
  ws.getRow(7).height = 20

  ws.mergeCells(8,1,8,10)
  ws.getCell('A8').value = wilayahScope
    ? `Guru SMA / SMK / SLB — ${wilayahScope.nama}`
    : `Guru SMA / SMK / SLB Provinsi Nusa Tenggara Timur`
  ws.getCell('A8').alignment = { horizontal:'center' }
  ws.getCell('A8').font = { name:'Arial', bold:true, size:10 }

  ws.mergeCells(9,1,9,10)
  ws.getCell('A9').value = `Tahun Pelajaran ${tahun-1}/${tahun}   |   Dicetak: ${tanggal}`
  ws.getCell('A9').alignment = { horizontal:'center' }
  ws.getCell('A9').font = { name:'Arial', italic:true, size:9, color:{argb:'FF595959'} }

  const hdrFill   = { type:'pattern', pattern:'solid', fgColor:{argb:'FF1F3864'} } as ExcelJS.Fill
  const hdrFont   = { name:'Arial', bold:true, color:{argb:'FFFFFFFF'}, size:9 }
  const hdrBorder = {
    top:{ style:'thin' as const, color:{argb:'FFFFFFFF'} },
    bottom:{ style:'thin' as const, color:{argb:'FFFFFFFF'} },
    left:{ style:'thin' as const, color:{argb:'FFFFFFFF'} },
    right:{ style:'thin' as const, color:{argb:'FFFFFFFF'} },
  }
  const center = { horizontal:'center' as const, vertical:'middle' as const, wrapText:true }

  const row10 = ws.getRow(10); row10.height = 28
  ws.mergeCells('A10:A11'); ws.mergeCells('B10:B11'); ws.mergeCells('C10:C11')
  ws.mergeCells('D10:D11'); ws.mergeCells('E10:E11'); ws.mergeCells('H10:H11')
  ws.mergeCells('F10:G10'); ws.mergeCells('I10:J10')
  ;[['A10','No'],['B10','Nama Sekolah'],['C10','Jenis'],['D10','Kabupaten/Kota'],
    ['E10','Kebutuhan Guru'],['F10','Bezeting ASN'],['H10','Total ASN'],['I10','Kebutuhan']
  ].forEach(([addr,txt]) => { ws.getCell(addr).value = txt })
  row10.eachCell((c: ExcelJS.Cell) => { c.fill=hdrFill; c.font=hdrFont; c.border=hdrBorder; c.alignment=center })

  const row11 = ws.getRow(11); row11.height = 18
  ;[['F11','PNS'],['G11','PPPK'],['I11','Kurang'],['J11','Lebih']].forEach(([addr,txt]) => {
    ws.getCell(addr).value = txt
  })
  row11.eachCell((c: ExcelJS.Cell) => { c.fill=hdrFill; c.font=hdrFont; c.border=hdrBorder; c.alignment=center })

  const dataBorder = {
    top:{ style:'thin' as const, color:{argb:'FFCCCCCC'} },
    bottom:{ style:'thin' as const, color:{argb:'FFCCCCCC'} },
    left:{ style:'thin' as const, color:{argb:'FFCCCCCC'} },
    right:{ style:'thin' as const, color:{argb:'FFCCCCCC'} },
  }
  const dataFont = { name:'Arial', size:9 }

  anjabData.forEach((s, i) => {
    const rowNum = 12 + i
    const row    = ws.getRow(rowNum)
    row.height   = 18
    const rowData = [i+1, s.nama, s.jenisSekolah, s.wilayah,
      s.kebutuhanGuru, s.pns, s.pppk, s.totalASN, s.kurang??'', s.lebih??'']
    rowData.forEach((val, ci) => {
      const cell = row.getCell(ci+1)
      cell.value = val
      cell.font  = dataFont
      cell.border = dataBorder
      cell.alignment = ci < 2 || ci === 3
        ? { horizontal:'left', vertical:'middle' }
        : { horizontal:'center', vertical:'middle' }
      if (i % 2 !== 0) cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFF5F7FA'} } as ExcelJS.Fill
    })
    if (s.kurang) row.getCell(9).font = { ...dataFont, bold:true, color:{argb:'FFCC0000'} }
    if (s.lebih)  row.getCell(10).font = { ...dataFont, bold:true, color:{argb:'FF1E7E34'} }
  })

  const tr = ws.getRow(12 + anjabData.length); tr.height = 20
  const totalFill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFD6E4F0'} } as ExcelJS.Fill
  const totalBorder = {
    top:{ style:'medium' as const, color:{argb:'FF1F3864'} },
    bottom:{ style:'medium' as const, color:{argb:'FF1F3864'} },
    left:{ style:'thin' as const, color:{argb:'FF1F3864'} },
    right:{ style:'thin' as const, color:{argb:'FF1F3864'} },
  }
  ws.mergeCells(12+anjabData.length, 1, 12+anjabData.length, 4)
  tr.getCell(1).value = 'TOTAL KESELURUHAN'
  tr.getCell(1).alignment = { horizontal:'center', vertical:'middle' }
  ;[totalKebutuhan, totalPNS, totalPPPK, totalASN, totalKurang||'', totalLebih||''].forEach((v,i) => {
    const c = tr.getCell(5+i); c.value = v
    c.alignment = { horizontal:'center', vertical:'middle' }
  })
  tr.eachCell((c: ExcelJS.Cell) => {
    c.fill = totalFill
    c.font = { name:'Arial', bold:true, size:9, color:{argb:'FF1F3864'} }
    c.border = totalBorder
  })
  tr.getCell(9).font = { name:'Arial', bold:true, size:9, color:{argb:'FFCC0000'} }
  tr.getCell(10).font = { name:'Arial', bold:true, size:9, color:{argb:'FF1E7E34'} }

  let ketRow = 14 + anjabData.length
  ;['Keterangan:',
    '• Guru Mapel: (Jam Mengajar × Jumlah Rombel) / 24',
    '• Guru BK: Jumlah Siswa / 150',
    '• Kurang = Kebutuhan > Total ASN (PNS+PPPK)',
    '• Lebih = Total ASN (PNS+PPPK) > Kebutuhan',
  ].forEach((txt, i) => {
    const r = ws.getRow(ketRow+i)
    ws.mergeCells(ketRow+i, 1, ketRow+i, 10)
    r.getCell(1).value = txt
    r.getCell(1).font = { name:'Arial', size:8, bold:txt==='Keterangan:', color:{argb:'FF333333'} }
  })

  const buffer = await wb.xlsx.writeBuffer()
  const namaFile = wilayahScope
    ? `ANJAB_ABK_${wilayahScope.nama.replace(/\s+/g, '_')}_${tahun}.xlsx`
    : `ANJAB_ABK_NTT_${tahun}.xlsx`
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${namaFile}"`,
    }
  })
}