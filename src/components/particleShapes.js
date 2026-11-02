// ============================================================
//  PARÇACIK ŞEKİLLERİ
//  Her fonksiyon N parçacık için Float32Array(N*3) konum üretir.
//  Sahne, kaydırdıkça bu şekiller arasında GPU'da dönüşüm yapar:
//  el (SignaTurk) → sinir ağı → olasılık yüzeyi → küre
// ============================================================

// Tekrarlanabilir rastgelelik: her yüklemede aynı şekil oluşur
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Box-Muller ile normal dağılım
function gauss(rand) {
  const u = Math.max(rand(), 1e-6)
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/* ---------- 1) EL: MediaPipe / RTMW 21 noktalı el iskeleti ---------- */
// Açık avuç, biraz yana dönük; birim: sahne birimi (~3.2 yükseklik)
const HAND = [
  [0.0, -1.65, 0.0], // 0 bilek
  [-0.48, -1.28, 0.12], [-0.9, -0.9, 0.2], [-1.2, -0.5, 0.24], [-1.42, -0.14, 0.26], // başparmak
  [-0.46, -0.18, 0.06], [-0.58, 0.42, 0.04], [-0.64, 0.82, 0.02], [-0.68, 1.18, 0.0], // işaret
  [-0.06, -0.08, 0.0], [-0.07, 0.6, -0.02], [-0.08, 1.06, -0.04], [-0.09, 1.46, -0.06], // orta
  [0.34, -0.16, -0.04], [0.42, 0.42, -0.06], [0.47, 0.82, -0.08], [0.51, 1.16, -0.1], // yüzük
  [0.68, -0.38, -0.08], [0.84, 0.02, -0.1], [0.95, 0.32, -0.12], [1.04, 0.62, -0.14], // serçe
]
const HAND_BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
]

export function handShape(n, seed = 1) {
  const r = mulberry32(seed)
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const k = r()
    let x, y, z
    if (k < 0.16) {
      // Eklem noktaları: yoğun, parlak kümeler
      const j = HAND[Math.floor(r() * HAND.length)]
      const s = 0.035
      x = j[0] + gauss(r) * s
      y = j[1] + gauss(r) * s
      z = j[2] + gauss(r) * s
    } else if (k < 0.74) {
      // Kemikler: eklemleri birleştiren ince çizgiler
      const [a, b] = HAND_BONES[Math.floor(r() * HAND_BONES.length)]
      const t = r()
      const A = HAND[a]
      const B = HAND[b]
      const s = 0.012
      x = A[0] + (B[0] - A[0]) * t + gauss(r) * s
      y = A[1] + (B[1] - A[1]) * t + gauss(r) * s
      z = A[2] + (B[2] - A[2]) * t + gauss(r) * s
    } else if (k < 0.9) {
      // Avuç içi: bilek ve parmak köklerinin arasında seyrek dolgu
      const p = [0, 1, 5, 9, 13, 17]
      const A = HAND[p[Math.floor(r() * p.length)]]
      const B = HAND[p[Math.floor(r() * p.length)]]
      const t = r()
      x = A[0] + (B[0] - A[0]) * t + gauss(r) * 0.05
      y = A[1] + (B[1] - A[1]) * t + gauss(r) * 0.05
      z = A[2] + (B[2] - A[2]) * t + gauss(r) * 0.08
    } else {
      // Hâle: elin etrafında yüzen toz
      const [a, b] = HAND_BONES[Math.floor(r() * HAND_BONES.length)]
      const t = r()
      const A = HAND[a]
      const B = HAND[b]
      const s = 0.32
      x = A[0] + (B[0] - A[0]) * t + gauss(r) * s
      y = A[1] + (B[1] - A[1]) * t + gauss(r) * s
      z = A[2] + (B[2] - A[2]) * t + gauss(r) * s
    }
    out[i * 3] = x
    out[i * 3 + 1] = y + 0.05
    out[i * 3 + 2] = z
  }
  return out
}

