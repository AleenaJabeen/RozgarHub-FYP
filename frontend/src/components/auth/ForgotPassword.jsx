import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../store/auth-slice";
import { showToast } from "../../utils/toastHelper";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClose = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const data = await dispatch(resetPassword(email)).unwrap();

      showToast(data.message);
      setSubmitted(true);
    
    } catch (error) {
      showToast(error, "error");
    }finally{
      setLoading(false);
    }
    setTimeout(() => {
      handleClose();
    }, 3000);

    
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50  p-4">
      <div className="bg-primary rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-tertiary hover:text-gray-600"
        >
          <IoClose />
        </button>

        <h2 className="text-tertiary text-xl font-semibold mb-4">
          Reset Password
        </h2>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className={`w-full px-4 py-2 rounded-full border ${
                error? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-secondary/50`}
            />
            {error && (
              <p className="text-red-500 text-xs ml-4">{error}</p>
            )}

            <button
              type="submit"
               disabled={loading}
              className="cursor-pointer w-full px-6 disabled:opacity-50 disabled:cursor-not-allowed py-2 bg-secondary text-white rounded-full hover:opacity-90 transition-opacity"
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">
              Email sent to <strong>{email}</strong>. Check your inbox!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
