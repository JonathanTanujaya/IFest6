import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import OrbitingMenu from './OrbitingMenu'

// Define the menu items that will orbit the planet
const menuItems = [
  { id: 'about', title: 'About Fest', description: 'Experience the biggest noodle festival in the galaxy. Music, games, and unlimited noodles await you.', color: '#3b82f6' },
  { id: 'lineup', title: 'Lineup Artist', description: 'See your favorite stars performing live on our grand stage. From pop to rock, we have it all.', color: '#8b5cf6' },
  { id: 'tickets', title: 'Buy Tickets', description: 'Secure your spot now! Early bird tickets are available for a limited time.', color: '#ef4444' },
  { id: 'map', title: 'Festival Map', description: 'Navigate through different zones: The Spicy Zone, The Soup Zone, and The Fried Noodle Arena.', color: '#10b981' },
  { id: 'merch', title: 'Merchandise', description: 'Get exclusive t-shirts, lightsticks, and noodle bowls to remember the event.', color: '#f59e0b' },
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
