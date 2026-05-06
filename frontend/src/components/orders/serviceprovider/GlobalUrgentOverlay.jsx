import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSocket, connectSocket } from "../../../socket/socket"; 
import { claimBroadcastOrderThunk, getOrders } from "../../../store/orders/order-slice";
import { showToast } from "../../../utils/toastHelper";

const PREDEFINED_CATEGORIES = [
  "Plumbing", "Electrical", "Automotive / Mechanic", "Automotive", 
  "Mechanic", "Car Mechanic", "Auto Repair", "AC & Heating (HVAC)", 
  "AC & Heating", "HVAC"
];

const SMART_SKILL_SYNONYMS = {
  "Plumbing": ["pipe", "leak", "drain", "water heater", "plumber"],
  "Electrical": ["wire", "wiring", "light", "switch", "circuit", "electrician"],
  "Automotive / Mechanic": ["car", "engine", "brake", "tire", "auto", "vehicle", "diagnostic", "towing", "jumpstart", "battery"],
  "Automotive": ["car", "engine", "brake", "tire", "auto", "vehicle", "diagnostic", "towing", "jumpstart", "battery"],
  "Mechanic": ["car", "engine", "brake", "tire", "auto", "vehicle", "diagnostic", "towing", "jumpstart", "battery"],
  "Car Mechanic": ["car", "engine", "brake", "tire", "auto", "vehicle", "diagnostic", "towing", "jumpstart", "battery"],
  "Auto Repair": ["car", "engine", "brake", "tire", "auto", "vehicle", "diagnostic", "towing", "jumpstart", "battery"],
  "AC & Heating (HVAC)": ["ac", "cooling", "heat", "heating", "air condition", "ventilation", "hvac"],
  "AC & Heating": ["ac", "cooling", "heat", "heating", "air condition", "ventilation", "hvac"],
  "HVAC": ["ac", "cooling", "heat", "heating", "air condition", "ventilation", "hvac"]
};

const IncomingRequestCard = ({ request, onAccept, onIgnore }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hourlyRate, setHourlyRate] = useState("");
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (timeLeft <= 0) {
      onIgnore(request);
      return;
    }
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, onIgnore, request]);

  const handlePointerDown = (e) => {
    if (e.target.closest("button") || e.target.closest("input")) return; 
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      className="bg-white border border-[#FDE68A] shadow-lg rounded-2xl flex flex-col relative overflow-hidden pointer-events-auto touch-none select-none w-[26rem] max-w-[90vw]"
    >
      <div className="absolute top-0 left-0 h-1.5 bg-[#FDE68A] transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 30) * 100}%` }} />
      <div className={`p-6 flex flex-col gap-5 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}>
        <div className="flex justify-between items-start gap-4">
          <h4 className="text-base font-bold text-gray-900 leading-tight flex-1 truncate">
            {request.requestTitle || "Urgent Hiring Request"}
          </h4>
          <span className="text-xs font-mono font-medium text-gray-400 mt-0.5 flex-shrink-0">
            {new Date(request.createdAt).toLocaleTimeString("en-PK", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>

        <div className="space-y-1 text-sm text-gray-600">
          <p><span className="text-gray-400">Category:</span> {request.category || "General"}</p>
          <p className="font-bold text-red-600"><span className="text-gray-400 font-medium">Time Limit:</span> {request.responseTimeLimit}</p>
          <p className={!isExpanded ? "truncate" : ""}><span className="text-gray-400">Location:</span> {request.serviceLocation}</p>

          <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <div className="pt-3">
                <span className="text-gray-400 block mb-1 text-[10px] uppercase font-bold tracking-wider">Description</span>
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{request.requirements}</p>
              </div>
            </div>
          </div>

          {(request.requirements || request.serviceLocation?.length > 35) && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="text-[#166534] text-xs font-bold pt-2 hover:underline focus:outline-none"
            >
              {isExpanded ? "Show Less" : "Show More"}
            </button>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Propose Your Hourly Rate (Rs)</label>
          <input
            type="number" min="0" value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)} onClick={(e) => e.stopPropagation()} 
            placeholder="e.g., 1500"
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#166534] focus:ring-1 focus:ring-[#166534] transition-all bg-gray-50"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!hourlyRate || hourlyRate <= 0) { showToast("Please enter a valid hourly rate.", "error"); return; }
              onAccept(request, hourlyRate);
            }}
            className="flex-1 py-2.5 text-sm font-bold bg-[#166534] text-white rounded-xl shadow hover:bg-[#15803d] active:scale-95 transition-all"
          >
            ACCEPT IN {timeLeft} SEC
          </button>
          <button
            type="button" onClick={(e) => { e.stopPropagation(); onIgnore(request); }}
            className="px-6 py-2.5 text-sm font-bold bg-white text-gray-500 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            IGNORE
          </button>
        </div>
      </div>
    </div>
  );
};

const GlobalUrgentOverlay = () => {
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.serviceProviderProfile) || {}; 
  const dispatch = useDispatch();
  const [urgentRequests, setUrgentRequests] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "serviceprovider" || !profile) return;

    // ✅ Get the shared socket, or create it if the user just refreshed the page
    let socket = getSocket();
    if (!socket) {
      socket = connectSocket();
    }

    const providerSkills = profile.skills || [];
    const skillsString = providerSkills.map((s) => (typeof s === "object" ? s.name : s).toLowerCase()).join(" ");

    const handleNewRequest = (newRequest) => {
      const incomingCategory = newRequest.category || "";
      const categoryKeywords = incomingCategory.toLowerCase().split(/[\s,&()/]+/).filter((w) => w.length >= 2);
      
      const foundKey = Object.keys(SMART_SKILL_SYNONYMS).find(k => k.toLowerCase() === incomingCategory.toLowerCase());
      const mappedKeywords = foundKey ? SMART_SKILL_SYNONYMS[foundKey] : [];
      
      const allKeywordsToCheck = [...categoryKeywords, ...mappedKeywords];

      const isSkillMatch = allKeywordsToCheck.some((keyword) => {
        const regex = new RegExp(`\\b${keyword}`, "i");
        return regex.test(skillsString);
      });

      if (!isSkillMatch) {
        return;
      }

      setUrgentRequests((prev) => {
        if (prev.some((r) => r._id === newRequest._id)) return prev;
        return [newRequest, ...prev];
      });
    };

    // ✅ Listen for the backend event
    socket.on("new_urgent_request", handleNewRequest);

    return () => {
      socket.off("new_urgent_request", handleNewRequest);
    };
  }, [user, profile]);

  if (urgentRequests.length === 0) return null;

  return (
    <div className="fixed top-6 left-0 right-0 z-[9999] flex flex-col items-center gap-4 pointer-events-none">
      {urgentRequests.map((request) => (
        <IncomingRequestCard
          key={request._id}
          request={request}
          onAccept={async (req, hourlyRate) => {
            try {
              await dispatch(claimBroadcastOrderThunk({ orderId: req._id, hourlyRate })).unwrap();
              showToast("Urgent request claimed successfully!", "success");
              setUrgentRequests((prev) => prev.filter(r => r._id !== req._id));
              dispatch(getOrders({ status: "" })); 
            } catch (err) {
              showToast(err || "Failed to claim request.", "error");
              setUrgentRequests((prev) => prev.filter(r => r._id !== req._id));
            }
          }}
          onIgnore={(req) => setUrgentRequests((prev) => prev.filter(r => r._id !== req._id))}
        />
      ))}
    </div>
  );
};

export default GlobalUrgentOverlay;