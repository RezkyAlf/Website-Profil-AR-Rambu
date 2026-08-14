import { useEffect, useState } from 'react';
import { supabase, type ApkRelease, type MarkerRecord } from '@/lib/supabase';
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  CircleAlert,
  CircleHelp,
  Download,
  Eye,
  Menu,
  MoveRight,
  ScanLine,
  Smartphone,
  Sparkles,
  TriangleAlert,
  X,
  Zap,
} from 'lucide-react';
import { downloadAllMarkers } from '@/markerImages';

const categoryIcon = {
  Peringatan: TriangleAlert,
  Larangan: CircleAlert,
  Perintah: ArrowRight,
  Petunjuk: CircleHelp,
} as const;

const categoryTone: Record<string, string> = {
  Peringatan: 'yellow',
  Larangan: 'red',
  Perintah: 'blue',
  Petunjuk: 'cyan',
};

const steps = [
  { number: '01', title: 'Unduh aplikasi', text: 'Pasang AR Rambu Lalu Lintas di perangkat Android kamu.' },
  { number: '02', title: 'Pilih marker', text: 'Cetak atau buka marker rambu yang ingin kamu pelajari.' },
  { number: '03', title: 'Arahkan kamera', text: 'Pindai marker dan biarkan pengalaman AR muncul di depanmu.' },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerRecord | null>(null);
  const [activeApk, setActiveApk] = useState<ApkRelease | null>(null);
  const [markers, setMarkers] = useState<MarkerRecord[]>([]);

  useEffect(() => {
    supabase.from('apk_releases').select('*').eq('is_active', true).single()
      .then(({ data }) => setActiveApk(data));
    supabase.from('markers').select('*').order('created_at', { ascending: true })
      .then(({ data }) => setMarkers(data ?? []));
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const SelectedMarkerIcon = selectedMarker ? (categoryIcon[selectedMarker.category as keyof typeof categoryIcon] ?? CircleHelp) : null;

  useEffect(() => {
    if (selectedMarker) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [selectedMarker]);

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#beranda" aria-label="AR Rambu Lalu Lintas beranda" onClick={closeMenu}>
          <img src="/images/Judul.png" alt="AR Rambu Lalu Lintas" />
        </a>
        <button className="menu-toggle" type="button" aria-label="Buka navigasi" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navigasi utama">
          <a href="#tentang" onClick={closeMenu}>Tentang</a>
          <a href="#marker" onClick={closeMenu}>Koleksi Marker</a>
          <a href="#cara-kerja" onClick={closeMenu}>Cara Kerja</a>
          <a href="#unduh" onClick={closeMenu}>Unduh</a>
          <a className="nav-cta" href="#marker" onClick={closeMenu}>Mulai Belajar <ArrowRight size={16} /></a>
        </nav>
      </header>

      <main>
        <section className="hero section-frame" id="beranda">
          <div className="hero-grid" />
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Belajar jadi pengalaman nyata</div>
            <h1>Kenali rambu.<br /><span>Jelajahi dunia.</span></h1>
            <p className="hero-lead">Ubah cara belajar keselamatan lalu lintas dengan teknologi Augmented Reality yang seru, interaktif, dan mudah dipahami.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#unduh">Unduh Aplikasi <Download size={18} /></a>
              <button className="button button-ghost" type="button" onClick={() => {
                const items = markers.filter(m => m.image_path).map(m => ({ name: m.name, url: supabase.storage.from('markers').getPublicUrl(m.image_path!).data.publicUrl }));
                void downloadAllMarkers(items);
              }}><Download size={16} /> Unduh Semua Marker</button>
            </div>
            <div className="hero-proof"><div className="proof-avatars"><span>R</span><span>A</span><span>+</span></div><span>Media belajar interaktif untuk generasi aman berkendara</span></div>
          </div>
          <div className="hero-visual" aria-label="Ilustrasi smartphone dengan rambu lalu lintas Augmented Reality">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="signal signal-one"><ScanLine size={17} /><span>SCAN READY</span></div>
            <div className="signal signal-two"><Sparkles size={16} /><span>AR OBJECT</span></div>
            <div className="phone-wrap">
              <div className="phone-glow" />
              <div className="phone phone-landscape">
                <div className="phone-notch-landscape" />
                <div className="phone-screen phone-screen-landscape">
                  <div className="screen-side screen-side-left">
                    <span className="live-dot">LIVE</span>
                    <span className="side-label">AR Rambu</span>
                  </div>
                  <div className="screen-scene screen-scene-landscape">
                    <div className="scene-sky" />
                    <div className="scene-road" />
                    <div className="scene-marking" />
                    <div className="scene-sign"><span>↱</span></div>
                    <div className="scan-box"><i /><i /><i /><i /></div>
                    <span className="screen-label">Belok kanan</span>
                  </div>
                  <div className="screen-side screen-side-right">
                    <Camera size={14} />
                    <span className="screen-target">◎</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-sign sign-warning"><TriangleAlert size={23} /><span>Waspada</span></div>
            <div className="floating-sign sign-direction"><ArrowRight size={22} /><span>Ikuti arah</span></div>
            <div className="hero-road"><div className="road-line" /></div>
          </div>
          <a className="scroll-cue" href="#tentang"><span>Scroll untuk menjelajah</span><ArrowDown size={16} /></a>
        </section>

        <section className="trust-strip">
          <div className="trust-zebra" aria-hidden="true">{Array.from({length:12}).map((_,i)=><span key={i}/>)}</div>
          <div className="trust-label">Satu langkah kecil untuk<br /><strong>jalan yang lebih aman</strong></div>
          <div className="trust-items"><span><ScanLine size={19} /> Augmented reality</span><span><BookOpen size={19} /> Edukasi interaktif</span><span><Zap size={19} /> Belajar lebih cepat</span></div>
          <div className="trust-zebra" aria-hidden="true">{Array.from({length:12}).map((_,i)=><span key={i}/>)}</div>
        </section>

        <section className="about section-frame content-section" id="tentang">
          <div className="section-kicker">/ 01 — KENAPA AR RAMBU?</div>
          <div className="about-layout"><div className="section-heading"><h2>Belajar rambu tidak<br /><em>harus membosankan.</em></h2></div><div className="about-content"><p className="large-copy">AR Rambu Lalu Lintas menghadirkan pengalaman belajar yang membuat setiap simbol lebih mudah dipahami dan diingat.</p><p>Dengan kamera ponsel, rambu lalu lintas hadir dalam bentuk visual yang hidup. Lihat, dengarkan, dan pahami fungsi setiap rambu lewat cara belajar yang dekat dengan keseharian.</p><a className="text-link" href="#cara-kerja">Kenali pengalaman AR <MoveRight size={17} /></a></div></div>
          <div className="feature-row"><div className="feature-card"><span className="feature-index">01</span><div className="feature-icon blue-icon"><ScanLine size={25} /></div><h3>Kenali secara visual</h3><p>Simbol rambu terasa lebih nyata lewat objek 3D yang muncul dari marker.</p></div><div className="feature-card"><span className="feature-index">02</span><div className="feature-icon yellow-icon"><BookOpen size={25} /></div><h3>Pahami konteksnya</h3><p>Pelajari makna dan fungsi rambu dalam situasi jalan yang mudah dipahami.</p></div><div className="feature-card"><span className="feature-index">03</span><div className="feature-icon orange-icon"><Sparkles size={25} /></div><h3>Ingat lebih lama</h3><p>Pengalaman interaktif membantu pengetahuan keselamatan melekat lebih kuat.</p></div></div>
        </section>

        <section className="markers-section section-frame content-section" id="marker">
          <div className="marker-header"><div><div className="section-kicker">/ 02 — KOLEKSI MARKER</div><h2>Rambu dalam<br /><em>genggamanmu.</em></h2></div><p>Jelajahi koleksi marker dan temukan cerita di balik setiap rambu. Klik untuk preview.</p></div>
          <div className="marker-download-all-wrap">
            <button type="button" className="button button-primary marker-download-all" onClick={() => {
                const items = markers.filter(m => m.image_path).map(m => ({ name: m.name, url: supabase.storage.from('markers').getPublicUrl(m.image_path!).data.publicUrl }));
                void downloadAllMarkers(items);
              }}><Download size={18} /> Unduh Semua Marker <span className="marker-count-tag">{markers.length} file</span></button>
          </div>
          <div className="marker-grid">
            {markers.map((marker) => {
              const Icon = categoryIcon[marker.category as keyof typeof categoryIcon] ?? CircleHelp;
              const tone = categoryTone[marker.category] ?? 'cyan';
              const imgUrl = marker.image_path
                ? supabase.storage.from('markers').getPublicUrl(marker.image_path).data.publicUrl
                : null;
              return (
                <article className={`marker-card ${tone}`} key={marker.id} onClick={() => setSelectedMarker(marker)} style={{ cursor: 'pointer' }}>
                  <div className="marker-card-top">
                    <span className="category-badge"><Icon size={14} /> {marker.category}</span>
                  </div>
                  <div className="marker-preview">
                    <div className="marker-pole" />
                    {imgUrl
                      ? <img className="marker-thumb" src={imgUrl} alt={`Marker ${marker.name}`} />
                      : <div className="marker-thumb marker-thumb-empty" />}
                    <div className="marker-scan-line" />
                  </div>
                  <div className="marker-details">
                    <h3>{marker.name}</h3>
                    <div className="marker-actions-row">
                      <button type="button" className="marker-download marker-download-single"
                        onClick={e => { e.stopPropagation(); if (imgUrl) { const a = document.createElement('a'); a.href = imgUrl; a.download = `${marker.name}.jpg`; a.click(); } }}
                        aria-label={`Unduh marker ${marker.name}`}>
                        <Download size={14} /> Unduh
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="how-section section-frame content-section" id="cara-kerja">
          <div className="how-visual">
            <div className="how-grid" />
            <div className="how-road-bottom" aria-hidden="true"><div className="how-road-dash" /></div>
            <div className="how-sign-post" aria-hidden="true">
              <div className="how-sign-board how-sign-red"><CircleAlert size={16} /><span>STOP</span></div>
              <div className="how-sign-board how-sign-blue"><ArrowRight size={16} /><span>AR</span></div>
              <div className="how-sign-pole" />
            </div>
            <div className="how-circle"><Smartphone size={42} /><div className="circle-line" /></div>
            <div className="how-marker"><span>↱</span></div>
            <div className="how-scan"><ScanLine size={20} /> scanning marker...</div>
          </div>
          <div className="how-copy"><div className="section-kicker">/ 03 — CARA KERJA</div><h2>Semudah melihat<br /><em>ke arah yang tepat.</em></h2><p>Mulai pengalaman belajar rambu dalam tiga langkah sederhana. Tidak perlu alat tambahan, cukup smartphone dan rasa ingin tahu.</p><div className="steps-list">{steps.map((step) => <div className="step" key={step.number}><span className="step-number">{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></div>)}</div></div>
        </section>

        <section className="download-section section-frame" id="unduh">
          <div className="download-glow" />
          <div className="download-road-top" aria-hidden="true"><span>STOP</span><span>STOP</span><span>STOP</span></div>
          <div className="download-copy"><div className="eyebrow"><span className="eyebrow-dot" /> Versi terbaru tersedia</div><h2>Siap melihat<br /><em>rambu lebih dekat?</em></h2><p>Unduh aplikasi AR Rambu Lalu Lintas dan mulai perjalanan belajar yang lebih interaktif hari ini.</p><a className="button button-primary download-button" href={activeApk?.file_url ?? '#'} target="_blank" rel="noreferrer"><Download size={19} /> Download APK {activeApk && <span className="version-tag">v{activeApk.version}</span>}</a><div className="download-meta"><span><Check size={15} /> Gratis untuk belajar</span><span><Check size={15} /> Android 8.0+</span></div></div><div className="download-visual"><div className="download-road" /><div className="download-phone"><div className="phone-camera" /><img src="/images/Judul.png" alt="Logo AR Rambu Lalu Lintas" /></div><div className="download-badge"><Download size={17} /><span>APK<br /><strong>4.8 MB</strong></span></div></div></section>
      </main>

      <footer className="footer section-frame">
        <div className="footer-road-strip" aria-hidden="true"><div className="footer-road-line" /></div>
        <div className="footer-main"><a className="brand footer-brand" href="#beranda"><img src="/images/Judul.png" alt="AR Rambu Lalu Lintas" /></a><p>Belajar rambu. Memahami jalan.<br />Membangun kebiasaan aman.</p><div className="footer-links"><a href="#tentang">Tentang</a><a href="#marker">Marker</a><a href="#cara-kerja">Panduan</a><a href="#unduh">Unduh aplikasi</a></div></div><div className="footer-bottom"><span>© 2026 Muhamad Rezky Alfarizy</span><span>Dibuat untuk jalan yang lebih aman <span className="footer-road-mark">— — —</span></span></div></footer>

      {selectedMarker && (() => {
        const imgUrl = selectedMarker.image_path
          ? supabase.storage.from('markers').getPublicUrl(selectedMarker.image_path).data.publicUrl
          : null;
        return (
          <div className="fullscreen-preview" role="dialog" aria-modal="true" aria-labelledby="marker-preview-title" onClick={() => setSelectedMarker(null)}>
            <button className="fullscreen-close" type="button" onClick={() => setSelectedMarker(null)} aria-label="Tutup preview"><X size={24} /></button>
            <div className="fullscreen-content" onClick={(event) => event.stopPropagation()}>
              <div className="fullscreen-marker-wrap">
                {imgUrl
                  ? <img className="fullscreen-marker-img" src={imgUrl} alt={`Marker ${selectedMarker.name}`} />
                  : <div className="fullscreen-marker-img marker-thumb-empty" />}
              </div>
              <div className="fullscreen-marker-info">
                <span className="category-badge">{SelectedMarkerIcon && <SelectedMarkerIcon size={14} />} {selectedMarker.category}</span>
                <h2 id="marker-preview-title">{selectedMarker.name}</h2>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default App;
