import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Single menu item — checks if it faces the camera each frame
 * and fades opacity accordingly (prevents back-side overlap).
 */
function MenuItem({ item, onMenuClick, visible }) {
  const meshRef = useRef()
  const [facing, setFacing] = useState(1)
  const worldPos = useRef(new THREE.Vector3())
  const camDir = useRef(new THREE.Vector3())
  const { size } = useThree()

  // Responsive distanceFactor: smaller on landscape mobile (short viewport)
  const isLandscapeMobile = size.height < 500 && size.width > size.height
  const distanceFactor = isLandscapeMobile ? 0.22 : (size.width < 768 ? 0.32 : 0.4)

  useFrame(({ camera }) => {
    if (!meshRef.current) return
    // Get world position of this menu item
    meshRef.current.getWorldPosition(worldPos.current)
    // Direction from camera to item
    camDir.current.copy(worldPos.current).sub(camera.position).normalize()
    // Camera's forward direction
    const camFwd = new THREE.Vector3()
    camera.getWorldDirection(camFwd)
    // Dot product: 1 = directly in front, -1 = directly behind
    const dot = camFwd.dot(camDir.current)
    // Smooth value: visible when dot > 0.1, hidden when dot < -0.2
    const alpha = THREE.MathUtils.clamp((dot + 0.2) / 0.6, 0, 1)
    setFacing(alpha)
  })

  const finalOpacity = visible ? facing : 0

  return (
    <group position={[item.x, item.y, item.z]}>
      <mesh ref={meshRef} visible={false}>
        <sphereGeometry args={[0.01, 4, 4]} />
        <meshBasicMaterial />
      </mesh>

      <Html distanceFactor={distanceFactor} center zIndexRange={[100, 0]}>
        <div
          className="orbit-menu-card"
          onClick={() => onMenuClick(item)}
          style={{
            opacity: finalOpacity,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${item.index * 0.08}s`,
            pointerEvents: finalOpacity > 0.3 ? 'auto' : 'none',
          }}
        >
          <div className="orbit-menu-image-shell" style={{ borderColor: item.color, boxShadow: `0 8px 32px ${item.color}40` }}>
            <img className="orbit-menu-image" src={item.image} alt={item.title} loading="lazy" />
          </div>
        </div>
      </Html>
    </group>
  )
}

export default function OrbitingMenu({ items, onMenuClick, radius = 8 }) {
  const groupRef = useRef()
  const [visible, setVisible] = useState(false)

  // Staggered entrance — wait a moment before showing labels
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  const getPositions = () => {
    const count = items.length;
    const angleStep = (Math.PI * 2) / count;

    return items.map((item, index) => {
      const angle = index * angleStep;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const y = 0; // All items aligned at the same height
      return { x, y, z, index, ...item };
    });
  }

  const positionedItems = getPositions();

  // Make the entire menu group orbit slowly
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {positionedItems.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          onMenuClick={onMenuClick}
          visible={visible}
        />
      ))}
    </group>
  )
}


