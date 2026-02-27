import React, { useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const ReplayController = ({ onFrameChange, totalFrames }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSlider = (e) => {
    const val = parseInt(e.target.value);
    setCurrentFrame(val);
    onFrameChange(val);
  };

  return (
    <div className="glass-card rounded-2xl p-4 flex items-center gap-6 mt-4 border-blue-500/30">
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="bg-blue-600 p-2 rounded-full hover:bg-blue-500 transition-all"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      
      <div className="flex-1 flex flex-col gap-1">
        <input 
          type="range" 
          min="0" 
          max={totalFrames} 
          value={currentFrame} 
          onChange={handleSlider}
          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[8px] font-mono text-gray-500">
          <span>START_RECORDING</span>
          <span>FRAME: {currentFrame} / {totalFrames}</span>
          <span>END_RECORDING</span>
        </div>
      </div>

      <button onClick={() => {setCurrentFrame(0); onFrameChange(0);}} className="text-gray-500 hover:text-white">
        <RotateCcw size={18} />
      </button>
    </div>
  );
};

export default ReplayController;