import {configureStore} from '@reduxjs/toolkit';
import authReducer from './auth-slice'
import profileReducer from './serviceProvider/profile-slice';
import gigReducer from './serviceProvider/gig-slice';
import categoryReducer from './serviceProvider/category-slice';

const store=configureStore({
    reducer:{
        auth:authReducer,
        serviceProviderProfile:profileReducer,
        gigs: gigReducer,
        categories: categoryReducer,
    }
});

export {store};