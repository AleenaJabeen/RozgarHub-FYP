import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchPublicGigs } from "../../store/customer/gigSearch-slice";
import { getCategories } from "../../store/serviceProvider/category-slice";
import CustomerGigCard from "../../components/customer/gigs/CustomerGigCard";
import { HiSearch, HiAdjustments } from "react-icons/hi";
import { MdOutlineWifiTethering } from "react-icons/md";
import { TbMoodEmpty } from "react-icons/tb";
import { IoCalendarOutline, IoTimeOutline } from "react-icons/io5";

const SORT_OPTIONS = [
  { label: "Top Rated",           value: "rating_desc"  },
  { label: "Most Reviewed",       value: "reviews_desc" },
  { label: "Price: Low to High",  value: "price_asc"    },
  { label: "Price: High to Low",  value: "price_desc"   },
];

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const Services = () => {
  const dispatch   = useDispatch();
  const gridRef    = useRef(null);

  const { gigs = [], loading, error } = useSelector((state) => state.gigSearch);
  const { categories = [] }           = useSelector((state) => state.categories);

  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy,     setSortBy]     = useState("rating_desc");
  const [day,        setDay]        = useState("");
  const [time,       setTime]       = useState("");

  // ── Fetch categories once on mount ───────────────────────────────────────
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  // ── Build filters and fetch gigs ─────────────────────────────────────────
  const buildAndDispatch = useCallback(() => {
    const filters = {};
    if (search.trim()) filters.search   = search.trim();
    if (category)      filters.category = category;
    if (availableOnly) filters.status   = "available";
    if (sortBy)        filters.sortBy   = sortBy;
    if (day)           filters.day      = day;
    if (time)          filters.time     = time;
    dispatch(searchPublicGigs(filters));
  }, [dispatch, search, category, availableOnly, sortBy, day, time]);

  // Debounce search; fire immediately for all other filter changes
  useEffect(() => {
    const id = setTimeout(buildAndDispatch, search ? 400 : 0);
    return () => clearTimeout(id);
  }, [buildAndDispatch, search]);

  // ── Smooth scroll to top of grid on each new result set ─────────────────
  useEffect(() => {
    if (!loading && gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setAvailableOnly(false);
    setSortBy("rating_desc");
    setDay("");
    setTime("");
  };

  const hasActiveFilters =
    search || category || availableOnly || sortBy !== "rating_desc" || day || time;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Our Services
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Discover skilled local professionals ready to help — today.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a service, skill, or provider..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-full bg-white shadow-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Sticky Filter Bar ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-none">

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-shrink-0 px-4 py-2 text-sm font-medium border border-gray-200 rounded-full bg-white text-gray-700 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>

            {/* Available Now Toggle */}
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

            {/* Day filter */}
            <div className="flex-shrink-0 flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-2 bg-white focus-within:border-secondary transition-colors">
              <IoCalendarOutline className="text-gray-400 text-sm" />
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="">Any Day</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Time filter */}
            <div className="flex-shrink-0 flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-2 bg-white focus-within:border-secondary transition-colors">
              <IoTimeOutline className="text-gray-400 text-sm" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-shrink-0 px-4 py-2 text-sm font-medium border border-gray-200 rounded-full bg-white text-gray-700 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex-shrink-0 px-4 py-2 text-xs font-bold text-gray-400 border border-dashed border-gray-300 rounded-full hover:border-red-300 hover:text-red-400 transition-all"
              >
                Clear All
              </button>
            )}

            {/* Result count */}
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

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <HiAdjustments className="text-red-400 text-2xl" />
            </div>
            <p className="text-red-500 font-semibold text-sm">{error}</p>
            <button
              onClick={buildAndDispatch}
              className="mt-4 px-6 py-2 text-sm font-bold text-white bg-secondary rounded-full hover:bg-[#0e5641] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
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
                className="mt-5 px-6 py-2 text-sm font-bold text-secondary border border-secondary rounded-full hover:bg-secondary hover:text-white transition-all duration-200"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Gig Grid */}
        {!loading && !error && gigs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gigs.map((gig) => (
              <CustomerGigCard key={gig._id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
