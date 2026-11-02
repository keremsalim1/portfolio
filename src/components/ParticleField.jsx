import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { handShape, networkShape, surfaceShape, sphereShape } from './particleShapes'

/*
  Sayfanın arkasında sabit duran tek WebGL sahnesi.
  ~16 bin parçacık kaydırmaya göre şekil değiştirir:
    #about      → el iskeleti (SignaTurk'ün 21 landmark modeli)
    #skills     → sinir ağı
    #projects   → olasılık yüzeyi
    #experience → olasılık yüzeyi (sola kayar, söner)
    #contact    → küre + yörünge halkası
  Dönüşüm GPU'da (vertex shader) yapılır; JS sadece birkaç uniform günceller.
*/

const ACCENT = new THREE.Color('#2f7dff')
const ACCENT_2 = new THREE.Color('#00d4ff')
const ICE = new THREE.Color('#c6dcff')

// Her bölüm için hedef: şekil (morph), konum, ölçek, dönüş, opaklık.
// Masaüstü / dar ekran için ayrı yerleşim.
const LAYOUT = {
  desktop: {
    about: { morph: 0, x: 2.45, y: -0.1, s: 1.0, rx: 0.0, ry: -0.25, o: 1.0 },
    skills: { morph: 1, x: 2.4, y: 0.2, s: 0.9, rx: 0.15, ry: 0.5, o: 0.36 },
    projects: { morph: 2, x: 0.6, y: -0.9, s: 1.0, rx: 0.55, ry: 0.5, o: 0.42 },
    experience: { morph: 2, x: -3.2, y: -0.4, s: 0.85, rx: 0.4, ry: 1.2, o: 0.4 },
    contact: { morph: 3, x: 0, y: 0.15, s: 1.25, rx: 0.2, ry: 0, o: 0.55 },
  },
  mobile: {
    about: { morph: 0, x: 0.35, y: 1.65, s: 0.52, rx: 0, ry: -0.2, o: 0.5 },
    skills: { morph: 1, x: 0, y: 0.6, s: 0.55, rx: 0.15, ry: 0.5, o: 0.35 },
    projects: { morph: 2, x: 0, y: -1.2, s: 0.55, rx: 0.55, ry: 0.5, o: 0.3 },
    experience: { morph: 2, x: 0, y: -1.6, s: 0.5, rx: 0.4, ry: 1.2, o: 0.25 },
    contact: { morph: 3, x: 0, y: 0.6, s: 0.7, rx: 0.2, ry: 0, o: 0.6 },
  },
}
const ORDER = ['about', 'skills', 'projects', 'experience', 'contact']
const KEYS = ['morph', 'x', 'y', 's', 'rx', 'ry', 'o']

const vertexShader = /* glsl */ `
  attribute vec3 aHand;
  attribute vec3 aNet;
  attribute vec3 aSurf;
  attribute vec3 aSphere;
  attribute float aRand;

  uniform float uMorph;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  varying float vRand;
  varying float vMix;

  void main() {
    float m = clamp(uMorph, 0.0, 3.0);
    float seg = min(floor(m), 2.0);
    float local = m - seg;
    // Parçacıklar aynı anda değil, dalga halinde dönüşür
    float t = smoothstep(0.0, 1.0, clamp((local - aRand * 0.35) / 0.65, 0.0, 1.0));

    vec3 from = seg < 0.5 ? aHand : (seg < 1.5 ? aNet : aSurf);
    vec3 to   = seg < 0.5 ? aNet  : (seg < 1.5 ? aSurf : aSphere);
    vec3 pos = mix(from, to, t);

    // Geçişin ortasında parçacıklar savrulur, durağanken hafifçe nefes alır
    float chaos = sin(t * 3.14159);
    float ph = aRand * 60.0;
    vec3 drift = vec3(
      sin(uTime * 0.7 + ph + pos.y * 1.7),
      cos(uTime * 0.6 + ph * 1.3 + pos.x * 1.5),
      sin(uTime * 0.5 + ph * 0.7 + pos.z * 1.3)
    );
    pos += drift * (0.018 + chaos * 0.55);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float twinkle = 0.75 + 0.25 * sin(uTime * 2.0 + ph);
    gl_PointSize = uSize * (0.45 + aRand * aRand * 1.4) * twinkle * uPixelRatio / -mv.z;

    vRand = aRand;
    vMix = chaos;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  uniform float uOpacity;
  varying float vRand;
  varying float vMix;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = pow(1.0 - d * 2.0, 1.6);
    vec3 col = mix(uA, uB, smoothstep(0.15, 0.85, vRand));
    // En parlak %8'lik dilim buz beyazı: derinlik ve "yıldız" hissi
    col = mix(col, uC, step(0.92, vRand) * 0.8);
    col += vMix * 0.15;
    gl_FragColor = vec4(col, a * uOpacity);
  }
`

