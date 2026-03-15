import React, { useEffect } from "react";
import GigCard from "../../components/serviceprovider/gig/GigCard";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMyGigs } from "../../store/serviceProvider/gig-slice";

function Gig() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { gigs, loading } = useSelector((state) => state.gigs);

  useEffect(() => {
    dispatch(getMyGigs());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary">Gigs</h1>

        <button
          className="bg-secondary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-opacity-90 transition-all text-sm"
          onClick={() => navigate("/serviceprovider/createGig")}
        >
          Create new Gig
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-500">Loading gigs...</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-18">
        {gigs?.map((gig) => (
          <GigCard key={gig._id} gig={gig} />
        ))}
      </div>
    </div>
  );
}

export default Gig;