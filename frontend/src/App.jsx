import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Activity, ShieldAlert, Zap, Layers, Terminal, X, MousePointer2, Play, BarChart3 } from "lucide-react";
import LiquidityScene from "./components/LiquidityScene";

const socket = io("http://localhost:5000");

function App() {
  const [data, setData] = useState({ 
    bids: [], 
    asks: [], 
    ofi: "0.0000", 
    microPrice: "0.00", 
    vpin: "0.0000",
    aiBrief: "" 
  });
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState([]); 
  const [focusView, setFocusView] = useState([]);

  useEffect(() => {
    socket.on("market-update", (payload) => setData(payload));
    return () => socket.off("market-update");
  }, []);

  const handleToggleSelect = (id) => {
    if (isSelectMode) {
      setSelectedQueue(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
  };

  const startAnalysis = () => {
    setFocusView(selectedQueue);
    setIsSelectMode(false);
    setSelectedQueue([]);
  };

  const closeIndividual = (id) => setFocusView(prev => prev.filter(x => x !== id));

  const renderCard = (id, title, value, icon, sub, color, isZoomed = false) => (
    <div 
      onClick={() => handleToggleSelect(id)}
      className={`glass-card rounded-[1.5rem] p-5 flex flex-col justify-between transition-all duration-300 relative h-full w-full overflow-hidden
      ${isSelectMode ? 'cursor-pointer hover:border-blue-500/50' : 'cursor-default'}
      ${isSelectMode && selectedQueue.includes(id) ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}`}
    >
      <div className="flex justify-between items-start">
        {icon}
        <div className="flex items-center gap-2">
          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${color} bg-opacity-10 tracking-widest`}>{sub}</span>
          {isZoomed && <X size={20} className="text-gray-500 hover:text-white cursor-pointer" onClick={(e) => {e.stopPropagation(); closeIndividual(id);}} />}
        </div>
      </div>
      <div className="mt-2 min-h-0 flex-1 flex flex-col justify-end">
        <h2 className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5">{title}</h2>
        <div className={`font-black tabular-nums leading-none truncate ${isZoomed ? 'text-7xl' : 'text-3xl'} ${color.split(' ')[0]}`}>{value}</div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen p-4 flex flex-col gap-4 bg-[#020617] text-slate-200 overflow-hidden font-mono">
      
      {/* FULL FOCUS OVERLAY (Centering 1-3 Cards) */}
      {focusView.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl p-12 flex flex-wrap items-center justify-center gap-10 animate-in fade-in duration-500">
          {focusView.map(id => (
            <div key={id} className={`${focusView.length === 1 ? 'w-1/2' : 'w-[30%]'} aspect-video`}>
              {id === 'micro' && renderCard('micro', 'Institutional Micro-Price', `$${data.microPrice}`, <Zap className="text-blue-400" size={32}/>, 'Weighted Index', 'text-blue-400', true)}
              {id === 'ofi' && renderCard('ofi', 'Order Flow Imbalance', data.ofi, <Layers className="text-green-400" size={32}/>, 'Pressure Delta', 'text-green-400', true)}
              {id === 'vpin' && renderCard('vpin', 'Flow Toxicity', data.vpin, <ShieldAlert className="text-yellow-500" size={32}/>, 'VPIN Index', 'text-yellow-500', true)}
              {id === 'lob' && (
                  <div className="glass-card rounded-[1.5rem] p-8 h-full w-full relative overflow-hidden">
                    <X size={24} className="absolute top-6 right-6 text-gray-500 hover:text-white cursor-pointer z-50" onClick={() => closeIndividual('lob')} />
                    <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Depth Landscape Snapshot</h2>
                    <div className="grid grid-cols-2 gap-10 text-xl font-mono">
                         <div className="text-red-400 space-y-2">{data.asks?.slice(0, 12).map((a, i) => <div key={i}>{a[0]}</div>)}</div>
                         <div className="text-green-400 text-right space-y-2">{data.bids?.slice(0, 12).map((b, i) => <div key={i}>{b[0]}</div>)}</div>
                    </div>
                  </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center px-2 flex-shrink-0">
        <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Aura<span className="text-blue-500">Quant</span></h1>
        
        <div className="flex gap-4">
          {isSelectMode && selectedQueue.length > 0 && (
            <button onClick={startAnalysis} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-[10px] tracking-widest animate-pulse shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all">
              <BarChart3 size={14} /> ANALYZE {selectedQueue.length} MODULES
            </button>
          )}
          <button onClick={() => { setIsSelectMode(!isSelectMode); setSelectedQueue([]); }} className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all font-bold text-[10px] tracking-widest uppercase ${isSelectMode ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
            <MousePointer2 size={14} /> {isSelectMode ? "CANCEL" : "SELECT & ANALYZE"}
          </button>
        </div>
      </header>

      {/* Grid: Non-scrolling bento layout */}
      <main className="flex-1 grid grid-cols-12 grid-rows-6 gap-4 min-h-0">
        <div className="col-span-4 row-span-2">
          {renderCard('micro', 'Micro-Price', `$${data.microPrice}`, <Zap className="text-blue-400" />, 'Weighted Index', 'text-blue-400')}
        </div>
        <div className="col-span-4 row-span-2">
          {renderCard('ofi', 'Order Flow Imbalance', data.ofi, <Layers className="text-green-400" />, 'Pressure Delta', 'text-green-400')}
        </div>
        
        {/* LOB Snapshot */}
        <div onClick={() => handleToggleSelect('lob')} className={`col-span-4 row-span-3 glass-card rounded-[1.5rem] p-5 flex flex-col overflow-hidden transition-all duration-300 ${isSelectMode ? 'cursor-pointer hover:border-blue-500/50' : 'cursor-default'} ${isSelectMode && selectedQueue.includes('lob') ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}`}>
          <h2 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2"><Terminal size={14} /> LOB_RECONSTRUCTION</h2>
          <div className="flex-1 grid grid-cols-2 gap-4 text-[9px] font-mono overflow-hidden">
            <div className="text-red-400/80 space-y-0.5">{data.asks?.slice(0, 10).map((a, i) => <div key={i}>{a[0]}</div>)}</div>
            <div className="text-green-400/80 space-y-0.5 text-right">{data.bids?.slice(0, 10).map((b, i) => <div key={i}>{b[0]}</div>)}</div>
          </div>
        </div>

        <div className="col-span-4 row-span-1">
          {renderCard('vpin', 'Flow Toxicity', data.vpin, <ShieldAlert className="text-yellow-500" />, 'VPIN Index', 'text-yellow-500')}
        </div>

        {/* 3D Map Landscape */}
        <div className="col-span-8 row-span-4 glass-card rounded-[2rem] overflow-hidden relative">
          <LiquidityScene bids={data.bids} asks={data.asks} />
        </div>

        {/* Institutional AI Strategy Brief */}
        <div className="col-span-4 row-span-2 glass-card rounded-[2rem] p-6 flex flex-col overflow-hidden">
          <h2 className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest mb-3 border-b border-white/5 pb-1 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Institutional_Strategy_Brief
          </h2>
          <div className="text-[10px] font-mono text-blue-400 leading-relaxed italic uppercase mb-3 flex-1 overflow-y-auto">
            {data.aiBrief || "Awaiting LLM Market Analysis..."}
          </div>
          <div className="text-[9px] font-mono text-gray-600 space-y-1 mt-auto border-t border-white/5 pt-2">
            <div className="flex justify-between">
              <span>OFI_SIGNAL:</span> 
              <span className={parseFloat(data.ofi) >= 0 ? "text-green-500" : "text-red-500"}>
                {parseFloat(data.ofi) >= 0 ? "BULLISH_PRESSURE" : "BEARISH_PRESSURE"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>VPIN_TOXICITY:</span> 
              <span className={parseFloat(data.vpin) > 0.6 ? "text-red-500" : "text-yellow-500"}>
                {data.vpin}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;