import React, { useEffect } from "react";
import GigCard from "../../components/serviceprovider/gig/GigCard";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMyGigs } from "../../store/serviceProvider/gig-slice";
import EmptyGigState from "../../components/serviceprovider/gig/EmptyGigState";
import { showToast } from "../../utils/toastHelper";
import RozgarHubLoader from "../../components/layout/Loader";

function Gig() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { gigs = [], loading } = useSelector((state) => state.gigs);

  useEffect(() => {
    dispatch(getMyGigs());
  }, [dispatch]);

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-semibold text-secondary">Gigs</h1>

        {/* Only show this button if there are already gigs; otherwise EmptyState handles it */}
        {gigs.length > 0 && (
          <button
            className="bg-secondary text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            onClick={() => {
              if (gigs.length >= 4) {
                showToast("Maximum 4 gigs allowed", "error");
                return;
              }

              navigate("/serviceprovider/createGig");
            }}
          >
            Create New Gig
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <RozgarHubLoader/>
      ) : gigs.length === 0 ? (
        /* Empty State */
        <EmptyGigState />
      ) : (
        /* Gigs Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {gigs.map((gig) => (
            <GigCard key={gig._id} gig={gig} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Gig;
