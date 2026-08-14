import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Download,
  Edit2,
  FileArchive,
  Image,
  Loader2,
  LogOut,
  Plus,
  Shield,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { supabase, type ApkRelease, type MarkerRecord } from '@/lib/supabase';

// ─── Auth ─────────────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onLogin();
    setLoading(false);
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-icon"><Shield size={28} /></div>
        <h1>Admin Panel</h1>
        <p>AR Rambu Lalu Lintas</p>
        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="admin-error"><AlertCircle size={14} /> {error}</div>}
          <button className="admin-btn admin-btn-primary" type="submit" disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type Toast = { id: number; message: string; type: 'success' | 'error' };

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  return { toasts, add };
}

// ─── APK Section ──────────────────────────────────────────────────────────────

function ApkSection({ toast }: { toast: (msg: string, type?: Toast['type']) => void }) {
  const [apks, setApks] = useState<ApkRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<ApkRelease | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [version, setVersion] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('');

  const fetchApks = async () => {
    setLoading(true);
    const { data } = await supabase.from('apk_releases').select('*').order('created_at', { ascending: false });
    setApks(data ?? []);
    setLoading(false);
  };

  useEffect(() => { void fetchApks(); }, []);

  const openAdd = () => { setEditItem(null); setVersion(''); setFileName(''); setFileUrl(''); setFileSize(''); setShowForm(true); };
  const openEdit = (apk: ApkRelease) => { setEditItem(apk); setVersion(apk.version); setFileName(apk.file_name); setFileUrl(apk.file_url); setFileSize(String(apk.file_size)); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); setVersion(''); setFileName(''); setFileUrl(''); setFileSize(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { version, file_name: fileName, file_url: fileUrl, file_size: Number(fileSize) || 0 };
      if (editItem) {
        const { error } = await supabase.from('apk_releases').update(payload).eq('id', editItem.id);
        if (error) throw error;
        toast('APK diperbarui');
      } else {
        const { error } = await supabase.from('apk_releases').insert({ ...payload, is_active: false });
        if (error) throw error;
        toast('APK berhasil ditambahkan');
      }
      closeForm();
      void fetchApks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      toast(msg, 'error');
      console.error('APK save error:', err);
    }
    setSaving(false);
  };

  const setActive = async (apk: ApkRelease) => {
    await supabase.from('apk_releases').update({ is_active: false }).neq('id', apk.id);
    await supabase.from('apk_releases').update({ is_active: true }).eq('id', apk.id);
    toast(`APK v${apk.version} dijadikan aktif`);
    void fetchApks();
  };

  const deleteApk = async (apk: ApkRelease) => {
    if (!confirm(`Hapus APK v${apk.version}?`)) return;
    await supabase.from('apk_releases').delete().eq('id', apk.id);
    toast('APK dihapus');
    void fetchApks();
  };

  const formatSize = (bytes: number) => !bytes ? '—' : bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div className="admin-section-title"><FileArchive size={20} /><h2>Rilis APK</h2></div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}><Plus size={15} /> Tambah APK</button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <div className="admin-form-head">
            <h3>{editItem ? 'Edit APK' : 'Tambah APK Baru'}</h3>
            <button className="admin-icon-btn" onClick={closeForm}><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid admin-form-grid-3">
              <div className="admin-field">
                <label>Versi <span>*</span></label>
                <input value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0.0" required />
              </div>
              <div className="admin-field">
                <label>Nama File <span>*</span></label>
                <input value={fileName} onChange={e => setFileName(e.target.value)} placeholder="ar-rambu.apk" required />
              </div>
              <div className="admin-field">
                <label>Ukuran File (bytes)</label>
                <input type="number" value={fileSize} onChange={e => setFileSize(e.target.value)} placeholder="94371840" />
              </div>
              <div className="admin-field admin-field-full">
                <label>URL Download <span>*</span></label>
                <input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://github.com/.../releases/download/v1.0.0/app.apk" required />
                <span className="admin-field-hint">Gunakan GitHub Releases, Google Drive, atau hosting lainnya</span>
              </div>
            </div>
            <div className="admin-form-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>Batal</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? <><Loader2 size={14} className="spin" /> Menyimpan...</> : <><Upload size={14} /> {editItem ? 'Simpan' : 'Tambah'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="admin-loading"><Loader2 size={22} className="spin" /></div>
      ) : apks.length === 0 ? (
        <div className="admin-empty"><FileArchive size={32} /><p>Belum ada APK yang ditambahkan</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Versi</th><th>File</th><th>Ukuran</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr></thead>
            <tbody>
              {apks.map(apk => (
                <tr key={apk.id}>
                  <td><span className="admin-version">v{apk.version}</span></td>
                  <td className="admin-filename">
                    <a href={apk.file_url} target="_blank" rel="noreferrer" className="admin-file-link">{apk.file_name}</a>
                  </td>
                  <td>{formatSize(apk.file_size)}</td>
                  <td>
                    {apk.is_active
                      ? <span className="admin-badge admin-badge-active"><CheckCircle size={11} /> Aktif</span>
                      : <span className="admin-badge admin-badge-inactive">Tidak Aktif</span>}
                  </td>
                  <td>{new Date(apk.created_at).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div className="admin-row-actions">
                      {!apk.is_active && <button className="admin-icon-btn admin-icon-btn-yellow" title="Jadikan aktif" onClick={() => setActive(apk)}><Star size={14} /></button>}
                      <button className="admin-icon-btn" title="Edit" onClick={() => openEdit(apk)}><Edit2 size={14} /></button>
                      <button className="admin-icon-btn admin-icon-btn-red" title="Hapus" onClick={() => deleteApk(apk)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Marker Section ───────────────────────────────────────────────────────────

const CATEGORIES = ['Peringatan', 'Larangan', 'Perintah', 'Petunjuk'] as const;

function MarkerSection({ toast }: { toast: (msg: string, type?: Toast['type']) => void }) {
  const [markers, setMarkers] = useState<MarkerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MarkerRecord | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMarkers = async () => {
    setLoading(true);
    const { data } = await supabase.from('markers').select('*').order('created_at', { ascending: false });
    setMarkers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { void fetchMarkers(); }, []);

  const openAdd = () => { setEditItem(null); setName(''); setCategory(CATEGORIES[0]); setImageFile(null); setShowForm(true); };
  const openEdit = (m: MarkerRecord) => { setEditItem(m); setName(m.name); setCategory(m.category); setImageFile(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); setName(''); setCategory(CATEGORIES[0]); setImageFile(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let image_path = editItem?.image_path ?? null;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `markers/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('markers').upload(path, imageFile, { upsert: true });
        if (upErr) throw upErr;
        image_path = path;
      }
      if (editItem) {
        const { error } = await supabase.from('markers').update({ name, category, image_path }).eq('id', editItem.id);
        if (error) throw error;
        toast('Marker diperbarui');
      } else {
        const { error } = await supabase.from('markers').insert({ name, category, image_path });
        if (error) throw error;
        toast('Marker berhasil ditambahkan');
      }
      closeForm();
      void fetchMarkers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      toast(msg, 'error');
    }
    setSaving(false);
  };

  const deleteMarker = async (m: MarkerRecord) => {
    if (!confirm(`Hapus marker "${m.name}"?`)) return;
    if (m.image_path) await supabase.storage.from('markers').remove([m.image_path]);
    await supabase.from('markers').delete().eq('id', m.id);
    toast('Marker dihapus');
    void fetchMarkers();
  };

  const getImageUrl = (path: string) =>
    supabase.storage.from('markers').getPublicUrl(path).data.publicUrl;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div className="admin-section-title"><Image size={20} /><h2>Koleksi Marker</h2></div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}><Plus size={15} /> Tambah Marker</button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <div className="admin-form-head">
            <h3>{editItem ? 'Edit Marker' : 'Tambah Marker Baru'}</h3>
            <button className="admin-icon-btn" onClick={closeForm}><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid admin-form-grid-3">
              <div className="admin-field">
                <label>Nama <span>*</span></label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Dilarang Masuk" required />
              </div>
              <div className="admin-field">
                <label>Kategori <span>*</span></label>
                <div className="admin-select-wrap">
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </div>
              <div className="admin-field admin-field-full">
                <label>Gambar {editItem?.image_path && <span className="admin-label-note">(kosongkan jika tidak ingin mengganti)</span>}</label>
                <input type="file" accept="image/*" ref={fileRef} onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
                {editItem?.image_path && !imageFile && (
                  <img className="admin-img-preview" src={getImageUrl(editItem.image_path)} alt="preview" />
                )}
              </div>
            </div>
            <div className="admin-form-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>Batal</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? <><Loader2 size={14} className="spin" /> Menyimpan...</> : <><Upload size={14} /> {editItem ? 'Simpan' : 'Tambah'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="admin-loading"><Loader2 size={22} className="spin" /></div>
      ) : markers.length === 0 ? (
        <div className="admin-empty"><Image size={32} /><p>Belum ada marker</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Gambar</th><th>Nama</th><th>Kategori</th><th>Tanggal</th><th>Aksi</th></tr></thead>
            <tbody>
              {markers.map(m => (
                <tr key={m.id}>
                  <td>
                    {m.image_path
                      ? <img className="admin-marker-thumb" src={getImageUrl(m.image_path)} alt={m.name} />
                      : <div className="admin-marker-symbol">—</div>}
                  </td>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.category}</td>
                  <td>{new Date(m.created_at).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="admin-icon-btn" title="Edit" onClick={() => openEdit(m)}><Edit2 size={14} /></button>
                      <button className="admin-icon-btn admin-icon-btn-red" title="Hapus" onClick={() => deleteMarker(m)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<'apk' | 'marker'>('apk');
  const { toasts, add: addToast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setAuthed(!!session));
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); };

  if (authed === null) return <div className="admin-splash"><Loader2 size={28} className="spin" /></div>;
  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-brand"><Shield size={18} /><span>Admin Panel</span></div>
        <div className="admin-topbar-right">
          <a href="/" className="admin-btn admin-btn-ghost admin-btn-sm"><Download size={14} /> Lihat Website</a>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={logout}><LogOut size={14} /> Keluar</button>
        </div>
      </header>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'apk' ? 'is-active' : ''}`} onClick={() => setTab('apk')}><FileArchive size={15} /> Rilis APK</button>
        <button className={`admin-tab ${tab === 'marker' ? 'is-active' : ''}`} onClick={() => setTab('marker')}><Image size={15} /> Marker</button>
      </div>

      <main className="admin-main">
        {tab === 'apk' && <ApkSection toast={addToast} />}
        {tab === 'marker' && <MarkerSection toast={addToast} />}
      </main>

      <div className="admin-toasts">
        {toasts.map(t => (
          <div key={t.id} className={`admin-toast admin-toast-${t.type}`}>
            {t.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
