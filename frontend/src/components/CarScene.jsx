import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';

function CarBody() {
  const group = useRef();
  useFrame((state) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.06;
  });

  const metal = { metalness: 0.92, roughness: 0.1, envMapIntensity: 1.5 };
  const accent = '#00E5FF';

  return (
    <group ref={group}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.4, 0.9]} />
        <meshStandardMaterial color="#0f172a" {...metal} />
      </mesh>
      <mesh position={[0, 0.35, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.35, 0.7]} />
        <meshStandardMaterial color="#0c1222" {...metal} />
      </mesh>
      <mesh position={[0, 0.6, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.15, 0.5]} />
        <meshStandardMaterial color="#141b2d" {...metal} />
      </mesh>
      <mesh position={[0, 0.15, -0.5]} castShadow>
        <boxGeometry args={[0.8, 0.15, 0.05]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.35, 0.2, -0.48]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.02]} />
        <meshStandardMaterial color="#fff" emissive={accent} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0.35, 0.2, -0.48]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.02]} />
        <meshStandardMaterial color="#fff" emissive={accent} emissiveIntensity={0.7} />
      </mesh>
      {[[-0.65, 0.4], [0.65, 0.4], [-0.65, -0.4], [0.65, -0.4]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, -0.05, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.12, 32]} />
          <meshStandardMaterial color="#0a0f1a" metalness={0.95} roughness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function Particle({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial color="#00E5FF" transparent opacity={0.4} />
    </mesh>
  );
}

export default function CarScene() {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: (Math.random() - 0.5) * 8,
    y: (Math.random() - 0.5) * 6,
    z: (Math.random() - 0.5) * 4 - 2,
  }));

  return (
    <>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 5, 28]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-5, 5, 5]} color="#00E5FF" intensity={2} />
      <pointLight position={[5, -3, 5]} color="#7C3AED" intensity={1} />
      <Environment preset="night" />
      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <CarBody />
        </Float>
      </group>
      {particles.map((p, i) => (
        <Particle key={i} position={[p.x, p.y, p.z]} />
      ))}
    </>
  );
}
