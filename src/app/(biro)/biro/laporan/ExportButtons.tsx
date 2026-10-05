'use client'

import { useState } from 'react'

interface AnjabRow {
  nama: string
  jenisSekolah: string
  wilayah: string
  kebutuhanGuru: number
  pns: number
  pppk: number
  totalASN: number
  kurang: number | null
  lebih: number | null
}

interface ExportButtonsProps {
  data: AnjabRow[]
  totalKebutuhan: number
  totalPNS: number
  totalPPPK: number
  tanggal: string
}

export default function ExportButtons({ data, totalKebutuhan, totalPNS, totalPPPK, tanggal }: ExportButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const totalASN    = totalPNS + totalPPPK
  const totalKurang = totalASN < totalKebutuhan ? totalKebutuhan - totalASN : 0
  const totalLebih  = totalASN > totalKebutuhan ? totalASN - totalKebutuhan : 0

  // ============================================================
  // EXPORT EXCEL
  // ============================================================
  async function exportExcel() {
    setLoading('excel')
    try {
      const XLSX = await import('xlsx')

      const rows = data.map((s, i) => [
        i + 1,
        s.nama,
        s.jenisSekolah,
        s.wilayah,
        s.kebutuhanGuru,
        s.pns,
        s.pppk,
        s.totalASN,
        s.kurang ?? '',
        s.lebih ?? '',
      ])

      const totalRow = [
        'TOTAL KESELURUHAN', '', '', '',
        totalKebutuhan,
        totalPNS,
        totalPPPK,
        totalASN,
        totalKurang || '',
        totalLebih || '',
      ]

      const wsData = [
        ['PEMERINTAH PROVINSI NUSA TENGGARA TIMUR'],
        ['BIRO ORGANISASI'],
        ['Bagian Kelembagaan dan Analisis Jabatan'],
        [],
        ['REKAPITULASI ANALISIS JABATAN DAN ANALISIS BEBAN KERJA (ANJAB & ABK)'],
        ['Guru SMA / SMK / SLB Provinsi Nusa Tenggara Timur'],
        ['Tahun Pelajaran 2024/2025 | Dicetak: ' + tanggal],
        [],
        ['No', 'Nama Sekolah', 'Jenis Sekolah', 'Kabupaten/Kota', 'Kebutuhan Guru', 'Bezeting ASN', '', 'Total ASN', 'Kebutuhan', ''],
        ['', '', '', '', '', 'PNS', 'PPPK', '', 'Kurang', 'Lebih'],
        ...rows,
        totalRow,
      ]

      const ws = XLSX.utils.aoa_to_sheet(wsData)

      ws['!cols'] = [
        { wch: 5 }, { wch: 35 }, { wch: 8 }, { wch: 20 },
        { wch: 14 }, { wch: 8 }, { wch: 8 }, { wch: 10 },
        { wch: 8 }, { wch: 8 },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'ANJAB & ABK')
      XLSX.writeFile(wb, `Laporan_ANJAB_ABK_${new Date().getFullYear()}.xlsx`)
    } catch (e) {
      console.error(e)
      alert('Gagal export Excel')
    } finally {
      setLoading(null)
    }
  }

  // ============================================================
  // EXPORT PDF
  // ============================================================
  async function exportPDF() {
    setLoading('pdf')
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      type CellHookData = import('jspdf-autotable').CellHookData

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      // Header instansi
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('PEMERINTAH PROVINSI NUSA TENGGARA TIMUR', 148, 12, { align: 'center' })
      doc.setFontSize(10)
      doc.text('BIRO ORGANISASI', 148, 18, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.text('Bagian Kelembagaan dan Analisis Jabatan', 148, 23, { align: 'center' })

      // Garis pemisah
      doc.setLineWidth(0.5)
      doc.line(14, 26, 283, 26)

      // Judul laporan
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('REKAPITULASI ANALISIS JABATAN DAN ANALISIS BEBAN KERJA (ANJAB & ABK)', 148, 32, { align: 'center' })
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Guru SMA / SMK / SLB Provinsi Nusa Tenggara Timur', 148, 38, { align: 'center' })
      doc.text('Tahun Pelajaran 2024/2025 | Dicetak: ' + tanggal, 148, 43, { align: 'center' })

      const tableData = data.map((s, i) => [
        i + 1,
        s.nama,
        s.jenisSekolah,
        s.wilayah,
        s.kebutuhanGuru,
        s.pns,
        s.pppk,
        s.totalASN,
        s.kurang ?? '',
        s.lebih ?? '',
      ])

      tableData.push([
        'TOTAL', '', '', '',
        totalKebutuhan,
        totalPNS,
        totalPPPK,
        totalASN,
        totalKurang || '',
        totalLebih || '',
      ])

      autoTable(doc, {
        startY: 48,
        head: [
          ['No', 'Nama Sekolah', 'Jenis', 'Kabupaten/Kota', 'Kebutuhan Guru', 'PNS', 'PPPK', 'Total ASN', 'Kurang', 'Lebih'],
        ],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold', halign: 'center' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 8 },
          1: { cellWidth: 55 },
          2: { halign: 'center', cellWidth: 12 },
          3: { cellWidth: 35 },
          4: { halign: 'center', cellWidth: 20 },
          5: { halign: 'center', cellWidth: 14 },
          6: { halign: 'center', cellWidth: 14 },
          7: { halign: 'center', cellWidth: 18 },
          8: { halign: 'center', cellWidth: 14 },
          9: { halign: 'center', cellWidth: 14 },
        },
        didParseCell: (data: CellHookData) => {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fillColor = [220, 220, 220]
            data.cell.styles.fontStyle = 'bold'
          }
        },
      })

      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 180
      doc.setFontSize(9)
      doc.text('Keterangan:', 14, finalY + 10)
      doc.text('• Kurang: Kebutuhan > Total ASN (PNS+PPPK)', 14, finalY + 15)
      doc.text('• Lebih: Total ASN (PNS+PPPK) > Kebutuhan', 14, finalY + 20)

      doc.text('Kupang, ' + tanggal, 230, finalY + 10)
      doc.setFont('helvetica', 'bold')
      doc.text('Kepala Biro Organisasi', 230, finalY + 15)
      doc.setFont('helvetica', 'normal')
      doc.text('Provinsi Nusa Tenggara Timur', 230, finalY + 20)
      doc.text('........................................', 230, finalY + 40)
      doc.text('NIP. ...................................', 230, finalY + 45)

      doc.save(`Laporan_ANJAB_ABK_${new Date().getFullYear()}.pdf`)
    } catch (e) {
      console.error(e)
      alert('Gagal export PDF')
    } finally {
      setLoading(null)
    }
  }

  // ============================================================
  // EXPORT WORD — versi kop surat resmi (logo + warna navy)
  // ============================================================
  async function exportWord() {
    setLoading('word')
    try {
      const {
        Document, Packer, Paragraph, Table, TableRow, TableCell,
        TextRun, AlignmentType, WidthType, BorderStyle, ShadingType,
        VerticalAlign, ImageRun, PageOrientation,
      } = await import('docx')
      const fileSaverModule = await import('file-saver')
      const saveAs =
        (fileSaverModule as any).saveAs ||
        (fileSaverModule as any).default?.saveAs ||
        (fileSaverModule as any).default

      // Ambil logo dari /public/logo-ntt.png untuk disisipkan ke kop surat
      let logoBuffer: ArrayBuffer | null = null
      try {
        const logoResp = await fetch('/logo-ntt.png')
        if (logoResp.ok) logoBuffer = await logoResp.arrayBuffer()
      } catch {
        // kalau logo gagal diambil, dokumen tetap dibuat tanpa logo
      }

      const NAVY   = '1F3864'
      const NAVY_L = 'D6E4F0'
      const BORDER_COLOR = '9DB4CE'

      const border  = { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR }
      const borders = { top: border, bottom: border, left: border, right: border }
      const hdrBorder  = { style: BorderStyle.SINGLE, size: 6, color: NAVY }
      const hdrBorders = { top: hdrBorder, bottom: hdrBorder, left: hdrBorder, right: hdrBorder }

      const colW = [500, 3400, 900, 2400, 1500, 1000, 1000, 1200, 1100, 1100]

      const cell = (
        text: string | number,
        w: number,
        opts: { align?: any; bold?: boolean; color?: string; fill?: string } = {}
      ) => new TableCell({
        borders,
        width: { size: w, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: opts.align ?? AlignmentType.CENTER,
          children: [new TextRun({
            text: String(text ?? ''), size: 16,
            bold: !!opts.bold, color: opts.color ?? '1A1A1A',
          })],
        })],
      })

      const hdrCell = (text: string, w: number, rowSpan?: number, colSpan?: number) => new TableCell({
        borders: hdrBorders,
        width: { size: w, type: WidthType.DXA },
        margins: { top: 70, bottom: 70, left: 100, right: 100 },
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        ...(rowSpan ? { rowSpan } : {}),
        ...(colSpan ? { columnSpan: colSpan } : {}),
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, size: 16, bold: true, color: 'FFFFFF' })],
        })],
      })

      const headerRow1 = new TableRow({ tableHeader: true, children: [
        hdrCell('No', colW[0], 2),
        hdrCell('Nama Sekolah', colW[1], 2),
        hdrCell('Jenis', colW[2], 2),
        hdrCell('Kabupaten/Kota', colW[3], 2),
        hdrCell('Kebutuhan\nGuru', colW[4], 2),
        hdrCell('Bezeting ASN', colW[5] + colW[6], undefined, 2),
        hdrCell('Total ASN', colW[7], 2),
        hdrCell('Kebutuhan', colW[8] + colW[9], undefined, 2),
      ]})
      const headerRow2 = new TableRow({ tableHeader: true, children: [
        hdrCell('PNS', colW[5]), hdrCell('PPPK', colW[6]),
        hdrCell('Kurang', colW[8]), hdrCell('Lebih', colW[9]),
      ]})

      const dataRows = data.map((s, i) => {
        const bg = i % 2 === 0 ? 'FFFFFF' : 'EEF2F8'
        return new TableRow({ children: [
          cell(i + 1,            colW[0], { fill: bg }),
          cell(s.nama,           colW[1], { align: AlignmentType.LEFT, fill: bg }),
          cell(s.jenisSekolah,   colW[2], { fill: bg }),
          cell(s.wilayah,        colW[3], { align: AlignmentType.LEFT, fill: bg }),
          cell(s.kebutuhanGuru,  colW[4], { bold: true, fill: bg }),
          cell(s.pns,            colW[5], { fill: bg }),
          cell(s.pppk,           colW[6], { fill: bg }),
          cell(s.totalASN,       colW[7], { bold: true, fill: bg }),
          cell(s.kurang ?? '',   colW[8], { bold: !!s.kurang, color: s.kurang ? 'CC0000' : '1A1A1A', fill: bg }),
          cell(s.lebih ?? '',    colW[9], { bold: !!s.lebih,  color: s.lebih  ? '1E7E34' : '1A1A1A', fill: bg }),
        ]})
      })

      const totalRow = new TableRow({ children: [
        new TableCell({
          borders: hdrBorders, columnSpan: 4,
          width: { size: colW[0] + colW[1] + colW[2] + colW[3], type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          shading: { fill: NAVY_L, type: ShadingType.CLEAR },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'TOTAL KESELURUHAN', bold: true, size: 17, color: NAVY })],
          })],
        }),
        cell(totalKebutuhan, colW[4], { bold: true, fill: NAVY_L, color: NAVY }),
        cell(totalPNS,       colW[5], { bold: true, fill: NAVY_L, color: NAVY }),
        cell(totalPPPK,      colW[6], { bold: true, fill: NAVY_L, color: NAVY }),
        cell(totalASN,       colW[7], { bold: true, fill: NAVY_L, color: NAVY }),
        cell(totalKurang || '', colW[8], { bold: true, fill: NAVY_L, color: 'CC0000' }),
        cell(totalLebih  || '', colW[9], { bold: true, fill: NAVY_L, color: '1E7E34' }),
      ]})

      const table = new Table({
        width: { size: colW.reduce((a, b) => a + b, 0), type: WidthType.DXA },
        columnWidths: colW,
        rows: [headerRow1, headerRow2, ...dataRows, totalRow],
      })

      const tahun = new Date().getFullYear()

      const doc = new Document({
        sections: [{
          properties: { page: {
            size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE },
            margin: { top: 850, right: 850, bottom: 850, left: 850 },
          }},
          children: [
            ...(logoBuffer ? [new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 60 },
              children: [new ImageRun({
                data: logoBuffer,
                transformation: { width: 70, height: 70 },
                type: 'png',
              } as any)],
            })] : []),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
              children: [new TextRun({ text: 'PEMERINTAH PROVINSI NUSA TENGGARA TIMUR', size: 20, bold: true, color: NAVY })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
              children: [new TextRun({ text: 'BIRO ORGANISASI', size: 28, bold: true, color: NAVY })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
              children: [new TextRun({ text: 'Bagian Kelembagaan dan Analisis Jabatan', size: 18, color: '595959' })] }),
            new Paragraph({
              alignment: AlignmentType.CENTER, spacing: { after: 40 },
              border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: NAVY } },
              children: [new TextRun({
                text: 'Jl. El Tari No. 52, Kota Kupang, NTT  |  Telp. (0380) 821710  |  biroorganisasi@nttprov.go.id',
                size: 16, color: '888888',
              })],
            }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160, after: 40 },
              children: [new TextRun({
                text: 'REKAPITULASI ANALISIS JABATAN DAN ANALISIS BEBAN KERJA (ANJAB & ABK)',
                size: 22, bold: true, underline: {},
              })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
              children: [new TextRun({ text: 'Guru SMA / SMK / SLB Provinsi Nusa Tenggara Timur', size: 20, bold: true })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
              children: [new TextRun({ text: `Tahun Pelajaran 2024/2025 | Dicetak: ${tanggal}`, size: 18, italics: true, color: '888888' })] }),

            table,

            new Paragraph({ spacing: { before: 240, after: 60 },
              children: [new TextRun({ text: 'Keterangan:', size: 16, bold: true })] }),
            new Paragraph({ spacing: { after: 0 },
              children: [new TextRun({ text: '• Kurang: Kebutuhan > Total ASN (PNS+PPPK)', size: 16, color: '595959' })] }),
            new Paragraph({ spacing: { after: 0 },
              children: [new TextRun({ text: '• Lebih: Total ASN (PNS+PPPK) > Kebutuhan', size: 16, color: '595959' })] }),

            new Paragraph({ spacing: { before: 400 } }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
              children: [new TextRun({ text: 'Kepala Biro Organisasi', size: 18 })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
              children: [new TextRun({ text: `Kupang, ${tanggal}`, size: 18 })] }),
            new Paragraph({ spacing: { after: 0 }, children: [new TextRun('')] }),
            new Paragraph({ spacing: { after: 0 }, children: [new TextRun('')] }),
            new Paragraph({ spacing: { after: 0 }, children: [new TextRun('')] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
              children: [new TextRun({ text: '........................................', size: 18, bold: true })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
              children: [new TextRun({ text: 'NIP. .......................................', size: 18 })] }),
          ],
        }],
      })

      const buffer = await Packer.toBlob(doc)
      saveAs(buffer, `Laporan_ANJAB_ABK_${tahun}.docx`)
    } catch (e) {
      console.error(e)
      alert('Gagal export Word')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Excel */}
      <button
        onClick={exportExcel}
        disabled={loading !== null}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === 'excel' ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17l2-3 2 3H8zm0-6l2 3 2-3H8z"/>
          </svg>
        )}
        Export Excel
      </button>

      {/* PDF */}
      <button
        onClick={exportPDF}
        disabled={loading !== null}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === 'pdf' ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM13 3.5L18.5 9H13V3.5zM9 13h1v3H9v-3zm2-1h1v4h-1v-4zm2 2h1v2h-1v-2z"/>
          </svg>
        )}
        Export PDF
      </button>

      {/* Word */}
      <button
        onClick={exportWord}
        disabled={loading !== null}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === 'word' ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM13 3.5L18.5 9H13V3.5zM7 15l1.5-5 1.5 3 1.5-3 1.5 5h-1l-1-3.2-1 3.2H7z"/>
          </svg>
        )}
        Export Word
      </button>
    </div>
  )
}
