type Tone = 'red' | 'yellow' | 'blue' | 'cyan';

export type Marker = {
  name: string;
  slug: string;
  category: string;
  description: string;
  icon: string;
  tone: Tone;
  symbol: string;
};

export const markers: Marker[] = [
  {
    name: 'Dilarang Masuk',
    slug: 'dilarang-masuk',
    category: 'Larangan',
    description: 'Kenali rambu yang menandakan area tidak boleh dilalui kendaraan.',
    icon: 'CircleAlert',
    tone: 'red',
    symbol: '−',
  },
  {
    name: 'Hati-Hati',
    slug: 'hati-hati',
    category: 'Peringatan',
    description: 'Pelajari cara membaca rambu peringatan sebelum menghadapi situasi jalan.',
    icon: 'TriangleAlert',
    tone: 'yellow',
    symbol: '!',
  },
  {
    name: 'Belok Kanan',
    slug: 'belok-kanan',
    category: 'Perintah',
    description: 'Temukan arah yang wajib diikuti agar perjalanan tetap aman dan tertib.',
    icon: 'ArrowRight',
    tone: 'blue',
    symbol: '↱',
  },
  {
    name: 'Informasi Jalan',
    slug: 'informasi-jalan',
    category: 'Petunjuk',
    description: 'Dapatkan informasi penting untuk membantu navigasi di jalan raya.',
    icon: 'CircleHelp',
    tone: 'cyan',
    symbol: 'i',
  },
  {
    name: 'Batas Kecepatan',
    slug: 'batas-kecepatan',
    category: 'Larangan',
    description: 'Pahami batas aman berkendara dan dampaknya pada keselamatan lalu lintas.',
    icon: 'Gauge',
    tone: 'red',
    symbol: '40',
  },
  {
    name: 'Jalur Penyebrangan',
    slug: 'jalur-penyebrangan',
    category: 'Petunjuk',
    description: 'Kenali jalur prioritas untuk pejalan kaki di sekitar persimpangan.',
    icon: 'TrafficCone',
    tone: 'cyan',
    symbol: '≡',
  },
];

const toneColors: Record<Tone, { fill: string; border: string; text: string }> = {
  red: { fill: '#e04747', border: '#ffffff', text: '#ffffff' },
  yellow: { fill: '#ffd33d', border: '#172a3e', text: '#172a3e' },
  blue: { fill: '#1878e8', border: '#ffffff', text: '#ffffff' },
  cyan: { fill: '#56b8d1', border: '#ffffff', text: '#ffffff' },
};

function signMarkup(tone: Tone, symbol: string): string {
  const c = toneColors[tone];
  const cx = 200;
  const cy = 165;
  const r = 78;
  if (tone === 'red') {
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${c.fill}" stroke="${c.border}" stroke-width="10"/>
      <rect x="${cx - 55}" y="${cy - 6}" width="110" height="12" rx="6" fill="${c.border}" transform="rotate(45 ${cx} ${cy})"/>
      <text x="${cx}" y="${cy + 18}" font-family="Manrope, sans-serif" font-size="64" font-weight="800" fill="${c.text}" text-anchor="middle">${symbol}</text>`;
  }
  if (tone === 'yellow') {
    return `
      <rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="10" fill="${c.fill}" stroke="${c.border}" stroke-width="10" transform="rotate(45 ${cx} ${cy})"/>
      <text x="${cx}" y="${cy + 22}" font-family="Manrope, sans-serif" font-size="66" font-weight="800" fill="${c.text}" text-anchor="middle">${symbol}</text>`;
  }
  if (tone === 'blue') {
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${c.fill}" stroke="${c.border}" stroke-width="10"/>
      <text x="${cx}" y="${cy + 20}" font-family="Manrope, sans-serif" font-size="64" font-weight="800" fill="${c.text}" text-anchor="middle">${symbol}</text>`;
  }
  return `
    <rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="10" fill="${c.fill}" stroke="${c.border}" stroke-width="10"/>
    <text x="${cx}" y="${cy + 20}" font-family="Manrope, sans-serif" font-size="64" font-weight="800" fill="${c.text}" text-anchor="middle">${symbol}</text>`;
}

export function buildMarkerSvg(marker: Marker): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#ffffff"/>
  <rect x="14" y="14" width="372" height="372" rx="8" fill="none" stroke="#0b1727" stroke-width="10"/>
  <rect x="34" y="34" width="332" height="332" rx="4" fill="none" stroke="#0b1727" stroke-width="3" stroke-dasharray="10 10"/>
  ${signMarkup(marker.tone, marker.symbol)}
  <text x="200" y="300" font-family="DM Mono, monospace" font-size="22" font-weight="700" fill="#0b1727" text-anchor="middle">${marker.name.toUpperCase()}</text>
  <text x="200" y="330" font-family="DM Mono, monospace" font-size="15" fill="#536b82" text-anchor="middle">${marker.category.toUpperCase()}</text>
  <text x="200" y="372" font-family="DM Mono, monospace" font-size="12" fill="#7d9bb8" text-anchor="middle">AR MARKER • SCAN WITH APP</text>
</svg>`;
}

export function buildMarkerDataUrl(marker: Marker): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(buildMarkerSvg(marker))}`;
}

export function downloadMarker(marker: Marker): void {
  const svg = buildMarkerSvg(marker);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `marker-${marker.slug}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadAllMarkers(items: { name: string; url: string }[]): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  await Promise.all(items.map(async ({ name, url }) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const ext = url.split('.').pop()?.split('?')[0] ?? 'jpg';
    const safeName = name.replace(/[\/\\:*?"<>|]/g, '-');
    zip.file(`${safeName}.${ext}`, blob);
  }));
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ar-rambu-markers.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
