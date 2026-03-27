'use client';
// src/app/(admin-pusat)/dashboard/page.tsx

import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import Link from 'next/link';

interface DashboardData {
  totalGuru: number;
  guruPNS: number;
  guruPPPK: number;
  kebutuhanTotal: number;
  kekuranganTotal: number;
  kelebihanTotal: number;
  totalSekolah: number;
  totalSMA: number;
  totalSMK: number;
  totalSLB: number;
  rekapPerKabupaten: { nama: string; tersedia: number; kebutuhan: number; selisih: number }[];
}

function getTahunAjaran(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

// ─── Hook: responsive ─────────────────────────────────────────────────────────
function useIsMobile(bp = 640) {
  const [val, setVal] = useState(false);
  useEffect(() => {
    const fn = () => setVal(window.innerWidth < bp);
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return val;
}

// ─── Clock Widget ─────────────────────────────────────────────────────────────
function ClockWidget() {
  const [now, setNow] = useState(new Date());
  const isMobile = useIsMobile(640);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const HARI  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const ss = String(now.getSeconds()).padStart(2,'0');
  const tahunAjaran = getTahunAjaran(now);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const mingguKe = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

  return (
    <div style={{
      background: 'linear-gradient(135deg,#1e3a5f 0%,#0f2340 100%)',
      border: '1px solid rgba(59,130,246,0.3)',
      borderRadius: 16,
      padding: isMobile ? '14px 16px' : '16px 22px',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 8 : 20,
    }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
        <span style={{ fontSize: isMobile?28:36, fontWeight:900, color:'#60a5fa', letterSpacing:2, fontVariantNumeric:'tabular-nums' }}>{hh}</span>
        <span style={{ fontSize: isMobile?22:28, fontWeight:900, color:'#3b82f6', animation:'blink 1s step-end infinite' }}>:</span>
        <span style={{ fontSize: isMobile?28:36, fontWeight:900, color:'#60a5fa', letterSpacing:2, fontVariantNumeric:'tabular-nums' }}>{mm}</span>
        <span style={{ fontSize: isMobile?22:28, fontWeight:900, color:'#3b82f6', animation:'blink 1s step-end infinite' }}>:</span>
        <span style={{ fontSize: isMobile?20:28, fontWeight:700, color:'#93c5fd', letterSpacing:1, fontVariantNumeric:'tabular-nums' }}>{ss}</span>
      </div>
      {!isMobile && <div style={{ width:1, height:48, background:'rgba(59,130,246,0.25)', flexShrink:0 }} />}
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        <span style={{ fontSize: isMobile?12:14, fontWeight:700, color:'white' }}>
          {HARI[now.getDay()]}, {now.getDate()} {BULAN[now.getMonth()]} {now.getFullYear()}
        </span>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <Badge label={`Minggu ke-${mingguKe}`} color="#6366f1" />
          <Badge label={`TA ${tahunAjaran}`} color="#10b981" />
        </div>
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', background:`${color}22`, color, border:`1px solid ${color}44`, borderRadius:100, whiteSpace:'nowrap' }}>
      {label}
    </span>
  );
}

function StatCard({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{
      background:'white', borderRadius:16, padding:'14px 16px',
      boxShadow:'0 1px 3px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9',
      display:'flex', alignItems:'flex-start', gap:12,
    }}>
      <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, background:`${color}1a`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div style={{ minWidth:0 }}>
        <p style={{ fontSize:11, color:'#64748b', fontWeight:600, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label}</p>
        <p style={{ fontSize:20, fontWeight:900, color:'#0f172a', margin:0 }}>{value}</p>
        {sub && <p style={{ fontSize:11, color:'#94a3b8', margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub}</p>}
      </div>
    </div>
  );
}

function QuickMenu({ href, label, icon, color }: { href: string; label: string; icon: React.ReactNode; color: string }) {
  return (
    <Link href={href} style={{
      display:'flex', flexDirection:'column', alignItems:'center', gap:8,
      padding:12, borderRadius:16, border:'1px solid #f1f5f9',
      background:'white', textDecoration:'none', transition:'all 0.2s',
    }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
    >
      <div style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:`${color}15` }}>
        <span style={{ color, fontSize:18 }}>{icon}</span>
      </div>
      <span style={{ fontSize:11, fontWeight:600, color:'#475569', textAlign:'center', lineHeight:1.3 }}>{label}</span>
    </Link>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:'white', border:'1px solid #f1f5f9', boxShadow:'0 8px 24px rgba(0,0,0,0.1)', borderRadius:12, padding:'10px 14px', fontSize:12 }}>
        <p style={{ fontWeight:700, color:'#334155', marginBottom:4 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color:p.color, margin:'2px 0' }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardAdminPusatPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile(640);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {
        setData({
          totalGuru:4280, guruPNS:2615, guruPPPK:1665,
          kebutuhanTotal:5100, kekuranganTotal:820, kelebihanTotal:0,
          totalSekolah:312, totalSMA:148, totalSMK:124, totalSLB:40,
          rekapPerKabupaten:[
            { nama:'Kupang',       tersedia:680, kebutuhan:790, selisih:-110 },
            { nama:'TTS',          tersedia:420, kebutuhan:510, selisih:-90  },
            { nama:'TTU',          tersedia:310, kebutuhan:360, selisih:-50  },
            { nama:'Belu',         tersedia:290, kebutuhan:340, selisih:-50  },
            { nama:'Flores Timur', tersedia:380, kebutuhan:410, selisih:-30  },
            { nama:'Sikka',        tersedia:360, kebutuhan:380, selisih:-20  },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:240 }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
          <div style={{ width:32, height:32, border:'2px solid #3b82f6', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          <p style={{ fontSize:13, color:'#94a3b8' }}>Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const pieStatusGuru  = [{ name:'PNS', value:data.guruPNS }, { name:'PPPK', value:data.guruPPPK }];
  const pieKebutuhan   = [{ name:'Tersedia', value:data.totalGuru }, { name:'Kekurangan', value:data.kekuranganTotal }];
  const pieSekolah     = [{ name:'SMA', value:data.totalSMA }, { name:'SMK', value:data.totalSMK }, { name:'SLB', value:data.totalSLB }];
  const COLORS_STATUS  = ['#3b82f6','#10b981'];
  const COLORS_KEBUTUHAN = ['#6366f1','#f59e0b'];
  const COLORS_SEKOLAH = ['#3b82f6','#f59e0b','#10b981'];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, paddingBottom:8 }}>

      {/* ── Page title + clock ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <div>
          <h1 style={{ fontSize: isMobile?17:20, fontWeight:900, color:'#0f172a', margin:0 }}>Dashboard Admin Pusat</h1>
          <p style={{ fontSize:12, color:'#64748b', margin:'3px 0 0' }}>Rekap seluruh sekolah SMA/SMK/SLB — Provinsi NTT</p>
        </div>
        <ClockWidget />
      </div>

      {/* ── Stat Cards — 2 col mobile, 4 col desktop ── */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr 1fr':'repeat(4,1fr)', gap:12 }}>
        <StatCard label="Total Guru" value={data.totalGuru.toLocaleString('id')} sub={`PNS: ${data.guruPNS.toLocaleString('id')} | PPPK: ${data.guruPPPK.toLocaleString('id')}`} color="#3b82f6"
          icon={<svg style={{width:20,height:20}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard label="Total Kebutuhan" value={data.kebutuhanTotal.toLocaleString('id')} sub="Estimasi kebutuhan guru" color="#6366f1"
          icon={<svg style={{width:20,height:20}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        />
        <StatCard label="Kekurangan" value={data.kekuranganTotal.toLocaleString('id')} sub="Perlu penambahan guru" color="#ef4444"
          icon={<svg style={{width:20,height:20}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <StatCard label="Total Sekolah" value={data.totalSekolah} sub={`SMA: ${data.totalSMA} | SMK: ${data.totalSMK} | SLB: ${data.totalSLB}`} color="#10b981"
          icon={<svg style={{width:20,height:20}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
      </div>

      {/* ── Charts — always 3 col, compact on mobile ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: isMobile?8:12 }}>
        {/* Status Kepegawaian */}
        <div style={{ background:'white', borderRadius:12, padding: isMobile?'10px 8px':'12px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9', minWidth:0 }}>
          <h3 style={{ fontSize: isMobile?10:12, fontWeight:700, color:'#1e293b', margin:'0 0 6px', lineHeight:1.3 }}>Status Kepegawaian</h3>
          <ResponsiveContainer width="100%" height={isMobile?90:130}>
            <PieChart>
              <Pie data={pieStatusGuru} cx="50%" cy="50%" innerRadius={isMobile?20:30} outerRadius={isMobile?36:50} paddingAngle={3} dataKey="value">
                {pieStatusGuru.map((_,i) => <Cell key={i} fill={COLORS_STATUS[i]} />)}
              </Pie>
              <Tooltip formatter={(v:number) => v.toLocaleString('id')} />
              {!isMobile && <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize:11 }} />}
            </PieChart>
          </ResponsiveContainer>
          {/* Mobile: inline legend */}
          {isMobile && (
            <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:4, flexWrap:'wrap' }}>
              {pieStatusGuru.map((d,i) => (
                <div key={d.name} style={{ display:'flex', alignItems:'center', gap:3 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:COLORS_STATUS[i], flexShrink:0 }} />
                  <span style={{ fontSize:9, color:'#64748b', fontWeight:600 }}>{d.name}</span>
                </div>
              ))}
            </div>
          )}
          {!isMobile && (
            <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:2 }}>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:13, fontWeight:900, color:'#3b82f6', margin:0 }}>{((data.guruPNS/data.totalGuru)*100).toFixed(1)}%</p>
                <p style={{ fontSize:10, color:'#94a3b8', margin:0 }}>PNS</p>
              </div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:13, fontWeight:900, color:'#10b981', margin:0 }}>{((data.guruPPPK/data.totalGuru)*100).toFixed(1)}%</p>
                <p style={{ fontSize:10, color:'#94a3b8', margin:0 }}>PPPK</p>
              </div>
            </div>
          )}
        </div>

        {/* Kebutuhan vs Tersedia */}
        <div style={{ background:'white', borderRadius:12, padding: isMobile?'10px 8px':'12px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9', minWidth:0 }}>
          <h3 style={{ fontSize: isMobile?10:12, fontWeight:700, color:'#1e293b', margin:'0 0 6px', lineHeight:1.3 }}>Kebutuhan vs Tersedia</h3>
          <ResponsiveContainer width="100%" height={isMobile?90:130}>
            <PieChart>
              <Pie data={pieKebutuhan} cx="50%" cy="50%" innerRadius={isMobile?20:30} outerRadius={isMobile?36:50} paddingAngle={3} dataKey="value">
                {pieKebutuhan.map((_,i) => <Cell key={i} fill={COLORS_KEBUTUHAN[i]} />)}
              </Pie>
              <Tooltip formatter={(v:number) => v.toLocaleString('id')} />
              {!isMobile && <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize:11 }} />}
            </PieChart>
          </ResponsiveContainer>
          {isMobile && (
            <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:4, flexWrap:'wrap' }}>
              {pieKebutuhan.map((d,i) => (
                <div key={d.name} style={{ display:'flex', alignItems:'center', gap:3 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:COLORS_KEBUTUHAN[i], flexShrink:0 }} />
                  <span style={{ fontSize:9, color:'#64748b', fontWeight:600 }}>{d.name}</span>
                </div>
              ))}
            </div>
          )}
          {!isMobile && (
            <div style={{ marginTop:6, padding:'5px 10px', borderRadius:8, textAlign:'center', background:'#fef3c7' }}>
              <p style={{ fontSize:11, color:'#b45309', fontWeight:600, margin:0 }}>
                Kekurangan <strong>{((data.kekuranganTotal/data.kebutuhanTotal)*100).toFixed(1)}%</strong> dari total kebutuhan
              </p>
            </div>
          )}
        </div>

        {/* Distribusi Jenis Sekolah */}
        <div style={{ background:'white', borderRadius:12, padding: isMobile?'10px 8px':'12px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9', minWidth:0 }}>
          <h3 style={{ fontSize: isMobile?10:12, fontWeight:700, color:'#1e293b', margin:'0 0 6px', lineHeight:1.3 }}>Distribusi Sekolah</h3>
          <ResponsiveContainer width="100%" height={isMobile?90:130}>
            <PieChart>
              <Pie data={pieSekolah} cx="50%" cy="50%" innerRadius={isMobile?20:30} outerRadius={isMobile?36:50} paddingAngle={3} dataKey="value">
                {pieSekolah.map((_,i) => <Cell key={i} fill={COLORS_SEKOLAH[i]} />)}
              </Pie>
              <Tooltip />
              {!isMobile && <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize:11 }} />}
            </PieChart>
          </ResponsiveContainer>
          {isMobile && (
            <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:4, flexWrap:'wrap' }}>
              {pieSekolah.map((d,i) => (
                <div key={d.name} style={{ display:'flex', alignItems:'center', gap:3 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:COLORS_SEKOLAH[i], flexShrink:0 }} />
                  <span style={{ fontSize:9, color:'#64748b', fontWeight:600 }}>{d.name}</span>
                </div>
              ))}
            </div>
          )}
          {!isMobile && (
            <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:2, fontSize:11, color:'#64748b' }}>
              <span>SMA: {data.totalSMA}</span><span>SMK: {data.totalSMK}</span><span>SLB: {data.totalSLB}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Bar Chart ── */}
      <div style={{ background:'white', borderRadius:16, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:'#1e293b', margin:0 }}>Rekap per Kabupaten/Kota</h3>
          <Link href="/perhitungan-final" style={{ fontSize:12, fontWeight:700, color:'#3b82f6', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
            Lihat semua
            <svg style={{width:12,height:12}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        <div style={{ overflowX:'auto' }}>
          <div style={{ minWidth:380 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.rekapPerKabupaten} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="nama" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="tersedia"  name="Tersedia"  fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="kebutuhan" name="Kebutuhan" fill="#e2e8f0" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Quick Menu — 3 col mobile, 6 col desktop ── */}
      <div style={{ background:'white', borderRadius:16, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9' }}>
        <h3 style={{ fontSize:13, fontWeight:700, color:'#1e293b', margin:'0 0 12px' }}>Menu Cepat</h3>
        <div style={{ display:'grid', gridTemplateColumns: isMobile?'repeat(3,1fr)':'repeat(6,1fr)', gap:8 }}>
          <QuickMenu href="/master-data/type-unit-kerja" label="Type Unit Kerja" color="#3b82f6"
            icon={<svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
          />
          <QuickMenu href="/master-data/opd" label="Data OPD" color="#6366f1"
            icon={<svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>}
          />
          <QuickMenu href="/master-data/unit-organisasi" label="Unit Org." color="#8b5cf6"
            icon={<svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
          />
          <QuickMenu href="/anjab-abk" label="ANJAB & ABK" color="#f59e0b"
            icon={<svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <QuickMenu href="/perhitungan-final" label="Hitung Final" color="#10b981"
            icon={<svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
          <QuickMenu href="/pengaturan/users" label="Users" color="#ef4444"
            icon={<svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          />
        </div>
      </div>

      {/* ── Tabel Rekap ── */}
      <div style={{ background:'white', borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid #f1f5f9' }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:'#1e293b', margin:0 }}>Status Kekurangan Guru per Kabupaten/Kota</h3>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:480 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['No','Kabupaten/Kota','Tersedia','Kebutuhan','Selisih','Status'].map((h) => (
                  <th key={h} style={{ padding:'11px 14px', textAlign: h==='Tersedia'||h==='Kebutuhan'||h==='Selisih'?'right' : h==='Status'?'center':'left', fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rekapPerKabupaten.map((row, i) => (
                <tr key={row.nama} style={{ borderTop:'1px solid #f8fafc' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background='#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background='transparent')}
                >
                  <td style={{ padding:'11px 14px', fontSize:12, color:'#94a3b8' }}>{i+1}</td>
                  <td style={{ padding:'11px 14px', fontWeight:600, color:'#1e293b', fontSize:13 }}>{row.nama}</td>
                  <td style={{ padding:'11px 14px', textAlign:'right', color:'#475569', fontSize:13 }}>{row.tersedia.toLocaleString('id')}</td>
                  <td style={{ padding:'11px 14px', textAlign:'right', color:'#475569', fontSize:13 }}>{row.kebutuhan.toLocaleString('id')}</td>
                  <td style={{ padding:'11px 14px', textAlign:'right', fontWeight:700, fontSize:13, color: row.selisih<0?'#ef4444':'#10b981' }}>
                    {row.selisih>0?'+':''}{row.selisih}
                  </td>
                  <td style={{ padding:'11px 14px', textAlign:'center' }}>
                    <span style={{ padding:'3px 10px', borderRadius:100, fontSize:11, fontWeight:700,
                      ...(row.selisih<0 ? { background:'#fef2f2', color:'#ef4444' } : row.selisih>0 ? { background:'#f0fdf4', color:'#10b981' } : { background:'#f0f9ff', color:'#3b82f6' })
                    }}>
                      {row.selisih<0?'KURANG':row.selisih>0?'LEBIH':'SESUAI'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}