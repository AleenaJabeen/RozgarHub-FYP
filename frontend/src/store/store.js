import {configureStore} from '@reduxjs/toolkit';
import authReducer from './auth-slice'
import profileReducer from './serviceProvider/profile-slice';

const store=configureStore({
    reducer:{
        auth:authReducer,
        serviceProviderProfile:profileReducer,
    }
});

export {store};