import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

export default function OrbitingMenu({ items, onMenuClick, radius = 8 }) {
  const groupRef = useRef()

  // Calculate positions for each menu item in a circle
  const getPositions = () => {
    const angleStep = (Math.PI * 2) / items.length;
    return items.map((item, index) => {
      const angle = index * angleStep;
      // Position on the X and Z axes to orbit around the Y axis
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      // Stagger heights more aggressively to avoid overlap
      const y = Math.sin(angle * 2 + index * 0.5) * 2.2; 
      
      return { x, y, z, ...item };
    });
  }

  const positionedItems = getPositions();

  // Make the entire menu group orbit slowly
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {positionedItems.map((item) => (
        <group key={item.id} position={[item.x, item.y, item.z]}>
          {/* Small glowing orb indicator */}
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color={item.color} />
          </mesh>
          
          {/* HTML Overlay for the text so it always faces camera and looks crisp */}
          <Html distanceFactor={15} center>
            <div 
              className="orbit-menu-label"
              onClick={() => onMenuClick(item)}
              style={{ borderColor: item.color, textShadow: `0 0 10px ${item.color}` }}
            >
              {item.title}
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}
