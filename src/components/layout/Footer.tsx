export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ borderTop: '0.5px solid' }} className="border-gray-200 bg-white px-8 py-2 mt-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-[11px] text-gray-400">
          © {year} Biro Organisasi — Bagian Kelembagaan dan Analisis Jabatan, Setda Provinsi Nusa Tenggara Timur. Hak cipta dilindungi.
        </p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-400">Sistem aktif</span>
        </div>
      </div>
    </footer>
  )
}