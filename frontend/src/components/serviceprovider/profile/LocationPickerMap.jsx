import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaLocationCrosshairs, FaMapLocationDot } from "react-icons/fa6";
import { FiSearch, FiX, FiCheck, FiMapPin } from "react-icons/fi";


// ─── Fix Leaflet's default icon paths broken by bundlers ──────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Custom green pin icon ─────────────────────────────────────────────────
const greenIcon = L.divIcon({
  className: "",
  html: `<div style="width:36px;height:44px;display:flex;align-items:center;justify-content:center;">
    <svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:44px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.35))">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#0D7A5F"/>
      <circle cx="18" cy="18" r="8" fill="white"/>
      <circle cx="18" cy="18" r="4" fill="#0D7A5F"/>
    </svg>
  </div>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
});

// ─── Reverse geocode ───────────────────────────────────────────────────────
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en", "User-Agent": "RozgarHub/1.0" } },
    );
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

// ─── Forward search ────────────────────────────────────────────────────────
async function searchPlaces(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      { headers: { "Accept-Language": "en", "User-Agent": "RozgarHub/1.0" } },
    );
    return await res.json();
  } catch {
    return [];
  }
}

// ─── Listens to map clicks ─────────────────────────────────────────────────
function ClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// ─── Flies map to new position ─────────────────────────────────────────────
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 16, { duration: 1 });
  }, [target, map]);
  return null;
}

// ─── Fixes Leaflet container size after modal paint ───────────────────────
function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 150);
  }, [map]);
  return null;
}

// ─── Map Modal ─────────────────────────────────────────────────────────────
export function MapModal({ onConfirm, onClose, initialLatLng }) {
  const DEFAULT = { lat: 33.6844, lng: 73.0479 }; // Rawalpindi
  const [pin, setPin] = useState(initialLatLng ?? DEFAULT);
  const [flyTarget, setFlyTarget] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const moveTo = async (lat, lng) => {
    setPin({ lat, lng });
    setFlyTarget({ lat, lng });
    setLoading(true);
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    setLoading(false);
  };

  // Load initial address once
  useEffect(() => {
    reverseGeocode(pin.lat, pin.lng).then(setAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    setResults(await searchPlaces(searchQ));
    setSearching(false);
  };

  const pickResult = async (r) => {
    setResults([]);
    setSearchQ(r.display_name); // ✅ fill search bar with selected place name
    await moveTo(parseFloat(r.lat), parseFloat(r.lon));
  };

 const handleLocate = () => {
  if (!navigator.geolocation) {
    setLocationError("Geolocation is not supported by your browser.");
    return;
  }

  setLocating(true);
  setPermissionDenied(false);
  setLocationError("");

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      await moveTo(coords.latitude, coords.longitude);

      const addr = await reverseGeocode(
        coords.latitude,
        coords.longitude
      );

      setSearchQ(addr);
      setLocating(false);
    },

    (error) => {
      setLocating(false);

      switch (error.code) {
        case error.PERMISSION_DENIED:
           setPermissionDenied(true);
          setLocationError(
  "Location permission is blocked.");
          break;

        case error.POSITION_UNAVAILABLE:
          setLocationError(
            "Location information is unavailable. Make sure GPS is enabled."
          );
          break;

        case error.TIMEOUT:
          setLocationError(
            "Location request timed out. Please try again."
          );
          break;

        default:
          setLocationError(
            "Unable to determine your location."
          );
      }
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "min(680px,90%)", height: "min(580px,90vh)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FaMapLocationDot className="text-secondary text-xl" />
            <span className="font-semibold text-gray-800 text-sm">
              Set Your Location
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <FiX className="text-lg" />
          </button>
        </div>
       {/* Search */}
<div className="px-4 py-3 border-b border-gray-100 relative z-[1000]">
  <div className="flex flex-col sm:flex-row gap-2">
    
    {/* Search Input */}
    <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-2xl sm:rounded-full px-3 py-2 focus-within:ring-2 focus-within:ring-green-400/40 focus-within:border-green-400 transition-all">
      <FiSearch className="text-gray-400 flex-shrink-0" />

      <input
        type="text"
        className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 min-w-0"
        placeholder="Search a place, area, or address…"
        value={searchQ}
        onChange={(e) => setSearchQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />

      {searchQ && (
        <button
          type="button"
          onClick={() => {
            setSearchQ("");
            setResults([]);
          }}
          className="flex-shrink-0"
        >
          <FiX className="text-gray-400 hover:text-gray-600" />
        </button>
      )}
  
    </div>

    {/* Action Buttons */}
    <div className="flex gap-2 sm:w-auto w-full">
      
      {/* Locate Me */}
      <button
        type="button"
        onClick={handleLocate}
        disabled={locating}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-2xl sm:rounded-full text-secondary hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <FaLocationCrosshairs
          className={`${locating ? "animate-spin" : ""}`}
        />

        <span className="text-sm font-medium whitespace-nowrap">
          {locating ? "Locating…" : "Locate me"}
        </span>
      </button>

      {/* Search */}
      <button
        onClick={handleSearch}
        disabled={searching}
        className="flex-1 sm:flex-none px-5 py-2 bg-secondary text-white rounded-2xl sm:rounded-full text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {searching ? "..." : "Search"}
      </button>
    </div>
    
  </div>
    {permissionDenied && (
              <div className="w-full mt-3 px-6 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 shadow-sm animate-[fadeIn_0.3s_ease-out]">
                <p className="text-xs text-red-700 font-medium leading-relaxed">
                  <span className="font-bold block mb-0.5">Location Access Blocked!</span> 
                  Please click the <span className="font-bold">Lock icon (🔒)</span> or <span className="font-bold">Site settings</span> in your browser's address bar to allow location access, then click the target icon again.
                </p>
              </div>
            )}

  {/* Results */}
  {results.length > 0 && (
    <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      {results.map((r, i) => (
        <button
          key={i}
          onClick={() => pickResult(r)}
          className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0"
        >
          <FiMapPin className="text-green-600 mt-0.5 flex-shrink-0" />

          <span className="text-sm text-gray-700 leading-snug">
            {r.display_name}
          </span>
        </button>
      ))}
    </div>
  )}
</div>
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[pin.lat, pin.lng]}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            <Marker
              position={[pin.lat, pin.lng]}
              icon={greenIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  moveTo(lat, lng);
                },
              }}
            />
            <ClickHandler onMapClick={moveTo} />
            <FlyTo target={flyTarget} />
            <InvalidateSize />
          </MapContainer>

          {/* Hint */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[999] bg-white/90 backdrop-blur-sm text-xs text-gray-500 px-3 py-1.5 rounded-full shadow border border-gray-100 pointer-events-none">
            Tap map or drag pin to set location
          </div>
        </div>

        {/* Footer  */}
         <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          <FiMapPin className="text-secondary flex-shrink-0 text-xl" />
          <p className="flex-1 text-sm text-gray-700 truncate min-w-0">
            {loading ? (
              <span className="text-gray-400 animate-pulse">Fetching address…</span>
            ) : (
              address || "Move the pin to your location"
            )}
          </p>
          <button
           onClick={() => onConfirm({ lat: pin.lat, lng: pin.lng, displayName: address })}
            disabled={loading || !address}
            className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <FiCheck />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LocationPickerMap({ value, onChange, error }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="space-y-1 mt-4">
        <label className="block text-sm font-semibold text-gray-700 ml-1">
          Location
        </label>
        <div
          className={`flex md:w-1/2 w-full items-center gap-2 px-4 py-2.5 border rounded-full cursor-pointer ${
            error ? "border-red-500" : "border-gray-300"
          } hover:border-secondary  focus-within:ring-2 focus-within:ring-secondary transition-all bg-white`}
          onClick={() => setOpen(true)}
        >
          <input
            type="text"
            placeholder="Tap to set your location on map"
           value={
  value?.displayName
    ? value.displayName
    : value?.lat != null && value?.lng != null
    ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
    : ""
}
            readOnly
            className="flex-1 focus:outline-none text-sm bg-transparent text-gray-700 cursor-pointer"
          />
          <button
            type="button"
            title="Pick location on map"
            className="cursor-pointer text-secondary hover:text-green-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <FaLocationCrosshairs className="text-lg" />
          </button>
        </div>

        {error && <p className="text-red-500 text-xs ml-2">{error}</p>}
      </div>

      {open && (
        <MapModal
          // onConfirm call — add address
         onConfirm={(loc) => {
      onChange(loc);   // pass full { lat, lng, displayName } up
      setOpen(false);  // close the modal
    }}
          onClose={() => setOpen(false)}
          initialLatLng={value?.lat != null ? value : null}
        />
      )}
    </>
  );
}
