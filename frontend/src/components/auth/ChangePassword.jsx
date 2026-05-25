import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { CiLock } from "react-icons/ci";
import { resetPasswordConfirm , verifyResetToken} from "../../store/auth-slice";
import { showToast } from "../../utils/toastHelper";
import { PasswordStrengthBar } from "./PasswordStrengthBar"; // ✅ adjust path if needed

function ChangePassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
   const [tokenValid, setTokenValid] = useState(null);

  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };
useEffect(() => {
  const checkToken = async () => {
    try {
      await dispatch(verifyResetToken(token)).unwrap();
      setTokenValid(true);
    } catch {
      setTokenValid(false);
    }
  };
  checkToken();
}, [token]);

  const validate = () => {
    let newErrors = {};

    // ✅ Check all 5 strength criteria instead of just length
    const meetsAllCriteria =
      formData.password.length >= 8 &&
      /[A-Z]/.test(formData.password) &&
      /[a-z]/.test(formData.password) &&
      /[0-9]/.test(formData.password) &&
      /[!@#$%^&*]/.test(formData.password);

    if (!meetsAllCriteria) {
      newErrors.password = "Password does not meet all requirements.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const data = await dispatch(
        resetPasswordConfirm({ token, password: formData.password })
      ).unwrap();
      showToast(data.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      showToast(err || "Failed to reset password", "error");
    }
    
  };
  if (tokenValid === null) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-primary rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <p className="text-gray-500">Verifying your link...</p>
        </div>
      </div>
    );
  }
 if (tokenValid === false) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-primary rounded-2xl shadow-2xl w-full max-w-md p-8 text-center space-y-4">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <CiLock className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-tertiary">Link Expired or Invalid</h2>
          <p className="text-gray-500 text-sm">
            This password reset link has expired or is no longer valid.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-secondary text-white rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-primary rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <div className="text-center mb-8">
          <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CiLock className="text-secondary" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-tertiary">Set New Password</h2>
          <p className="text-gray-500 text-sm mt-2">
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
            </button>

            {/* ✅ Strength bar appears as soon as user starts typing */}
            {formData.password && (
              <PasswordStrengthBar password={formData.password} />
            )}

            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-2">{errors.password}</p>
            )}
          </div>

          <div>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 ml-2">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="cursor-pointer w-full py-3 bg-secondary text-white rounded-xl font-semibold shadow-lg shadow-secondary/30 hover:opacity-90 transition-all"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );

}

export default ChangePassword;