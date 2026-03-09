import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { loginUser, sendEmailOTP, verifyEmailOTP } from "../../store/auth-slice";
import { showToast } from "../../utils/toastHelper";
import { useNavigate } from "react-router-dom";

const MAX_ATTEMPTS = 3;

const VerifyEmailModal = ({ email,password, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate=useNavigate();
  const timerRef = useRef(null);

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);

  const startTimer = () => {
    setCanResend(false);
    setTimer(60);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  
  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6)
      return showToast("Enter valid 6 digit OTP", "error");

    try {
      const data = await dispatch(
        verifyEmailOTP({ email, otp })
      ).unwrap();

      showToast(data.message);
      const loginData = await dispatch(loginUser({ email, password })).unwrap();
      onClose();

      if (loginData.user?.role && loginData.user.role !== "pending") {
        navigate(loginData.user.role === "customer" ? "/customer/home" : "/serviceprovider/");
      } else {
        navigate("/choose-role");
      }
      
    } catch (error) {
      showToast(error, "error");
    }
  };

  const handleResend = async () => {
  if (resendAttempts >= MAX_ATTEMPTS) {
    showToast("Maximum resend attempts reached. Please try again later.", "error");
    onClose();
    return;
  }

  try {
    await dispatch(sendEmailOTP(email)).unwrap();
    setResendAttempts((prev) => prev + 1);
    showToast(`OTP Resent (${resendAttempts + 1}/${MAX_ATTEMPTS})`);
    startTimer();
  } catch (error) {
    showToast(error, "error");
  }
};

  // ✅ Only handles timer
  // ✅ Send OTP when modal opens
useEffect(() => {
  if (!isOpen) return;

  const sendOtp = async () => {
    try {
      await dispatch(sendEmailOTP(email)).unwrap();
      showToast("OTP sent to your email");
    } catch (error) {
      showToast(error, "error");
    }
  };

  sendOtp();
  startTimer();

  return () => clearInterval(timerRef.current);
}, [isOpen]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-primary rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Verify Your Email
        </h2>

        <p className="text-gray-500 text-sm text-center mb-6">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-tertiary">
            {email}
          </span>
        </p>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
            className="w-full border rounded-lg px-4 py-3 text-center text-xl tracking-[0.5em] font-mono"
            placeholder="000000"
          />

          <button
            type="submit"
            className="w-full bg-secondary text-white py-3 rounded-full mt-4"
          >
            Verify Email
          </button>
        </form>

        <div className="text-center mt-6">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-secondary font-semibold hover:underline"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-gray-600">
              Resend in {timer}s
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailModal;