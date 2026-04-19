import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import OrbitingMenu from './OrbitingMenu'

// Define the menu items that will orbit the planet
const menuItems = [
  { id: 'about', title: 'About IFest', description: 'Di IFest 6.0, kami membawa tema "REWIND: THE MAGIC RETURNS" untuk mengingatkan kembali bahwa setiap dari kamu memiliki sihir untuk bersinar.', color: '#fbbf24', actionText: 'Explore More' },
  { id: 'uiux', title: 'UI/UX Design', description: 'Rancang pengalaman digital masa depan yang tak terlupakan.', color: '#8b5cf6', actionText: 'Detail Lomba' },
  { id: 'poster', title: 'Poster Digital', description: 'Ubah kanvas kosong menjadi karya visual penuh makna.', color: '#ec4899', actionText: 'Detail Lomba' },
  { id: 'ml', title: 'Mobile Legends', description: 'Susun strategi, kalahkan lawan, dan raih tahta Land of Dawn.', color: '#3b82f6', actionText: 'Detail Lomba' },
  { id: 'kpop', title: 'K-Pop Dance Cover', description: 'Sinkronisasikan gerakanmu dan kuasai panggung utama.', color: '#10b981', actionText: 'Detail Lomba' },
  { id: 'band', title: 'Band Competition', description: 'Lantunkan melodimu dan buat seluruh arena bergema.', color: '#f97316', actionText: 'Detail Lomba' },
  { id: 'register', title: 'Daftar Sekarang', description: 'Siap Menciptakan Keajaibanmu Sendiri? Amankan slot kamu sebelum kehabisan!', color: '#fbbf24', actionText: 'Link Pendaftaran Resmi' },
];

export default function Scene({ onMenuClick }) {
  return (
    <Canvas camera={{ position: [0, 0, 0.1], fov: 60 }}>
      {/* Lighting setup */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Background stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Orbiting Menus */}
      <OrbitingMenu items={menuItems} onMenuClick={onMenuClick} radius={10} />
      
      {/* Controls to rotate the view from the center */}
      <OrbitControls 
        target={[0, 0, 0]}
        enableZoom={false} 
        enablePan={false} 
        enableRotate={true}
        rotateSpeed={-0.5} // Negative speed to make dragging feel like looking around
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  )
}
