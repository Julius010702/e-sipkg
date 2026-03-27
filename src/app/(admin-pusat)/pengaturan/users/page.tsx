"use client";
// src/app/(admin-pusat)/pengaturan/users/page.tsx
//
// PERUBAHAN UTAMA:
// - SekolahPicker (kompleks, butuh Dapodik) DIHAPUS
// - Diganti dengan input teks "Nama Sekolah" + select "Jenis Sekolah"
// - Saat submit, sekolah otomatis dibuat/dicari di DB via /api/sekolah/upsert-by-name
// - Admin tinggal ketik nama sekolah → simpan → bagikan email & password ke operator sekolah

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  id: string;
  nama: string;
  email: string;
  role: "ADMIN_PUSAT" | "ADMIN_SEKOLAH";
  status: "AKTIF" | "NONAKTIF";
  sekolahId?: string;
  sekolah?: { id: string; nama: string; jenisSekolah: string };
  createdAt: string;
}

const emptyForm = {
  nama: "",
  email: "",
  password: "",
  role: "ADMIN_SEKOLAH" as "ADMIN_PUSAT" | "ADMIN_SEKOLAH",
  status: "AKTIF" as "AKTIF" | "NONAKTIF",
  // Field sekolah baru (input teks)
  namaSekolah: "",
  jenisSekolah: "SMA" as "SMA" | "SMK" | "SLB",
  kabupatenKota: "",
};

