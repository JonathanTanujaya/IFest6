import { useRef, useState, useEffect, useCallback } from 'react'
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
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={item.color} />
      </mesh>

      <Html distanceFactor={18} center zIndexRange={[100, 0]}>
        <div
          className="orbit-menu-label"
          onClick={() => onMenuClick(item)}
          style={{
            borderColor: item.color,
            textShadow: `0 0 10px ${item.color}`,
            opacity: finalOpacity,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: `transform 0.5s ease ${item.index * 0.08}s`,
            pointerEvents: finalOpacity > 0.3 ? 'auto' : 'none',
          }}
        >
          {item.title}
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

  // Calculate positions for each menu item in a circle
  const getPositions = () => {
    const count = items.length;
    const angleStep = (Math.PI * 2) / count;

    // Well-separated Y offsets — no two items within 0.8 units vertically
    const yOffsets = [0.5, 3.2, -2.8, -0.8, 2.2, -3.5, 1.5, -1.8];

    return items.map((item, index) => {
      const angle = index * angleStep;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const y = yOffsets[index % yOffsets.length];
      return { x, y, z, index, ...item };
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


