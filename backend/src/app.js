import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { stripeWebhook } from "./controllers/payment/payment.controller.js"

const app=express();

app.post("/api/v1/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(cors({
    origin: 'http://localhost:5173', // Allow only your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true // Allow cookies/headers if needed
}));

app.use(express.json({
    limit:'16kb'
}));

app.use(express.urlencoded({extended:true,limit:"16kb"}));

app.use(express.static("public"));

app.use(cookieParser());

// routes
import authRouter from './routes/auth.route.js';
import gigRouter from './routes/gig.route.js';
import profileRouter from './routes/profile.route.js';
import categoryRouter from './routes/category.route.js';
import customerRouter from './routes/customer.route.js'
import orderRouter from './routes/order.route.js';
import chatRouter     from './routes/chat.route.js';
import messageRouter from './routes/message.route.js'
import reviewRouter from "./routes/review.routes.js";
import notificationRouter from './routes/notification.route.js';
import paymentRoutes from "./routes/payment.route.js";

app.use('/api/v1/notification', notificationRouter);
app.use('/api/v1/payments', paymentRoutes);

app.use('/api/v1/categories',categoryRouter);
app.use('/api/v1/gigs',gigRouter);

app.use('/api/v1/auth',authRouter);

app.use('/api/v1/serviceprovider',profileRouter);
app.use('/api/v1/customer',customerRouter);

app.use('/api/v1/orders', orderRouter);
app.use("/api/v1/reviews", reviewRouter);

app.use('/api/v1/chat',          chatRouter);  
app.use('/api/v1/messages',     messageRouter     ); 


// sending error as json
app.use((err, req, res, next) => {
  // If the error is from your ApiError class, it will have a statusCode
  const statusCode = err.statusCode || 500;
  
  // Send the error as JSON so Axios can read it
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});

export {app};