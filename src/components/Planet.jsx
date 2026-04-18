import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'

export default function Planet() {
  const planetRef = useRef()

  // Slowly rotate the planet
  useFrame((state, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group>
      <Sphere ref={planetRef} args={[4, 64, 64]}>
        {/* MeshDistortMaterial gives a slightly organic, dynamic look */}
        <MeshDistortMaterial 
          color="#1e1b4b" 
          attach="material" 
          distort={0.2} 
          speed={1.5} 
          roughness={0.4} 
          metalness={0.8}
        />
      </Sphere>
      {/* Adding a wireframe overlay for a more sci-fi/technical feel */}
      <Sphere args={[4.05, 32, 32]}>
        <meshBasicMaterial color="#4338ca" wireframe transparent opacity={0.15} />
      </Sphere>
    </group>
  )
}
