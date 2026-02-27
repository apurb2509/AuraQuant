import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Activity, ShieldAlert, Zap, Layers, Terminal, X, MousePointer2, Play, BarChart3, Clock, Radio } from "lucide-react";
import LiquidityScene from "./components/LiquidityScene";

const socket = io("http://localhost:5000");

function App() {
  // Core Data States
  const [liveData, setLiveData] = useState({ 
    bids: [], asks: [], ofi: "0.0000", microPrice: "0.00", vpin: "0.0000", aiBrief: "" 
  });
  const [history, setHistory] = useState([]);
  const [replayIndex, setReplayIndex] = useState(0);
  
  // UI States
  const [mode, setMode] = useState("LIVE"); // LIVE or REPLAY
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState([]); 
  const [focusView, setFocusView] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Active Data Selector (Switches between Live and Historical Frame)
  const data = mode === "LIVE" ? liveData : (history[replayIndex] || liveData);

  useEffect(() => {
    socket.on("market-update", (payload) => {
      if (mode === "LIVE") setLiveData(payload);
    });
    return () => socket.off("market-update");
  }, [mode]);

  // Handle Mode Switching
  const toggleMode = async () => {
    if (mode === "LIVE") {
      setIsLoadingHistory(true);
      try {
        const res = await fetch("http://localhost:5000/api/history");
        const logs = await res.json();
        setHistory(logs);
        setMode("REPLAY");
        setReplayIndex(logs.length - 1);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    } else {
      setMode("LIVE");
    }
  };

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
      
      {/* FOCUS OVERLAY */}
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
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Aura<span className="text-blue-500">Quant</span></h1>
          
          {/* Mode Switcher */}
          <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
            <button 
              onClick={toggleMode}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold transition-all ${mode === "LIVE" ? "bg-green-500 text-black" : "text-gray-500"}`}
            >
              <Radio size={12} /> {isLoadingHistory ? "FETCHING..." : "LIVE"}
            </button>
            <button 
              onClick={toggleMode}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold transition-all ${mode === "REPLAY" ? "bg-blue-600 text-white" : "text-gray-500"}`}
            >
              <Clock size={12} /> REPLAY
            </button>
          </div>
        </div>
        
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

      {/* Replay Controller Bar */}
      {mode === "REPLAY" && history.length > 0 && (
        <div className="glass-card rounded-[1.5rem] px-6 py-3 flex items-center gap-4 border-blue-500/30 animate-in slide-in-from-top-4 duration-500">
          <span className="text-[10px] font-bold text-blue-400 whitespace-nowrap uppercase tracking-widest">Historical Tape</span>
          <input 
            type="range" min="0" max={history.length - 1} value={replayIndex} 
            onChange={(e) => setReplayIndex(parseInt(e.target.value))}
            className="flex-1 h-1 bg-gray-800 rounded-lg accent-blue-500 cursor-pointer"
          />
          <div className="text-[10px] font-mono text-gray-500">
            FRAME_{replayIndex}/{history.length - 1} 
            <span className="ml-4 text-gray-700">[{new Date(history[replayIndex]?.timestamp).toLocaleTimeString()}]</span>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <main className="flex-1 grid grid-cols-12 grid-rows-6 gap-4 min-h-0">
        <div className="col-span-4 row-span-2">{renderCard('micro', 'Micro-Price', `$${data.microPrice}`, <Zap className="text-blue-400" />, 'Weighted Index', 'text-blue-400')}</div>
        <div className="col-span-4 row-span-2">{renderCard('ofi', 'Order Flow Imbalance', data.ofi, <Layers className="text-green-400" />, 'Pressure Delta', 'text-green-400')}</div>
        
        <div onClick={() => handleToggleSelect('lob')} className={`col-span-4 row-span-3 glass-card rounded-[1.5rem] p-5 flex flex-col overflow-hidden transition-all duration-300 ${isSelectMode ? 'cursor-pointer hover:border-blue-500/50' : ''} ${isSelectMode && selectedQueue.includes('lob') ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}`}>
          <h2 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2"><Terminal size={14} /> LOB_RECONSTRUCTION</h2>
          <div className="flex-1 grid grid-cols-2 gap-4 text-[9px] font-mono overflow-hidden">
            <div className="text-red-400/80 space-y-0.5">{data.asks?.slice(0, 10).map((a, i) => <div key={i}>{a[0]}</div>)}</div>
            <div className="text-green-400/80 space-y-0.5 text-right">{data.bids?.slice(0, 10).map((b, i) => <div key={i}>{b[0]}</div>)}</div>
          </div>
        </div>

        <div className="col-span-4 row-span-1">{renderCard('vpin', 'Flow Toxicity', data.vpin, <ShieldAlert className="text-yellow-500" />, 'VPIN Index', 'text-yellow-500')}</div>

        <div className="col-span-8 row-span-4 glass-card rounded-[2rem] overflow-hidden relative">
          <LiquidityScene bids={data.bids} asks={data.asks} />
        </div>

        <div className="col-span-4 row-span-2 glass-card rounded-[2rem] p-6 flex flex-col overflow-hidden">
          <h2 className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest mb-3 border-b border-white/5 pb-1 flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${mode === "LIVE" ? "bg-blue-500 animate-pulse" : "bg-gray-600"}`} />
            {mode === "LIVE" ? "Institutional_Strategy_Brief" : "Historical_Insight_Log"}
          </h2>
          <div className="text-[10px] font-mono text-blue-400 leading-relaxed italic uppercase mb-3 flex-1 overflow-y-auto">
            {data.aiBrief || "Awaiting LLM Analysis..."}
          </div>
          <div className="text-[9px] font-mono text-gray-600 space-y-1 mt-auto border-t border-white/5 pt-2">
            <div className="flex justify-between">
              <span>OFI_SIGNAL:</span> 
              <span className={parseFloat(data.ofi) >= 0 ? "text-green-500" : "text-red-500"}>
                {parseFloat(data.ofi) >= 0 ? "BULLISH_PRESSURE" : "BEARISH_PRESSURE"}
              </span>
            </div>
            <div className="flex justify-between"><span>VPIN_TOXICITY:</span> <span className={parseFloat(data.vpin) > 0.6 ? "text-red-500" : "text-yellow-500"}>{data.vpin}</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;