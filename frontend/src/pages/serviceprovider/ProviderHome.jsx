import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProviderProfile } from '../../store/serviceProvider/profile-slice';

function ProviderHome() {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.serviceProviderProfile) || {};

  // Fetch the profile globally the moment the Service Provider logs in
  useEffect(() => {
    if (!profile) {
      dispatch(getProviderProfile()).catch((err) => console.log("Profile fetch error:", err));
    }
  }, [dispatch, profile]);

  return (
    <div>
        <Outlet/>
    </div>
  );
}

export default ProviderHome;