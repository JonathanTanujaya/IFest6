import { Canvas, useThree, useLoader, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import OrbitingMenu from './OrbitingMenu'

// Menu items that orbit in 3D space
const menuItems = [
  { id: 'about', title: 'About IFest', description: 'Di IFest 6.0, kami membawa tema "REWIND: THE MAGIC RETURNS" untuk mengingatkan kembali bahwa setiap dari kamu memiliki sihir untuk bersinar.', color: '#fbbf24', image: '/Compress/ifest.webp', badge: 'Explore' },
  { id: 'uiux', title: 'UI/UX Design', description: 'Rancang pengalaman digital masa depan yang tak terlupakan.', color: '#8b5cf6', image: '/Compress/uiux.webp', badge: 'Detail Lomba' },
  { id: 'poster', title: 'Poster Digital', description: 'Ubah kanvas kosong menjadi karya visual penuh makna.', color: '#ec4899', image: '/Compress/poster.webp', badge: 'Detail Lomba' },
  { id: 'ml', title: 'Mobile Legends', description: 'Susun strategi, kalahkan lawan, dan raih tahta Land of Dawn.', color: '#3b82f6', image: '/Compress/ml.webp', badge: 'Detail Lomba' },
  { id: 'kpop', title: 'K-Pop Dance Cover', description: 'Sinkronisasikan gerakanmu dan kuasai panggung utama.', color: '#10b981', image: '/Compress/kpop.webp', badge: 'Detail Lomba' },
  { id: 'band', title: 'Band Competition', description: 'Lantunkan melodimu dan buat seluruh arena bergema.', color: '#f97316', image: '/Compress/band.webp', badge: 'Detail Lomba' },
  { id: 'machine', title: 'Machine Learning Competition', description: 'Ubah data menjadi wawasan, prediksi, dan keajaiban. Tunjukkan kecerdasan algoritmikmu dan ciptakan solusi masa depan yang cerdas!', color: '#fbbf24', image: '/Compress/AI.webp', badge: 'Detail Lomba' },
  { id: 'compe', title: 'Competitive Programming', description: 'Tantang dirimu dalam kompetisi coding yang menguji logika, efisiensi, dan kecepatan pemecahan masalah. Buktikan bahwa kamu adalah programmer terbaik!', color: '#356e2aff', image: '/Compress/compe.webp', badge: 'Detail Lomba' },
];

/**
 * 360° Panorama using CubeTextureLoader for a proper cubemap skybox.S
 * Six images (px, nx, py, ny, pz, nz) are loaded and set as scene.background.
 */
function PanoramaSphere() {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new THREE.CubeTextureLoader();
    loader.setPath('/Background/Panoramic/');

    const texture = loader.load([
      'px.webp', // right  (+X)
      'nx.webp', // left   (-X)
      'py.webp', // top    (+Y)
      'ny.webp', // bottom (-Y)
      'pz.webp', // front  (+Z)
      'nz.webp', // back   (-Z)
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
 * Floating Wonderland particles (Spades, Hearts, Diamonds, Clubs)
 */
function SuitPoints({ suit, color, count }) {
  const meshRef = useRef();

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = color;
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(suit, 32, 36);
    return new THREE.CanvasTexture(canvas);
  }, [suit, color]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * (0.015 + (suit.charCodeAt(0) % 5) * 0.002);
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + suit.charCodeAt(0)) * 0.5;
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
        map={texture}
        size={0.7}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        alphaTest={0.01}
      />
    </points>
  );
}

function WonderlandParticles({ countPerSuit = 10 }) {
  const suits = useMemo(() => [
    { symbol: '♠', color: '#111111' },
    { symbol: '♣', color: '#111111' },
    { symbol: '♦', color: '#dc2626' },
    { symbol: '♥', color: '#dc2626' }
  ], []);

  return (
    <>
      {suits.map((suit, index) => (
        <SuitPoints key={index} suit={suit.symbol} color={suit.color} count={countPerSuit} />
      ))}
    </>
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

      {/* Sparse subtle stars for extra depth - reduced count for performance */}
      <Stars radius={60} depth={50} count={200} factor={2} saturation={0.2} fade speed={0.5} />

      {/* Wonderland particles - reduced count to prevent frame drops */}
      <WonderlandParticles countPerSuit={10} />

      {/* Orbiting Menu Items */}
      <OrbitingMenu items={menuItems} onMenuClick={onMenuClick} radius={1.2} />

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
