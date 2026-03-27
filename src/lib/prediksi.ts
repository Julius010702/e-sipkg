// src/lib/prediksi.ts
// Algoritma prediksi kebutuhan guru menggunakan Linear Regression

// ==========================================
// TYPES
// ==========================================

export interface DataHistoris {
  tahunAjaran: string;   // "2020/2021"
  kebutuhanGuru: number;
  guruTersedia?: number;
}

export interface PrediksiPoint {
  tahun: string;
  prediksi: number;
  batasAtas?: number;    // confidence interval atas
  batasBawah?: number;   // confidence interval bawah
  isHistoris: boolean;
  aktual?: number;
  tersedia?: number;
}

export interface HasilPrediksi {
  points: PrediksiPoint[];
  slope: number;         // koefisien kenaikan per tahun
  intercept: number;
  rSquared: number;      // koefisien determinasi (akurasi model)
  trenLabel: string;     // "Naik", "Turun", "Stabil"
  trenPersen: number;    // persentase kenaikan per tahun
  prediksi5Tahun: PrediksiPoint[];
}

// ==========================================
// UTILS
// ==========================================

/**
 * Parse tahun ajaran ke angka (ambil tahun pertama)
 * "2022/2023" → 2022
 */
function parseTahun(tahunAjaran: string): number {
  return parseInt(tahunAjaran.split("/")[0]) || 0;
}

/**
 * Buat label tahun ajaran dari angka
 * 2025 → "2025/2026"
 */
function makeTahunAjaran(tahun: number): string {
  return `${tahun}/${tahun + 1}`;
}

// ==========================================
// SIMPLE LINEAR REGRESSION
// ==========================================

interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  predict: (x: number) => number;
}

function linearRegression(xs: number[], ys: number[]): RegressionResult {
  const n = xs.length;
  if (n < 2) {
    return { slope: 0, intercept: ys[0] || 0, rSquared: 0, predict: () => ys[0] || 0 };
  }

  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;

  const ssXX = xs.reduce((s, x) => s + (x - xMean) ** 2, 0);
  const ssXY = xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0);
  const ssYY = ys.reduce((s, y) => s + (y - yMean) ** 2, 0);

  const slope     = ssXX !== 0 ? ssXY / ssXX : 0;
  const intercept = yMean - slope * xMean;
  const ssTot     = ssYY;
  const ssRes     = ys.reduce((s, y, i) => s + (y - (slope * xs[i] + intercept)) ** 2, 0);
  const rSquared  = ssTot !== 0 ? parseFloat((1 - ssRes / ssTot).toFixed(4)) : 1;

  return {
    slope,
    intercept,
    rSquared,
    predict: (x: number) => Math.max(0, slope * x + intercept),
  };
}

// ==========================================
// CONFIDENCE INTERVAL
// ==========================================

function hitungConfidenceInterval(
  ys: number[],
  yPred: number[],
  n: number,
  zScore = 1.96 // 95% CI
): number {
  const residuals = ys.map((y, i) => (y - yPred[i]) ** 2);
  const mse       = residuals.reduce((s, r) => s + r, 0) / Math.max(n - 2, 1);
  const se        = Math.sqrt(mse);
  return zScore * se;
}

// ==========================================
// MAIN FUNCTION
// ==========================================

/**
 * Generate prediksi kebutuhan guru untuk N tahun ke depan
 */
