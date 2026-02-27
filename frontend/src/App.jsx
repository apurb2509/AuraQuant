import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Activity, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const socket = io("http://localhost:5000");

function App() {
  const [data, setData] = useState({ bids: [], asks: [], ofi: 0 });

  useEffect(() => {
    socket.on("market-update", (payload) => {
      setData(payload);
    });
    return () => socket.off("market-update");
  }, []);

  return (
    <div className="min-h-screen p-6 bg-[#0a0a0a] text-white">
      <header className="flex justify-between items-center border-b border-gray-800 pb-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tighter text-blue-500">
          AURAQUANT{" "}
          <span className="text-xs text-gray-500 font-normal">v1.0</span>
        </h1>
        <div className="flex items-center gap-2 text-green-400">
          <Activity size={18} />
          <span className="text-sm font-mono">LIVE FEED: BTCUSDT</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intelligence Card */}
        <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
          <h2 className="text-gray-400 text-sm mb-2 uppercase tracking-widest">
            Order Flow Imbalance (OFI)
          </h2>
          <div
            className={`text-4xl font-mono flex items-center gap-3 ${
              data.ofi >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {data.ofi >= 0 ? <ArrowUpCircle /> : <ArrowDownCircle />}
            {data.ofi}
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Positive OFI indicates institutional buying pressure.
          </p>
        </div>

        {/* Micro-Price Card */}
        <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
          <h2 className="text-gray-400 text-sm mb-2 uppercase tracking-widest text-blue-400">
            Weighted Micro-Price
          </h2>
          <div className="text-4xl font-mono text-white">
            ${data.microPrice || "0.00"}
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Weighted by volume to predict the next price move.
          </p>
        </div>

        {/* LOB Quick View */}
        <div className="bg-[#111] p-6 rounded-xl border border-gray-800 font-mono text-sm">
          <h2 className="text-gray-400 text-sm mb-4 uppercase tracking-widest text-center">
            Top of Book
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-red-400">
              <p className="text-gray-600 mb-1">BEST ASKS</p>
              {data.asks.slice(0, 5).map((a, i) => (
                <div key={i}>{a[0]}</div>
              ))}
            </div>
            <div className="text-green-400 text-right">
              <p className="text-gray-600 mb-1">BEST BIDS</p>
              {data.bids.slice(0, 5).map((b, i) => (
                <div key={i}>{b[0]}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