function lerpLayout(a, b, k) {
  const o = {}
  for (const key of KEYS) o[key] = a[key] + (b[key] - a[key]) * k
  return o
}

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const ease = (t) => t * t * (3 - 2 * t)

function Particles({ count, reduced }) {
  const points = useRef(null)
  const { gl, size } = useThree()
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const current = useRef(null)
  const sections = useRef([])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const hand = handShape(count)
    g.setAttribute('position', new THREE.BufferAttribute(hand, 3))
    g.setAttribute('aHand', new THREE.BufferAttribute(hand, 3))
    g.setAttribute('aNet', new THREE.BufferAttribute(networkShape(count), 3))
    g.setAttribute('aSurf', new THREE.BufferAttribute(surfaceShape(count), 3))
    g.setAttribute('aSphere', new THREE.BufferAttribute(sphereShape(count), 3))
    const rand = new Float32Array(count)
    for (let i = 0; i < count; i++) rand[i] = Math.random()
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))
    // Parçacıklar şekil değiştirirken kırpılmasın
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10)
    return g
  }, [count])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: 26 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 0 },
          uA: { value: ACCENT },
          uB: { value: ACCENT_2 },
          uC: { value: ICE },
        },
      }),
    []
  )

  useEffect(() => () => {
    geometry.dispose()
    material.dispose()
  }, [geometry, material])

  useEffect(() => {
    material.uniforms.uPixelRatio.value = gl.getPixelRatio()
  }, [gl, material, size])

  // Bölüm konumlarını önbelleğe al (her karede layout okumamak için)
  useEffect(() => {
    const measure = () => {
      sections.current = ORDER.map((id) => {
        const el = document.getElementById(id)
        return el ? el.getBoundingClientRect().top + window.scrollY : null
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    const onMove = (e) => {
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.ty = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame((state, delta) => {
    const p = points.current
    if (!p) return
    const dt = Math.min(delta, 0.05)
    const vh = window.innerHeight
    const y = window.scrollY
    const layout = size.width < 820 ? LAYOUT.mobile : LAYOUT.desktop

    // Kaydırma konumundan hedef yerleşimi hesapla. Her bölüm geçişi,
    // bir sonraki bölümün üstü ekranın %95'inden %30'una gelene kadar sürer.
    let target = layout[ORDER[0]]
    for (let i = 1; i < ORDER.length; i++) {
      const top = sections.current[i]
      if (top == null) continue
      const k = ease(clamp01((y - (top - vh * 0.95)) / (vh * 0.65)))
      if (k <= 0) break
      target = lerpLayout(target, layout[ORDER[i]], k)
    }

    if (!current.current) current.current = { ...target, o: 0 }
    const c = current.current
    // Yumuşak takip: Lenis üstüne ikinci bir "ağırlık" katmanı
    const damp = reduced ? 1 : 1 - Math.exp(-dt * 3.2)
    for (const key of KEYS) c[key] += (target[key] - c[key]) * damp

    const ptr = pointer.current
    ptr.x += (ptr.tx - ptr.x) * (1 - Math.exp(-dt * 2.5))
    ptr.y += (ptr.ty - ptr.y) * (1 - Math.exp(-dt * 2.5))

    const t = reduced ? 0 : state.clock.elapsedTime
    p.position.set(c.x, c.y + Math.sin(t * 0.6) * 0.05, 0)
    p.scale.setScalar(c.s)
    p.rotation.x = c.rx - ptr.y * 0.18
    p.rotation.y = c.ry + ptr.x * 0.35 + Math.sin(t * 0.25) * 0.12

    const u = material.uniforms
    u.uMorph.value = c.morph
    u.uTime.value = t
    // Açılışta parçacıklar yavaşça belirir
    const intro = reduced ? 1 : clamp01((state.clock.elapsedTime - 0.9) / 1.6)
    u.uOpacity.value = c.o * ease(intro)
    u.uSize.value = size.width < 820 ? 20 : 26
  })

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
}

export default function ParticleField() {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isSmall = typeof window !== 'undefined' && window.innerWidth < 820
  const count = isSmall ? 7000 : 16000

  return (
    <div className="particle-stage" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <Particles count={count} reduced={reduced} />
      </Canvas>
    </div>
  )
}
