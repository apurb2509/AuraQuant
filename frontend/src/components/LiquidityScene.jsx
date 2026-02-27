import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

const LiquidityScene = ({ bids = [], asks = [] }) => {
  return (
    <div className="h-[400px] w-full bg-[#050505] rounded-xl border border-gray-800 overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
        3D Liquidity Landscape
      </div>
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        <Grid infiniteGrid sectionSize={1} fadeDistance={30} cellColor="#222" sectionColor="#333" />
        
        {/* Render Bids (Green) */}
        {bids.map((bid, i) => (
          <mesh key={`bid-${i}`} position={[-2, parseFloat(bid[1]) / 2, i * 0.6]}>
            <boxGeometry args={[1, parseFloat(bid[1]), 0.5]} />
            <meshStandardMaterial color="#22c55e" emissive="#166534" />
          </mesh>
        ))}

        {/* Render Asks (Red) */}
        {asks.map((ask, i) => (
          <mesh key={`ask-${i}`} position={[2, parseFloat(ask[1]) / 2, i * 0.6]}>
            <boxGeometry args={[1, parseFloat(ask[1]), 0.5]} />
            <meshStandardMaterial color="#ef4444" emissive="#991b1b" />
          </mesh>
        ))}

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
};

export default LiquidityScene;