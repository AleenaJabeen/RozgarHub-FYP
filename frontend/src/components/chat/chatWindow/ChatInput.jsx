import React, { useState, useRef, useEffect } from "react";
import {
  IoSend,
  IoMicOutline,
  IoTrashOutline,
  IoStopCircleOutline,
} from "react-icons/io5";
import { MdOutlineInsertPhoto } from "react-icons/md";
import SendAudio from "./SendAudio";

const ChatInput = ({
  text,
  setText,
  onSendMessage,
  onSendMedia,
  onVoiceAssistant,
  onTyping,
  isRecording,
}) => {
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState("");

  // Voice recording state
  const [recordingState, setRecordingState] = useState("idle"); // "idle" | "recording" | "preview"
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordSeconds, setRecordSeconds] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    let type = "image";
    if (file.type.startsWith("video/")) type = "video";
    if (file.type.startsWith("audio/")) type = "audio";
    setSelectedFile(file);
    setSelectedType(type);
    e.target.value = null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      onSendMedia(selectedFile, selectedType);
      setSelectedFile(null);
      setSelectedType("");
      return;
    }
    onSendMessage(e);
  };

  // ── Voice recording ──────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setRecordingState("preview");
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setRecordingState("recording");
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    clearInterval(timerRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      // override onstop to just clean up
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current.stream
          ?.getTracks()
          .forEach((t) => t.stop());
      };
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordSeconds(0);
    setRecordingState("idle");
  };

  const sendVoiceMessage = () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], `voice_${Date.now()}.webm`, {
      type: "audio/webm",
    });
    onSendMedia(file, "audio");
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordSeconds(0);
    setRecordingState("idle");
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleMicClick = () => {
    if (recordingState === "idle") {
      // If the parent wants its own handler (e.g. AI assistant), call that
      // but only if we can't get mic access — otherwise record locally.
      startRecording();
    } else if (recordingState === "recording") {
      stopRecording();
    }
  };

  // ── Render ───────────────────────────────────────────────────────

  // PREVIEW state: show audio player + cancel/send
  if (recordingState === "preview") {
    return (
      <div className="flex-shrink-0 bg-[#f0f2f5] p-2 border-t border-gray-200">
        <div className="flex items-center px-3 py-1 shadow-sm gap-3">
          {/* Cancel */}
          <button
            onClick={cancelRecording}
            className="p-2  text-red-500 hover:bg-red-50 transition-colors"
            title="Cancel"
          >
            <IoTrashOutline size={22} />
          </button>

<SendAudio audioUrl={audioUrl}/>

          {/* Send */}
          <button
            onClick={sendVoiceMessage}
            className="p-3 rounded-full bg-secondary text-white shadow-md hover:bg-[#008f72] transition-colors"
            title="Send voice message"
          >
            <IoSend size={18} className="ml-0.5" />
          </button>
        </div>
      </div>
    );
  }

  // RECORDING state: pulsing indicator + stop button
  if (recordingState === "recording") {
    return (
      <div className="flex-shrink-0 bg-[#f0f2f5] sm:p-3 p-2 border-t border-gray-200">
        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm gap-3">
          {/* Cancel */}
          <button
            onClick={cancelRecording}
            className="p-2 rounded-full bg-gray-100 text-red-500 hover:bg-red-50 transition-colors"
            title="Cancel recording"
          >
            <IoTrashOutline size={20} />
          </button>

          {/* Pulsing dot + timer */}
          <span className="flex items-center gap-2 flex-1">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse inline-block" />
            <span className="text-sm text-gray-200 font-medium tabular-nums">
              {formatTime(recordSeconds)}
            </span>
            <span className="text-xs text-gray-400">Recording…</span>
          </span>

          {/* Stop (goes to preview) */}
          <button
            onClick={stopRecording}
            className="p-3 rounded-full bg-[#00a884] text-white shadow-md hover:bg-[#008f72] transition-colors"
            title="Stop recording"
          >
            <IoStopCircleOutline size={20} />
          </button>
        </div>
      </div>
    );
  }

  // IDLE state: normal chat input
  return (
    <div className="flex-shrink-0 bg-[#f0f2f5] sm:p-3 p-2 flex items-center gap-1 border-t border-gray-200">
      <div className="flex items-center bg-white rounded-full px-3 py-1 flex-1 shadow-sm relative">
        <button
          onClick={() => fileInputRef.current.click()}
          className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <MdOutlineInsertPhoto size={28} />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*"
            className="hidden"
          />
        </button>

        {selectedFile && (
          <div className="absolute bottom-20 left-3 right-3 bg-white rounded-2xl shadow-lg border border-secondary p-3 z-10">
            {selectedType === "image" && (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="preview"
                className="w-full max-h-[40vh] object-contain rounded-xl"
              />
            )}
            {selectedType === "video" && (
              <video controls className="max-h-40 w-full rounded-xl">
                <source
                  src={URL.createObjectURL(selectedFile)}
                  type={selectedFile.type}
                />
              </video>
            )}
            <p className="text-sm text-gray-600 mt-2 truncate">
              {selectedFile.name}
            </p>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setSelectedType("");
                }}
                className="p-3 rounded-full bg-gray-300 text-sm"
              >
                <IoTrashOutline className="text-red-500 text-xl" />
              </button>
              <button
                onClick={() => {
                  onSendMedia(selectedFile, selectedType);
                  setSelectedFile(null);
                  setSelectedType("");
                }}
                className="p-3 rounded-full bg-[#00a884] text-white"
              >
                <IoSend className="text-xl" />
              </button>
            </div>
          </div>
        )}

        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTyping();
          }}
          placeholder="Type a message"
          className="flex-1 bg-transparent border-none px-2 py-2 focus:ring-0 outline-none text-[15px]"
        />
      </div>

      <button
        onClick={
          text.trim() || selectedFile ? handleSubmit : handleMicClick
        }
        className={`sm:p-3 p-2 rounded-full flex items-center justify-center transition-all shadow-md text-white bg-secondary`}
      >
        {text.trim() || selectedFile ? (
          <IoSend className="sm:ml-1 ml-0 sm:text-xl text-xl" />
        ) : (
          <IoMicOutline className="sm:text-xl text-xl" />
        )}
      </button>
    </div>
  );
};

export default ChatInput;