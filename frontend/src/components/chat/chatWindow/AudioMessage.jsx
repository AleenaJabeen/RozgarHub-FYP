import { useRef, useState, useEffect } from "react";
import { IoMicOutline, IoPause, IoPlay } from "react-icons/io5";

const AudioMessage = ({ renderStatus, msg, isMe }) => {
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
    <div
      className={`flex items-center gap-2 p-2.5  sm:min-w-[280px]  min-w-[220px] rounded-xl shadow-sm relative ${
        isMe
          ? "bg-secondary ml-auto rounded-tr-none"
          : "bg-white mr-auto rounded-tl-none"
      }`}
    >
      <audio
        ref={audioRef}
        src={msg.mediaUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Profile/Mic Section */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${isMe ? "bg-primary" : "bg-secondary"}`}
        >
          <IoMicOutline
            size={24}
            className={isMe ? "text-secondary" : "text-primary"}
          />
        </div>
      </div>

      {/* Control & Progress Area */}
      <div className="flex-1 flex flex-col gap-0.5 pr-1 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`${isMe ? "text-primary" : "text-secondary"} hover:scale-110 border-none transition-transform`}
          >
            {isPlaying ? (
              <IoPause size={30} className="border-none" />
            ) : (
              <IoPlay size={30} className="border-none" />
            )}
          </button>

          <div className="relative flex-1 group">
            {/* Range Input (WhatsApp Slider) */}
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleScrub}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Custom Track */}
            <div className="w-full h-1 bg-gray-300 rounded-full relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full transition-all ${isMe ? "bg-primary" : "bg-secondary"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Slider Knob (visible on hover or play) */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-md z-0 pointer-events-none transition-opacity ${
                isMe ? "bg-secondary" : "bg-secondary"
              } ${isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center px-1">
          <span
            className={`text-[11px] font-medium ${isMe ? "text-gray-200" : "text-gray-400"}`}
          >
            {isPlaying ? formatTime(currentTime) : formatTime(duration)}
          </span>
          <div className="flex items-center gap-1">

          <span
            className={`text-[10px] ${isMe ? "text-gray-300" : "text-gray-500"} uppercase`}
          >
            {new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
          {isMe && (
            <span
              className={`flex items-center ${msg.status === "read" ? "text-blue-300" : "text-blue-100"}`}
            >
              {renderStatus(msg.status)}
            </span>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;
