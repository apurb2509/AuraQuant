import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";

const LiquidityBar = ({ position, volume, type, maxVolume }) => {
  const height = (volume / maxVolume) * 5 + 0.1;
  const intensity = volume / maxVolume;
  const color = type === "bid" 
    ? `rgb(34, ${Math.floor(197 * intensity + 50)}, 94)` 
    : `rgb(${Math.floor(239 * intensity + 50)}, 68, 68)`;

  return (
    <mesh position={[position[0], height / 2, position[2]]}>
      <boxGeometry args={[0.8, height, 0.4]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity * 2} toneMapped={false} />
    </mesh>
  );
};

const LiquidityScene = ({ bids = [], asks = [] }) => {
  const allVolumes = [...bids.map((b) => parseFloat(b[1])), ...asks.map((a) => parseFloat(a[1]))];
  const maxVolume = Math.max(...allVolumes, 1);

  return (
    <div className="w-full h-full relative bg-[#050505]">
      {/* Label container with background to prevent ghosting/overlapping */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-lg px-4 py-2 rounded-lg border border-white/5">
          <h2 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] leading-none">Depth Perception</h2>
          <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-widest">Spatial Topology</p>
        </div>
      </div>

      <Canvas camera={{ position: [12, 12, 12], fov: 40 }}>
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <Grid infiniteGrid sectionSize={1} fadeDistance={40} cellColor="#111" sectionColor="#222" />
        
        {bids.map((bid, i) => <LiquidityBar key={`bid-${i}`} position={[-3, 0, i * 0.8]} volume={parseFloat(bid[1])} type="bid" maxVolume={maxVolume} />)}
        {asks.map((ask, i) => <LiquidityBar key={`ask-${i}`} position={[3, 0, i * 0.8]} volume={parseFloat(ask[1])} type="ask" maxVolume={maxVolume} />)}
        
        {/* Interaction: Rotation (Left Click), Pan (Right Click/Two-Finger Drag), Zoom (Scroll) */}
        <OrbitControls 
            makeDefault 
            enablePan={true} 
            panSpeed={1.5}
            rotateSpeed={0.8}
            enableZoom={true} 
            minDistance={5} 
            maxDistance={50} 
        />
      </Canvas>
    </div>
  );
};

export default LiquidityScene;