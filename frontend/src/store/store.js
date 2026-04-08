import {configureStore} from '@reduxjs/toolkit';
import authReducer from './auth-slice'
import profileReducer from './serviceProvider/profile-slice';
import gigReducer from './serviceProvider/gig-slice';
import categoryReducer from './serviceProvider/category-slice';
import customerProfileReducer from './customer/profile-slice'
import orderSliceReducer from './orders/order-slice';

const store=configureStore({
    reducer:{
        auth:authReducer,
        serviceProviderProfile:profileReducer,
        gigs: gigReducer,
        categories: categoryReducer,
        customerProfile: customerProfileReducer,
        orders: orderSliceReducer,
    }
});

export {store};