export function generatePrediksiGuru(
  historis: DataHistoris[],
  tahunKe = 5
): HasilPrediksi {
  if (!historis.length) {
    return {
      points: [], slope: 0, intercept: 0, rSquared: 0,
      trenLabel: "Stabil", trenPersen: 0, prediksi5Tahun: [],
    };
  }

  // Sort by tahun
  const sorted = [...historis].sort(
    (a, b) => parseTahun(a.tahunAjaran) - parseTahun(b.tahunAjaran)
  );

  const firstYear = parseTahun(sorted[0].tahunAjaran);
  const xs = sorted.map((d) => parseTahun(d.tahunAjaran) - firstYear);
  const ys = sorted.map((d) => d.kebutuhanGuru);

  const reg    = linearRegression(xs, ys);
  const yPred  = xs.map((x) => reg.predict(x));
  const ci     = sorted.length >= 3
    ? hitungConfidenceInterval(ys, yPred, sorted.length)
    : 0;

  // Data historis sebagai points
  const historisPoints: PrediksiPoint[] = sorted.map((d, i) => ({
    tahun:       d.tahunAjaran,
    aktual:      d.kebutuhanGuru,
    prediksi:    parseFloat(reg.predict(xs[i]).toFixed(1)),
    tersedia:    d.guruTersedia,
    isHistoris:  true,
  }));

  // Prediksi ke depan
  const lastYear = parseTahun(sorted[sorted.length - 1].tahunAjaran);
  const prediksiPoints: PrediksiPoint[] = Array.from({ length: tahunKe }, (_, i) => {
    const futureYear  = lastYear + i + 1;
    const futureX     = futureYear - firstYear;
    const predNilai   = reg.predict(futureX);
    return {
      tahun:       makeTahunAjaran(futureYear),
      prediksi:    parseFloat(predNilai.toFixed(1)),
      batasAtas:   parseFloat((predNilai + ci).toFixed(1)),
      batasBawah:  parseFloat(Math.max(0, predNilai - ci).toFixed(1)),
      isHistoris:  false,
    };
  });

  // Tren
  const baseValue      = reg.predict(0);
  const trenPersen     = baseValue > 0
    ? parseFloat(((reg.slope / baseValue) * 100).toFixed(1))
    : 0;
  const trenLabel      = reg.slope > 0.5 ? "Naik" : reg.slope < -0.5 ? "Turun" : "Stabil";

  return {
    points:         [...historisPoints, ...prediksiPoints],
    slope:          parseFloat(reg.slope.toFixed(3)),
    intercept:      parseFloat(reg.intercept.toFixed(3)),
    rSquared:       reg.rSquared,
    trenLabel,
    trenPersen,
    prediksi5Tahun: prediksiPoints,
  };
}

// ==========================================
// MOVING AVERAGE (alternatif prediksi)
// ==========================================

/**
 * Hitung moving average N periode
 */
export function movingAverage(data: number[], period = 3): number[] {
  return data.map((_, i) => {
    if (i < period - 1) return data[i];
    const slice = data.slice(i - period + 1, i + 1);
    return parseFloat((slice.reduce((s, v) => s + v, 0) / period).toFixed(2));
  });
}

// ==========================================
// GROWTH RATE
// ==========================================

/**
 * Hitung rata-rata pertumbuhan (CAGR)
 */
export function hitungCAGR(nilaiAwal: number, nilaiAkhir: number, tahun: number): number {
  if (nilaiAwal <= 0 || tahun <= 0) return 0;
  return parseFloat(((Math.pow(nilaiAkhir / nilaiAwal, 1 / tahun) - 1) * 100).toFixed(2));
}

// ==========================================
// INTERPRETASI
// ==========================================

export function interpretasiPrediksi(hasil: HasilPrediksi): string {
  const { trenLabel, trenPersen, rSquared, prediksi5Tahun } = hasil;

  if (!prediksi5Tahun.length) return "Data historis tidak cukup untuk prediksi.";

  const last = prediksi5Tahun[prediksi5Tahun.length - 1];
  const akurasi = rSquared >= 0.8 ? "tinggi" : rSquared >= 0.5 ? "sedang" : "rendah";

  return (
    `Berdasarkan tren data historis, kebutuhan guru cenderung ${trenLabel.toLowerCase()} ` +
    `sebesar ${Math.abs(trenPersen)}% per tahun. ` +
    `Prediksi 5 tahun ke depan menunjukkan kebutuhan sekitar ${last.prediksi} guru ` +
    `pada tahun ajaran ${last.tahun}. ` +
    `Akurasi model prediksi: ${akurasi} (R² = ${rSquared}).`
  );
}