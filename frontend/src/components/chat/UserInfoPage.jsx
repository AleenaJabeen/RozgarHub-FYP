import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  IoArrowBack,
  IoMailOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoStar,
} from "react-icons/io5";
import {
  fetchUserInfo,
  clearSelectedProfile,
} from "../../store/chat/chatSlice";
import { capitalizeWords } from "../../utils/capitalize";
import RozgarHubLoader from "../layout/Loader";

const UserInfoPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedUserProfile: user, profileLoading } = useSelector(
    (state) => state.chats,
  );

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserInfo(userId));
    }
    return () => dispatch(clearSelectedProfile());
  }, [dispatch, userId]);
  console.log(user);

  if (profileLoading) {
    return (
    <RozgarHubLoader/>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-500 font-medium">User profile not found</p>
        <button
          onClick={() => navigate(-1)}
          className="text-secondary font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isProvider = user.role === "serviceprovider";

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <IoArrowBack size={24} className="text-tertiary" />
        </button>
        <h1 className="md:text-3xl text-xl font-medium text-secondary">
          Profile Details
        </h1>
      </div>

      <div className="w-[95%] mx-auto px-4 mt-6">
        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover/Avatar Section */}
          <div className="h-24 bg-gradient-to-r from-secondary to-secondary/80 w-full" />
          <div className="flex flex-col items-center -mt-12 md:px-6 px-4 pb-6">
            {user.avatar? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-48 h-48 rounded-full object-cover border-4 border-gray-300 shadow-lg bg-white"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-4xl font-bold text-white text-center">
                  {capitalizeWords(user?.name.charAt(0))}
                </span>
              </div>
            )}

            <div className="text-center mt-4">
              <div className="flex items-center justify-center gap-1">
                <h2 className="text-2xl font-extrabold text-gray-900">
                  {capitalizeWords(user?.name)}
                </h2>
                {user.isPhoneVerified && (
                  <IoCheckmarkCircle className="text-secondary" size={20} />
                )}
              </div>
              <span
                className={`inline-block mt-1 px-3 py-0.5 rounded-full text-sm font-bold uppercase tracking-wider text-secondary`}
              >
                {user.role}
              </span>
            </div>

            {/* Provider Quick Stats */}
            {isProvider && (
              <div className="flex gap-8 mt-6 w-full border-y border-gray-50 py-4 justify-center">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-amber-500 justify-center">
                    <IoStar size={18} />
                    <span className="font-bold text-gray-900">
                      {user.professionalDetails?.averageRating || "0.0"}
                    </span>
                  </div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Rating
                  </p>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="text-center">
                  <span className="font-bold text-gray-900">
                    {user.professionalDetails?.completedOrders || 0}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Jobs Done
                  </p>
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="w-full mt-6 space-y-4">
              <div className="flex items-start gap-4 md:p-4 p-3 rounded-2xl bg-gray-50/50 border border-gray-50">
                <IoMailOutline className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                    Email Address
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-50">
                <IoLocationOutline className="text-gray-400 mt-1" size={20} />{" "}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                    Location
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {user?.location?.address?.city},
                    {user?.location?.address?.country}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-50">
                <IoCalendarOutline className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                    Member Since
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString("en-PK", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Bio Section for Providers */}
              {isProvider && user.professionalDetails?.bio && (
                <div className="mt-2 w-full">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tight mb-2 ml-1">
                    About
                  </p>
                  <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 text-gray-700 text-sm italic leading-relaxed">
                    {user.professionalDetails.bio}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-6 bg-secondary/90 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-secondary transition-all active:scale-[0.98]"
        >
          Return to Chat
        </button>
      </div>
    </div>
  );
};

export default UserInfoPage;