function useIsMobile(bp = 768) {
  const [val, setVal] = useState(false);
  useEffect(() => {
    const fn = () => setVal(window.innerWidth < bp);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return val;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const isMobile = useIsMobile(768);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterRole) params.set("role", filterRole);
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/users?${params}`);
      const json = await res.json();
      setData(json.data || []);
    } catch {
      showToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }, [search, filterRole, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openAdd() {
    setEditItem(null);
    setForm(emptyForm);
    setShowPassword(false);
    setShowForm(true);
  }

  function openEdit(item: User) {
    setEditItem(item);
    setForm({
      nama: item.nama,
      email: item.email,
      password: "",
      role: item.role,
      status: item.status,
      namaSekolah: item.sekolah?.nama || "",
      jenisSekolah: (item.sekolah?.jenisSekolah as "SMA" | "SMK" | "SLB") || "SMA",
      kabupatenKota: "",
    });
    setShowPassword(false);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditItem(null);
    setForm(emptyForm);
  }

  function setF(key: keyof typeof emptyForm, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  // Auto-isi email dari nama sekolah
  function handleNamaSekolahChange(val: string) {
    setF("namaSekolah", val);
    // Hanya auto-isi jika email belum diketik
    if (!editItem) {
      const slug = val
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 30);
      setForm((p) => ({
        ...p,
        namaSekolah: val,
        nama: p.nama || val,
        email: p.email || (slug ? `admin.${slug}@nttprov.go.id` : ""),
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nama.trim() || !form.email.trim()) {
      showToast("Nama dan email wajib diisi", "error");
      return;
    }
    if (!editItem && !form.password.trim()) {
      showToast("Password wajib diisi untuk user baru", "error");
      return;
    }
    if (form.role === "ADMIN_SEKOLAH" && !form.namaSekolah.trim()) {
      showToast("Nama sekolah wajib diisi untuk Admin Sekolah", "error");
      return;
    }

    setSaving(true);
    try {
      let sekolahId: string | null = null;

      // Jika Admin Sekolah → pastikan sekolah ada di DB
      if (form.role === "ADMIN_SEKOLAH") {
        const resSekolah = await fetch("/api/sekolah/upsert-by-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: form.namaSekolah.trim(),
            jenisSekolah: form.jenisSekolah,
            kabupatenKota: form.kabupatenKota.trim() || null,
          }),
        });

        if (!resSekolah.ok) {
          const err = await resSekolah.json();
          throw new Error(err.error || "Gagal menyimpan data sekolah");
        }

        const { data: sekolahData, isNew } = await resSekolah.json();
        sekolahId = sekolahData.id;

        if (isNew) {
          showToast(`Sekolah "${sekolahData.nama}" otomatis terdaftar di sistem`, "success");
        }
      }

      // Simpan user
      const method = editItem ? "PUT" : "POST";
      const url = editItem ? `/api/users/${editItem.id}` : "/api/users";
      const body: any = {
        nama: form.nama,
        email: form.email,
        role: form.role,
        status: form.status,
        sekolahId: form.role === "ADMIN_SEKOLAH" ? sekolahId : null,
      };
      if (!editItem) body.password = form.password;
      else if (form.password) body.password = form.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan user");
      }

      showToast(
        editItem ? "User berhasil diperbarui" : "User berhasil ditambahkan",
        "success"
      );
      closeForm();
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: User) {
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus");
      }
      showToast("User berhasil dihapus", "success");
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setDeleteConfirm(null);
    }
  }

  async function toggleStatus(user: User) {
    try {
      const newStatus = user.status === "AKTIF" ? "NONAKTIF" : "AKTIF";
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      showToast(
        `User ${newStatus === "AKTIF" ? "diaktifkan" : "dinonaktifkan"}`,
        "success"
      );
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ marginBottom: isMobile ? 20 : 28 }}>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Pengaturan
        </div>
        <h1
          style={{
            fontSize: isMobile ? 20 : 24,
            fontWeight: 800,
            color: "white",
            margin: 0,
          }}
        >
          Manajemen User
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            marginTop: 4,
            marginBottom: 0,
          }}
        >
          Kelola akun admin pusat dan admin sekolah
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <div
          style={{ position: "relative", flex: "1 1 180px", minWidth: 160 }}
        >
          <svg
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.3)",
            }}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            style={{
              width: "100%",
              paddingLeft: 38,
              paddingRight: 14,
              paddingTop: 10,
              paddingBottom: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "white",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        {!isMobile && (
          <>
            <FilterSelect
              value={filterRole}
              onChange={setFilterRole}
              options={[
                { value: "", label: "Semua Role" },
                { value: "ADMIN_PUSAT", label: "Admin Pusat" },
                { value: "ADMIN_SEKOLAH", label: "Admin Sekolah" },
              ]}
            />
            <FilterSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: "", label: "Semua Status" },
                { value: "AKTIF", label: "Aktif" },
                { value: "NONAKTIF", label: "Nonaktif" },
              ]}
            />
          </>
        )}
        <button
          onClick={openAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            background: "linear-gradient(135deg,#3b82f6,#2563eb)",
            border: "none",
            borderRadius: 8,
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah User
        </button>
      </div>

      {isMobile && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 14,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          <FilterSelect
            value={filterRole}
            onChange={setFilterRole}
            options={[
              { value: "", label: "Semua Role" },
              { value: "ADMIN_PUSAT", label: "Admin Pusat" },
              { value: "ADMIN_SEKOLAH", label: "Admin Sekolah" },
            ]}
          />
          <FilterSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: "", label: "Semua Status" },
              { value: "AKTIF", label: "Aktif" },
              { value: "NONAKTIF", label: "Nonaktif" },
            ]}
          />
        </div>
      )}

      {/* Tabel */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          overflow: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 700,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                "No",
                "Nama",
                "Email",
                "Role",
                "Sekolah",
                "Status",
                "Dibuat",
                "Aksi",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "13px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    background: "rgba(255,255,255,0.02)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 13,
                  }}
                >
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 13,
                  }}
                >
                  Tidak ada user ditemukan
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background:
                            item.role === "ADMIN_PUSAT"
                              ? "linear-gradient(135deg,#3b82f680,#3b82f6)"
                              : "linear-gradient(135deg,#10b98180,#10b981)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 800,
                          color: "white",
                          flexShrink: 0,
                        }}
                      >
                        {item.nama.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ color: "white", fontWeight: 600 }}>
                        {item.nama}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 12,
                    }}
                  >
                    {item.email}
                  </td>
                  <td style={tdStyle}>
                    <Chip
                      label={
                        item.role === "ADMIN_PUSAT"
                          ? "Admin Pusat"
                          : "Admin Sekolah"
                      }
                      color={
                        item.role === "ADMIN_PUSAT" ? "#3b82f6" : "#10b981"
                      }
                    />
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.45)",
                      maxWidth: 160,
                    }}
                  >
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.sekolah?.nama ||
                        (item.role === "ADMIN_PUSAT" ? (
                          "—"
                        ) : (
                          <span style={{ color: "#ef4444" }}>
                            Belum ditentukan
                          </span>
                        ))}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => toggleStatus(item)}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 10px",
                        background:
                          item.status === "AKTIF"
                            ? "#22c55e18"
                            : "#ef444418",
                        color:
                          item.status === "AKTIF" ? "#22c55e" : "#ef4444",
                        border: `1px solid ${
                          item.status === "AKTIF"
                            ? "#22c55e30"
                            : "#ef444430"
                        }`,
                        borderRadius: 100,
                        cursor: "pointer",
                      }}
                    >
                      {item.status === "AKTIF" ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openEdit(item)}
                        style={rowBtnStyle("#3b82f6")}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item)}
                        style={rowBtnStyle("#ef4444")}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && (
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
            }}
          >
            {data.length} user ditemukan
          </div>
        )}
      </div>

      {/* ── Modal Tambah / Edit User ── */}
      {showForm && (
        <Modal
          onClose={closeForm}
          title={editItem ? "Edit User" : "Tambah User Baru"}
          maxWidth={580}
        >
          <form onSubmit={handleSubmit}>
            {/* Role & Status */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 14,
              }}
            >
              <Field label="Role" required>
                <div style={{ position: "relative" }}>
                  <select
                    value={form.role}
                    onChange={(e) => {
                      setF("role", e.target.value);
                    }}
                    style={selectStyle}
                    required
                  >
                    <option value="ADMIN_SEKOLAH">Admin Sekolah</option>
                    <option value="ADMIN_PUSAT">Admin Pusat</option>
                  </select>
                  <ChevronDown />
                </div>
              </Field>
              <Field label="Status">
                <div style={{ position: "relative" }}>
                  <select
                    value={form.status}
                    onChange={(e) => setF("status", e.target.value)}
                    style={selectStyle}
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Nonaktif</option>
                  </select>
                  <ChevronDown />
                </div>
              </Field>
            </div>

            {/* ── Sekolah: hanya tampil jika ADMIN_SEKOLAH ── */}
            {form.role === "ADMIN_SEKOLAH" && (
              <>
                {/* Info box */}
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.55)",
                    marginBottom: 14,
                    lineHeight: 1.6,
                  }}
                >
                  💡 Ketik nama sekolah di bawah. Jika sekolah belum ada di
                  sistem, akan otomatis terdaftar saat Anda klik{" "}
                  <strong style={{ color: "rgba(255,255,255,0.8)" }}>
                    Simpan
                  </strong>
                  .
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
                    gap: 14,
                  }}
                >
                  {/* Nama Sekolah */}
                  <Field label="Nama Sekolah" required>
                    <input
                      value={form.namaSekolah}
                      onChange={(e) =>
                        handleNamaSekolahChange(e.target.value)
                      }
                      placeholder="Contoh: SMAN 2 Kupang"
                      style={inputStyle}
                      required={form.role === "ADMIN_SEKOLAH"}
                    />
                  </Field>

                  {/* Jenis Sekolah */}
                  <Field label="Jenis Sekolah" required>
                    <div style={{ position: "relative" }}>
                      <select
                        value={form.jenisSekolah}
                        onChange={(e) => setF("jenisSekolah", e.target.value)}
                        style={selectStyle}
                        required
                      >
                        <option value="SMA">SMA</option>
                        <option value="SMK">SMK</option>
                        <option value="SLB">SLB</option>
                      </select>
                      <ChevronDown />
                    </div>
                  </Field>
                </div>

                {/* Kabupaten/Kota (opsional) */}
                <Field label="Kabupaten / Kota (opsional)">
                  <input
                    value={form.kabupatenKota}
                    onChange={(e) => setF("kabupatenKota", e.target.value)}
                    placeholder="Contoh: Kota Kupang"
                    style={inputStyle}
                  />
                </Field>
              </>
            )}

            {/* Nama & Email */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 14,
              }}
            >
              <Field label="Nama / Label Akun" required>
                <input
                  value={form.nama}
                  onChange={(e) => setF("nama", e.target.value)}
                  placeholder="Nama admin atau nama sekolah"
                  style={inputStyle}
                  required
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setF("email", e.target.value)}
                  placeholder="email@nttprov.go.id"
                  style={inputStyle}
                  required
                />
              </Field>
            </div>

            {/* Password */}
            <Field
              label={
                editItem
                  ? "Password Baru (kosongkan jika tidak diubah)"
                  : "Password"
              }
              required={!editItem}
            >
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setF("password", e.target.value)}
                  placeholder={
                    editItem
                      ? "Kosongkan jika tidak diubah"
                      : "Minimal 6 karakter"
                  }
                  style={{ ...inputStyle, paddingRight: 110 }}
                  required={!editItem}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  {showPassword ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </Field>

            <ModalActions
              onCancel={closeForm}
              saving={saving}
              label={editItem ? "Simpan Perubahan" : "Buat User"}
            />
          </form>
        </Modal>
      )}

      {/* ── Modal Konfirmasi Hapus ── */}
      {deleteConfirm && (
        <Modal
          onClose={() => setDeleteConfirm(null)}
          title="Konfirmasi Hapus User"
        >
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              ⚠️
            </div>
            <div>
              <p
                style={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                  margin: "0 0 6px",
                }}
              >
                {deleteConfirm.nama}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  margin: 0,
                }}
              >
                {deleteConfirm.email}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  marginTop: 10,
                }}
              >
                Yakin ingin menghapus akun ini? Tindakan ini tidak dapat
                dibatalkan.
              </p>
            </div>
          </div>
          <div
            style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
          >
            <button
              onClick={() => setDeleteConfirm(null)}
              style={cancelBtnStyle}
            >
              Batal
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm)}
              style={{
                ...submitBtnStyle,
                background: "linear-gradient(135deg,#ef4444,#dc2626)",
              }}
            >
              Hapus User
            </button>
          </div>
        </Modal>
      )}

      <GlobalStyles />
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────
function Toast({
  toast,
}: {
  toast: { msg: string; type: "success" | "error" } | null;
}) {
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 16,
        left: 16,
        maxWidth: 380,
        margin: "0 auto",
        zIndex: 9999,
        padding: "12px 18px",
        background: ok ? "#0d2b1a" : "#2b0d0d",
        border: `1px solid ${ok ? "#22c55e" : "#ef4444"}`,
        borderRadius: 10,
        color: ok ? "#22c55e" : "#ef4444",
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "slideIn 0.2s ease",
      }}
    >
      {ok ? "✓" : "✕"} {toast.msg}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "10px 34px 10px 12px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          color: value ? "white" : "rgba(255,255,255,0.4)",
          fontSize: 13,
          outline: "none",
          cursor: "pointer",
          appearance: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "rgba(255,255,255,0.3)",
        }}
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        background: `${color}18`,
        color,
        borderRadius: 100,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function Modal({
  children,
  title,
  onClose,
  maxWidth = 480,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
  maxWidth?: number;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth,
          background: "#161b22",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          padding: 24,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          animation: "slideIn 0.2s ease",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "white" }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          color: "rgba(255,255,255,0.5)",
          marginBottom: 8,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function ModalActions({
  onCancel,
  saving,
  label,
}: {
  onCancel: () => void;
  saving?: boolean;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginTop: 22,
        justifyContent: "flex-end",
      }}
    >
      <button type="button" onClick={onCancel} style={cancelBtnStyle}>
        Batal
      </button>
      <button
        type="submit"
        disabled={saving}
        style={{ ...submitBtnStyle, opacity: saving ? 0.7 : 1 }}
      >
        {saving ? "Menyimpan..." : label}
      </button>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg
      style={{
        position: "absolute",
        right: 12,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        color: "rgba(255,255,255,0.3)",
      }}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)!important}
      input:focus,textarea:focus,select:focus{border-color:rgba(59,130,246,0.5)!important;outline:none}
      select option{background:#1c2330}
      ::-webkit-scrollbar{width:4px;height:4px}
      ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
      ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}
    `}</style>
  );
}

const tdStyle: React.CSSProperties = {
  padding: "13px 16px",
  color: "rgba(255,255,255,0.7)",
  fontSize: 13,
};
const rowBtnStyle = (c: string): React.CSSProperties => ({
  padding: "5px 12px",
  fontSize: 12,
  fontWeight: 600,
  background: `${c}15`,
  color: c,
  border: `1px solid ${c}30`,
  borderRadius: 6,
  cursor: "pointer",
});
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "white",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};
const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none" as const,
  cursor: "pointer",
};
const cancelBtnStyle: React.CSSProperties = {
  padding: "9px 18px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "rgba(255,255,255,0.6)",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
const submitBtnStyle: React.CSSProperties = {
  padding: "9px 20px",
  background: "linear-gradient(135deg,#3b82f6,#2563eb)",
  border: "none",
  borderRadius: 8,
  color: "white",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};