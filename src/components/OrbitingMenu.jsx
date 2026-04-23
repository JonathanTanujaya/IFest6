import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────
//  🎴  CARD SIZE CONTROL
//  Ubah angka di bawah ini untuk mengatur ukuran semua kartu.
//  1 = ukuran default · 1.5 = lebih besar · 0.8 = lebih kecil
// ─────────────────────────────────────────────────────────────
const cardSize = 2.1

// ─────────────────────────────────────────────────────────────
//  📐  Y OFFSET
//  Geser posisi kartu ke atas (+) atau ke bawah (-).
//  0 = tengah scene · -0.3 = lebih ke bawah · 0.3 = lebih ke atas
// ─────────────────────────────────────────────────────────────
const yOffset = 0.39

// Base dimensions at cardSize = 1  (rasio 3:4, portrait)
const BASE_W = 56   // px — lebar shell desktop
const BASE_H = 75   // px — tinggi shell desktop (3:4)
const BASE_DF = 0.45 // distanceFactor desktop

// Responsive scale multipliers (applied on top of cardSize)
const SCALE_MOBILE_PORTRAIT = 0.85   // ≤768px portrait
const SCALE_MOBILE_LANDSCAPE = 0.55   // landscape + max-height ≤500px

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

  // Pick responsive multiplier based on viewport
  const isLandscapeMobile = size.height < 500 && size.width > size.height
  const isMobilePortrait = size.width < 768 && !isLandscapeMobile
  const rScale = isLandscapeMobile
    ? SCALE_MOBILE_LANDSCAPE
    : isMobilePortrait
      ? SCALE_MOBILE_PORTRAIT
      : 1

  // Final dimensions — all derived from cardSize
  const shellW = Math.round(BASE_W * cardSize * rScale)
  const shellH = Math.round(BASE_H * cardSize * rScale)
  const df = BASE_DF * cardSize * rScale

  useFrame(({ camera }) => {
    if (!meshRef.current) return
    meshRef.current.getWorldPosition(worldPos.current)
    camDir.current.copy(worldPos.current).sub(camera.position).normalize()
    const camFwd = new THREE.Vector3()
    camera.getWorldDirection(camFwd)
    const dot = camFwd.dot(camDir.current)
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

      <Html distanceFactor={df} center zIndexRange={[100, 0]}>
        {/* pointer-events: none on wrapper — lets touch drag pass through to canvas */}
        <div
          className="orbit-menu-card"
          style={{
            opacity: finalOpacity,
            width: `${shellW + 16}px`,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${item.index * 0.08}s`,
            pointerEvents: 'none',   // ← never block canvas touch/drag
          }}
        >
          <div
            className="orbit-menu-image-shell"
            onClick={() => onMenuClick(item)}
            style={{
              width: `${shellW}px`,
              height: `${shellH}px`,
              minWidth: `${shellW}px`,
              minHeight: `${shellH}px`,
              maxWidth: `${shellW}px`,
              maxHeight: `${shellH}px`,
              borderColor: item.color,
              boxShadow: `0 8px 32px ${item.color}40`,
              // Only the image shell is clickable, not the transparent wrapper
              pointerEvents: finalOpacity > 0.3 ? 'auto' : 'none',
              cursor: 'pointer',
            }}
          >
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

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  const getPositions = () => {
    const count = items.length
    const angleStep = (Math.PI * 2) / count
    return items.map((item, index) => {
      const angle = index * angleStep
      const x = Math.sin(angle) * radius
      const z = Math.cos(angle) * radius
      return { x, y: yOffset, z, index, ...item }
    })
  }

  const positionedItems = getPositions()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.05
    }
  })

  return (
    <group ref={groupRef} rotation={[0, Math.PI, 0]}>
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
