import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/v1/auth/me", {
          withCredentials: true,
        });

        const user = res.data.user;

        if (user?.role) {
          navigate(user.role === "customer" ? "/customer" : "/provider");
        } else {
          navigate("/choose-role");
        }

      } catch (err) {
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  return <p className="text-center mt-20">Logging you in...</p>;
};

export default GoogleAuthCallback;