import { Canvas, useThree, useLoader, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import OrbitingMenu from './OrbitingMenu'

// Menu items that orbit in 3D space
const menuItems = [
  { id: 'about', title: 'About IFest', description: 'Di IFest 6.0, kami membawa tema "REWIND: THE MAGIC RETURNS" untuk mengingatkan kembali bahwa setiap dari kamu memiliki sihir untuk bersinar.', color: '#fbbf24', actionText: 'Explore More' },
  { id: 'uiux', title: 'UI/UX Design', description: 'Rancang pengalaman digital masa depan yang tak terlupakan.', color: '#8b5cf6', actionText: 'Detail Lomba' },
  { id: 'poster', title: 'Poster Digital', description: 'Ubah kanvas kosong menjadi karya visual penuh makna.', color: '#ec4899', actionText: 'Detail Lomba' },
  { id: 'ml', title: 'Mobile Legends', description: 'Susun strategi, kalahkan lawan, dan raih tahta Land of Dawn.', color: '#3b82f6', actionText: 'Detail Lomba' },
  { id: 'kpop', title: 'K-Pop Dance Cover', description: 'Sinkronisasikan gerakanmu dan kuasai panggung utama.', color: '#10b981', actionText: 'Detail Lomba' },
  { id: 'band', title: 'Band Competition', description: 'Lantunkan melodimu dan buat seluruh arena bergema.', color: '#f97316', actionText: 'Detail Lomba' },
  { id: 'machine', title: 'Machine Learning Competition', description: 'Ubah data menjadi wawasan, prediksi, dan keajaiban. Tunjukkan kecerdasan algoritmikmu dan ciptakan solusi masa depan yang cerdas!', color: '#fbbf24', actionText: 'Detail Lomba' },
  { id: 'compe', title: 'Competitive Programming', description: 'Tantang dirimu dalam kompetisi coding yang menguji logika, efisiensi, dan kecepatan pemecahan masalah. Buktikan bahwa kamu adalah programmer terbaik!', color: '#356e2aff', actionText: 'Detail Lomba' },
];

/**
 * 360° Panorama using CubeTextureLoader for a proper cubemap skybox.
 * Six images (px, nx, py, ny, pz, nz) are loaded and set as scene.background.
 */
function PanoramaSphere() {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new THREE.CubeTextureLoader();
    loader.setPath('/Background/Panoramic/');

    const texture = loader.load([
      'px.jpg', // right  (+X)
      'nx.jpg', // left   (-X)
      'py.jpg', // top    (+Y)
      'ny.jpg', // bottom (-Y)
      'pz.jpg', // front  (+Z)
      'nz.jpg', // back   (-Z)
    ]);

    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;

    return () => {
      // Cleanup the background when unmounted
      scene.background = null;
      texture.dispose();
    };
  }, [scene]);

  return null;
}

/**
 * Floating golden particle dust for magical depth effect
 */
function ParticleDust({ count = 150 }) {
  const meshRef = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 3] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#fbbf24"
        size={0.06}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Scene({ onMenuClick }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 0.1], fov: 72 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
    >
      {/* 360° Panorama Background Sphere */}
      <PanoramaSphere />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={0.15} color="#fbbf24" />

      {/* Sparse subtle stars for extra depth */}
      <Stars radius={60} depth={50} count={400} factor={2} saturation={0.2} fade speed={0.5} />

      {/* Golden particle dust */}
      <ParticleDust count={120} />

      {/* Orbiting Menu Items */}
      <OrbitingMenu items={menuItems} onMenuClick={onMenuClick} radius={14} />

      {/* Camera controls — 360° drag rotation */}
      <OrbitControls
        target={[0, 0, 0]}
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        rotateSpeed={-0.35}
        autoRotate={true}
        autoRotateSpeed={0.3}
        enableDamping={true}
        dampingFactor={0.08}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.75}
        touches={{ ONE: THREE.TOUCH.ROTATE }}
      />
    </Canvas>
  );
}
