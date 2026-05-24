import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitReview } from "../../../store/customer/review-slice"; // Adjust path
import { showToast } from "../../../utils/toastHelper";
import { FaStar } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const ReviewModal = ({ isOpen, onClose, orderId, providerName, onSuccess }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.reviews);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      showToast("Please select a star rating.", "error");
      return;
    }

    try {
      await dispatch(submitReview({ orderId, rating, comment })).unwrap();
      showToast("Thank you for your feedback!", "success");
      if (onSuccess) onSuccess(); // Trigger re-fetch of order to hide the button
      onClose();
    } catch (err) {
      showToast(err || "Failed to submit review.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Leave a Review</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-gray-600">
              How was your experience with <span className="text-[#0d7a5f] capitalize">{providerName || "this provider"}</span>?
            </p>
            
            {/* Interactive Stars */}
            <div className="flex justify-center gap-2 pt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transform transition-transform hover:scale-110 active:scale-95"
                >
                  <FaStar
                    className={`text-4xl transition-colors duration-200 ${
                      star <= (hoverRating || rating)
                        ? "text-amber-400 drop-shadow-sm"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 font-medium h-4 mt-1">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Optional Comment */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              Written Review <span className="text-gray-400 font-normal normal-case">(Optional)</span>
            </label>
            <textarea
              rows="4"
              placeholder="Tell others what it was like working with them..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7a5f]/20 focus:border-[#0d7a5f] transition-all text-sm font-medium text-gray-800 bg-gray-50/50 focus:bg-white resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1.5 text-right">
              {comment.length} / 1000
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || rating === 0}
              className={`w-full py-3.5 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm ${
                loading || rating === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#0d7a5f] hover:bg-[#0e5641] active:scale-[0.98] shadow-[#0d7a5f]/20"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;