/* ---------- 2) SİNİR AĞI: halka şeklinde dizilmiş katmanlar ---------- */
export function networkShape(n, seed = 2) {
  const r = mulberry32(seed)
  const layers = [5, 8, 8, 6, 3]
  const span = 4.6
  const nodes = layers.map((count, li) => {
    const x = -span / 2 + (span * li) / (layers.length - 1)
    const radius = count === 3 ? 0.55 : 0.6 + count * 0.12
    return Array.from({ length: count }, (_, ni) => {
      const a = (ni / count) * Math.PI * 2 + li * 0.4
      return [x, Math.cos(a) * radius, Math.sin(a) * radius]
    })
  })
  const edges = []
  for (let l = 0; l < nodes.length - 1; l++) {
    for (const a of nodes[l]) for (const b of nodes[l + 1]) edges.push([a, b])
  }
  const flat = nodes.flat()
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const k = r()
    let p
    if (k < 0.3) {
      const c = flat[Math.floor(r() * flat.length)]
      const s = 0.06
      p = [c[0] + gauss(r) * s, c[1] + gauss(r) * s, c[2] + gauss(r) * s]
    } else if (k < 0.92) {
      const [a, b] = edges[Math.floor(r() * edges.length)]
      const t = r()
      const s = 0.008
      p = [
        a[0] + (b[0] - a[0]) * t + gauss(r) * s,
        a[1] + (b[1] - a[1]) * t + gauss(r) * s,
        a[2] + (b[2] - a[2]) * t + gauss(r) * s,
      ]
    } else {
      p = [gauss(r) * 2.2, gauss(r) * 1.2, gauss(r) * 1.2]
    }
    out.set(p, i * 3)
  }
  return out
}

/* ---------- 3) OLASILIK YÜZEYİ: tel kafes "likelihood" manzarası ---------- */
// Value Bet Analyzer'daki olasılık modellerine gönderme
export function surfaceShape(n, seed = 3) {
  const r = mulberry32(seed)
  const size = 6.2
  const lines = 34
  const peaks = [
    [-0.9, -0.5, 1.35, 0.75],
    [1.3, 0.7, 0.85, 0.6],
    [0.2, 1.5, 0.5, 0.45],
  ]
  const height = (x, z) => {
    let h = 0
    for (const [px, pz, amp, s] of peaks) {
      h += amp * Math.exp(-((x - px) ** 2 + (z - pz) ** 2) / (2 * s * s))
    }
    return h - 0.55
  }
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const along = (r() - 0.5) * size
    const line = (Math.floor(r() * lines) / (lines - 1) - 0.5) * size
    const [x, z] = r() < 0.5 ? [along, line] : [line, along]
    const y = height(x, z) + gauss(r) * 0.006
    out[i * 3] = x
    out[i * 3 + 1] = y
    out[i * 3 + 2] = z
  }
  return out
}

/* ---------- 4) KÜRE + YÖRÜNGE HALKASI: eski hero'ya selam ---------- */
export function sphereShape(n, seed = 4) {
  const r = mulberry32(seed)
  const out = new Float32Array(n * 3)
  const shell = Math.floor(n * 0.78)
  const golden = Math.PI * (3 - Math.sqrt(5))
  const R = 1.55
  for (let i = 0; i < n; i++) {
    let x, y, z
    if (i < shell) {
      // Fibonacci küresi: eşit aralıklı noktalar
      const yy = 1 - (i / (shell - 1)) * 2
      const rad = Math.sqrt(1 - yy * yy)
      const th = golden * i
      const j = 1 + gauss(r) * 0.012
      x = Math.cos(th) * rad * R * j
      y = yy * R * j
      z = Math.sin(th) * rad * R * j
    } else {
      // Eğik yörünge halkası
      const a = r() * Math.PI * 2
      const rr = 2.35 + gauss(r) * 0.025
      const tilt = 1.2
      const lx = Math.cos(a) * rr
      const lz = Math.sin(a) * rr
      x = lx
      y = lz * Math.sin(tilt) * 0.35
      z = lz * Math.cos(tilt)
      // halkayı biraz döndür
      const rot = 0.35
      const nx = x * Math.cos(rot) - y * Math.sin(rot)
      const ny = x * Math.sin(rot) + y * Math.cos(rot)
      x = nx
      y = ny
    }
    out[i * 3] = x
    out[i * 3 + 1] = y
    out[i * 3 + 2] = z
  }
  return out
}
