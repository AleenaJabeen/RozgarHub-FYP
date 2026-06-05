import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; 
import { searchPublicGigs } from "../../store/customer/gigSearch-slice";
import { getCategories } from "../../store/serviceProvider/category-slice";
import { updateCustomerProfile } from "../../store/customer/profile-slice"; 
import CustomerGigCard from "../../components/customer/gigs/CustomerGigCard";
import { showToast } from "../../utils/toastHelper";
import { HiSearch, HiAdjustments } from "react-icons/hi";
import { MdOutlineWifiTethering, MdOutlineMyLocation } from "react-icons/md";
import { TbMoodEmpty } from "react-icons/tb";
import { IoLocationOutline } from "react-icons/io5";
import { FaBolt } from "react-icons/fa"; 
import RozgarHubLoader from '../../components/layout/Loader'

import { MapModal } from "../../components/serviceprovider/profile/LocationPickerMap"; 


const SORT_OPTIONS = [
  { label: "Top Rated",           value: "rating_desc"  },
  { label: "Most Reviewed",       value: "reviews_desc" },
  { label: "Price: Low to High",  value: "price_asc"    },
  { label: "Price: High to Low",  value: "price_desc"   },
];

const Services = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate(); 
  const gridRef    = useRef(null);

  const { gigs = [], loading, error } = useSelector((state) => state.gigSearch);
  const { categories = [] }           = useSelector((state) => state.categories);
  const { user }                      = useSelector((state) => state.auth); 

  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [nearby,     setNearby]     = useState(false); 
  const [sortBy,     setSortBy]     = useState("rating_desc");

  const [isUpdatingLoc, setIsUpdatingLoc] = useState(false);
  const [showMapModal, setShowMapModal]   = useState(false); 
  
  const [coords, setCoords] = useState(() => {
    if (user?.location?.currentLocation?.coordinates) {
      return {
         longitude: user.location.currentLocation.coordinates[0],
         latitude: user.location.currentLocation.coordinates[1]
      };
    }
    return null;
  });

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const buildAndDispatch = useCallback(() => {
    const filters = {};
    if (search.trim()) filters.search   = search.trim();
    if (category)      filters.category = category;
    if (availableOnly) filters.status   = "available";
    if (sortBy)        filters.sortBy   = sortBy;
    
    if (nearby) {
      if (!coords) {
        showToast("Please set your location first to find nearby services.", "error");
        setNearby(false); 
        setShowMapModal(true); 
      } else {
        filters.nearby = true;
        filters.longitude = coords.longitude;
        filters.latitude = coords.latitude;
      }
    }

    dispatch(searchPublicGigs(filters));
  }, [dispatch, search, category, availableOnly, sortBy, nearby, coords]);

  useEffect(() => {
    const id = setTimeout(buildAndDispatch, search ? 400 : 0);
    return () => clearTimeout(id);
  }, [buildAndDispatch, search]);

  useEffect(() => {
    if (!loading && gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading]);

  const handleMapConfirm = async (loc) => {
    setShowMapModal(false);
    setIsUpdatingLoc(true);
    try {
      await dispatch(updateCustomerProfile({ longitude: loc.lng, latitude: loc.lat })).unwrap();
      setCoords({ longitude: loc.lng, latitude: loc.lat });
      showToast("Location updated successfully!", "success");
    } catch(err) {
      showToast("Failed to save location to profile.", "error");
    }
    setIsUpdatingLoc(false);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setAvailableOnly(false);
    setNearby(false);
    setSortBy("rating_desc");
  };

  const hasActiveFilters = search || category || availableOnly || nearby || sortBy !== "rating_desc";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Our Services
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Discover skilled local professionals ready to help — today.
              </p>
            </div>
            
            <button
              onClick={() => navigate("/customer/place-order", { 
                state: { bookingType: 'urgent', isBroadcast: true } 
              })}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0d7a5f] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#095c47] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex-shrink-0"
            >
              <FaBolt className="text-amber-400" />
              Broadcast Urgent Request
            </button>
          </div>

          <div className="max-w-2xl relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a service, skill, or provider..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-full bg-gray-50 hover:bg-white shadow-sm focus:bg-white focus:outline-none focus:border-[#0d7a5f] focus:ring-2 focus:ring-[#0d7a5f]/10 transition-all text-sm"
            />
          </div>

        </div>
      </div>

      {/* ── Sticky Filter Bar ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-shrink-0 px-4 py-2 text-sm font-medium border border-gray-200 rounded-full bg-white text-gray-700 focus:outline-none focus:border-[#0d7a5f] transition-colors cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>

            <button
              onClick={() => setNearby((v) => !v)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border transition-all ${
                nearby
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600"
              }`}
            >
              <IoLocationOutline className="text-base" />
              Nearby Services
            </button>

            <button
              onClick={() => setAvailableOnly((v) => !v)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border transition-all ${
                availableOnly
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600"
              }`}
            >
              <MdOutlineWifiTethering className={`text-base ${availableOnly ? "animate-pulse" : ""}`} />
              Available Now
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-shrink-0 px-4 py-2 text-sm font-medium border border-gray-200 rounded-full bg-white text-gray-700 focus:outline-none focus:border-[#0d7a5f] transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowMapModal(true)}
              disabled={isUpdatingLoc}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isUpdatingLoc ? (
                <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdOutlineMyLocation className="text-sm text-gray-600" />
              )}
              {coords ? "Update Location" : "Set My Location"}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex-shrink-0 px-4 py-2 text-xs font-bold text-gray-400 border border-dashed border-gray-300 rounded-full hover:border-red-300 hover:text-red-400 transition-all"
              >
                Clear All
              </button>
            )}

            {!loading && (
              <span className="ml-auto flex-shrink-0 text-xs font-medium text-gray-400 pr-1 whitespace-nowrap">
                {gigs.length} result{gigs.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div
        ref={gridRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-16"
      >
        {loading && (
          <RozgarHubLoader/>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <HiAdjustments className="text-red-400 text-2xl" />
            </div>
            <p className="text-red-500 font-semibold text-sm">{error}</p>
            <button
              onClick={buildAndDispatch}
              className="mt-4 px-6 py-2 text-sm font-bold text-white bg-[#0d7a5f] rounded-full hover:bg-[#095c47] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && gigs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <TbMoodEmpty className="text-gray-200 text-7xl mb-4" />
            <p className="text-gray-500 font-bold text-lg">No services found</p>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">
              {hasActiveFilters
                ? "Try adjusting your filters or clearing the search."
                : "No gigs are available right now. Check back soon!"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-5 px-6 py-2 text-sm font-bold text-[#0d7a5f] border border-[#0d7a5f] rounded-full hover:bg-[#0d7a5f] hover:text-white transition-all duration-200"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && gigs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gigs.map((gig) => (
              <CustomerGigCard key={gig._id} gig={gig} />
            ))}
          </div>
        )}
      </div>

      {showMapModal && (
        <MapModal
          onConfirm={handleMapConfirm}
          onClose={() => setShowMapModal(false)}
          initialLatLng={coords ? { lat: coords.latitude, lng: coords.longitude } : null}
        />
      )}

    </div>
  );
};

export default Services;