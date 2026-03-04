// utils/toastHelper.js
import { toast } from 'react-toastify';

const toastConfig = {
  position: "bottom-right",
  autoClose: 3000,
  style: {
    fontSize: "16px",
    fontWeight: "bold",
    fontFamily: "'Inter', sans-serif",
    padding: "15px",
    backgroundColor: "#ffffff",
    textAlign: "center",
  },
};

export const showToast = (message, type = 'success') => {
  const options = {
    ...toastConfig,
    style: {
      ...toastConfig.style,
      color: type === 'success' ? "#0D7A5F" : "#D32F2F", // Green for success, Red for error
    }
  };

  if (type === 'success') toast.success(message, options);
  else toast.error(message, options);
};