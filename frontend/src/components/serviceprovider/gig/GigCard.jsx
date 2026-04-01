import {useNavigate} from "react-router-dom";
import { IoStar } from "react-icons/io5";

const GigCard = ({ gig }) => {
    const navigate = useNavigate();
    console.log("GigCard Rendered with gig:", gig);

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
            {/* Image & Status Badge */}
            <div className="h-44 bg-gray-100">
                <img
                    src={gig.images?.[0]?.url}
                    alt={gig.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col grow space-y-3">
                {/* Provider Name Only */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                            {gig.serviceProviderId?.name?.charAt(0) || "A"}
                        </span>
                    </div>
                    <p className="text-xs font-bold text-gray-800">{gig.serviceProviderId?.name}</p>
                </div>

                {/* Title */}
                <h3 onClick={() => navigate(`/serviceprovider/gig-details/${gig._id}`)} className="font-bold cursor-pointer text-base text-center leading-tight h-10 line-clamp-2 text-gray-900">
                    {gig.title}
                </h3>

                {/* Stats & Availability Row */}
                <div className="flex justify-between items-start text-[11px]">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-orange-500 font-bold">
                            <IoStar size={13} />
                            {gig.averageRating} <span className="text-gray-400 font-normal">({gig.totalReviews})</span>
                        </div>
                        <div className="text-gray-500 font-medium">
                            {gig.totalOrders} {gig.categoryId?.name} Tasks
                        </div>
                    </div>
                    
                    {/* Availability Time from wireframe */}
                    <div className="text-right">
                        <p className="text-gray-400 font-medium leading-tight">Available btw</p>
                        <p className="text-gray-800 font-bold">{gig.availabilityHours?.[0].startTime} - {gig.availabilityHours?.[0].endTime}</p>
                    </div>
                </div>

                <div className="h-px bg-gray-100 w-full mt-auto" />

                {/* Pricing Row */}
                <div className="flex justify-between items-end pt-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Inspection</span>
                        <span className="text-sm font-bold text-gray-700">Pkr {gig.inspectionRate}</span>
                    </div>
                    <div className="text-right flex flex-col">
                        <span className="font-extrabold text-secondary text-lg leading-none">
                            Pkr {gig.hourlyRate}
                            <span className="text-[10px] font-normal text-gray-400 ml-1">/hr</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GigCard;