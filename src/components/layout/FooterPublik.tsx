export default function FooterPublik() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-blue-950 text-white px-4 sm:px-6 py-3 sm:py-2.5 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center bg-white rounded px-2 py-0.5 h-7 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/berakhlak.png" alt="BerAKHLAK — Bangga Melayani Bangsa" className="h-full w-auto" />
          </span>
          <p className="text-[10px] sm:text-[11px] text-blue-400 text-center sm:text-left leading-relaxed">
          &copy; {year} Biro Organisasi — Bagian Kelembagaan dan Analisis Jabatan, Setda Provinsi Nusa Tenggara Timur.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] sm:text-xs text-blue-400">Sistem aktif</span>
        </div>
      </div>
    </footer>
  )
}