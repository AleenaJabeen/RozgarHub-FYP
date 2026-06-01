import { useNavigate } from "react-router-dom";
import { IoStar } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";

const GigCard = ({ gig }) => {
  const navigate = useNavigate();
  console.log("GigCard Rendered with gig:", gig);

  const handleEdit = (e) => {
    e.stopPropagation();

    navigate(`/serviceprovider/gig-details/${gig._id}`, {
      state: {
        editMode: true,
      },
    });
  };

  return (
    <div className="relative cursor-pointer bg-primary border border-gray-300 shadow-xl shadow-gray-300 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
      <button
        onClick={handleEdit}
        className="absolute cursor-pointer top-4 right-4 z-20  backdrop-blur-sm p-2 rounded-full shadow-lg  bg-secondary text-white transition-all transform active:scale-95 border border-white/50"
        title="Edit Service"
      >
        <MdOutlineEdit size={20} />
      </button>
      {/* Image & Status Badge */}
      <div className="h-44 bg-gray-100">
        <img
          src={gig.images?.[0]?.url}
          alt={gig.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div
        onClick={() => navigate(`/serviceprovider/gig-details/${gig._id}`)}
        className="p-4 flex flex-col grow space-y-3"
      >
        {/* Provider Name Only */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <span className="text-[10px] font-bold text-gray-500 uppercase">
              {gig.serviceProviderId?.user?.name?.charAt(0) ||
                gig.serviceProviderId?.name?.charAt(0) ||
                "P"}
            </span>
          </div>
          <p className="text-xs font-bold text-gray-800 capitalize">
            {gig.serviceProviderId?.user?.name || gig.serviceProviderId?.name}
          </p>
        </div>

        {/* Title */}
        <h3 className="font-bold cursor-pointer text-base leading-tight h-10 line-clamp-2 text-gray-900">
          {gig.title}
        </h3>

      </div>
    </div>
  );
};

export default GigCard;
