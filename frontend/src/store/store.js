import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import profileReducer from "./serviceProvider/profile-slice";
import gigReducer from "./serviceProvider/gig-slice";
import categoryReducer from "./serviceProvider/category-slice";
import customerProfileReducer from "./customer/profile-slice";
import orderSliceReducer from "./orders/order-slice";
import gigSearchReducer from "./customer/gigSearch-slice";
import chatReducer from './chat/chatSlice'
import messageReducer from './chat/messageSlice'
import reviewReducer from "./customer/review-slice";
import notificationReducer from "./notification-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    serviceProviderProfile: profileReducer,
    gigs: gigReducer,
    categories: categoryReducer,
    customerProfile: customerProfileReducer,
    orders: orderSliceReducer,
    gigSearch: gigSearchReducer,
    customerProfile: customerProfileReducer,
    chats: chatReducer,
    messages: messageReducer,
    reviews: reviewReducer,
    notifications: notificationReducer,
  },
});

export { store };
