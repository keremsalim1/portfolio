import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Icosahedron, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const ACCENT = '#2f7dff' // elektrik mavisi
const ACCENT_2 = '#00d4ff' // cyan

/* Canvas tıklama-geçirgen olduğu için mouse pencere genelinde takip edilir */
function usePagePointer() {
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
  return pointer
}

/* Mouse'a göre yumuşakça dönen, nabız gibi genişleyen distort küre */
function Blob({ pointer }) {
  const group = useRef(null)
  const mat = useRef(null)

  useFrame((state, delta) => {
    if (!group.current) return
    const { x, y } = pointer.current // -1..1
    // Hedef dönüşe doğru yumuşak geçiş
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      x * 0.6,
      0.05
    )
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -y * 0.4,
      0.05
    )
    group.current.rotation.z += delta * 0.05
    if (mat.current) {
      // Hafif "nefes alma" — düşük tutulur ki küre merkezden kaymasın
      const t = state.clock.elapsedTime
      mat.current.distort = 0.16 + Math.sin(t * 0.8) * 0.03
    }
  })

  return (
    <group ref={group}>
      <Icosahedron args={[1.5, 12]}>
        <MeshDistortMaterial
          ref={mat}
          color="#0d2a66"
          emissive={ACCENT}
          emissiveIntensity={0.45}
          roughness={0.12}
          metalness={0.85}
          distort={0.16}
          speed={1.6}
          clearcoat={1}
          clearcoatRoughness={0.15}
        />
      </Icosahedron>
    </group>
  )
}

/* Kürenin etrafında eğik duran ince neon halka + üzerinde dolaşan uydu */
function OrbitRing() {
  const ring = useRef(null)
  const satellite = useRef(null)

  useFrame((state, delta) => {
    if (ring.current) ring.current.rotation.z += delta * 0.12
    if (satellite.current) {
      // Uydu halka üzerinde döner
      const t = state.clock.elapsedTime * 0.55
      satellite.current.position.set(Math.cos(t) * 2.3, Math.sin(t) * 2.3, 0)
    }
  })

  return (
    <group rotation={[Math.PI / 2.6, 0.35, 0]}>
      <group ref={ring}>
        <mesh>
          <torusGeometry args={[2.3, 0.012, 16, 128]} />
          <meshBasicMaterial color={ACCENT_2} transparent opacity={0.55} />
        </mesh>
        {/* Halkanın dış hâlesi */}
        <mesh>
          <torusGeometry args={[2.3, 0.05, 16, 128]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.1} />
        </mesh>
      </group>
      <mesh ref={satellite}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial
          color="#fff"
          emissive={ACCENT_2}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default function Hero3D() {
  const pointer = usePagePointer()
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 2]}
      /* Kamera geride: halka ve yıldızlar görüş alanında kesilmeden sığar */
      camera={{ position: [0, 0, 6.6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.8} color="#dce9ff" />
      <pointLight position={[-4, -2, -3]} intensity={2.2} color={ACCENT_2} />
      <pointLight position={[2, -3, 2]} intensity={1} color={ACCENT} />
      {/* Düşük süzülme: küre KS avatarının arkasından ayrılmaz */}
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
        <Blob pointer={pointer} />
        <OrbitRing />
      </Float>
      {/* Etrafta yanıp sönen yıldız tozları */}
      <Sparkles count={90} scale={5} size={2.4} speed={0.35} opacity={0.65} color="#9fd4ff" />
      <Sparkles count={30} scale={4} size={4} speed={0.25} opacity={0.5} color={ACCENT_2} />
    </Canvas>
  )
}
