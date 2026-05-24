import { useRef, useState, useEffect } from "react";
import {  IoPause, IoPlay } from "react-icons/io5";

export default function SendAudio({ audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  // Format time (e.g., 0:45)
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    setCurrentTime(current);
    setProgress((current / audioRef.current.duration) * 100 || 0);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleScrub = (e) => {
    const newProgress = e.target.value;
    const newTime = (newProgress / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newProgress);
  };

  return (
    <div className="flex-1 items-center gap-2  relative">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Control & Progress Area */}
      <div className="flex-1 flex flex-col gap-0.5 pr-1 pt-2">
        <div className="flex items-center gap-2">
          {/* Play / Pause Toggle Control */}
          <button
            onClick={togglePlay}
            className="text-[#0D7A5F] hover:scale-110 border-none transition-transform focus:outline-none"
          >
            {isPlaying ? (
              <IoPause size={24} className="border-none" />
            ) : (
              <IoPlay size={24} className="border-none" />
            )}
          </button>

          {/* Slider Container */}
          <div className="relative flex-1 group">
            {/* Hidden Input Tracking Drag Interactions */}
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleScrub}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            {/* Base Gray Timeline Background Track */}
            <div className="w-full h-1 bg-gray-200 rounded-full relative overflow-hidden">
              {/* Dynamic Filled Left Progress State using your hex color */}
              <div
                className="absolute top-0 left-0 h-full bg-[#0D7A5F]"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Draggable Indicator Knob */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-md z-0 pointer-events-none transition-opacity bg-[#0D7A5F] ${
                isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
        </div>

        {/* Timestamp Footer Info */}
        <div className="flex justify-between items-center px-1">
          <span className="text-[11px] font-medium text-gray-500">
            {isPlaying ? formatTime(currentTime) : formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}