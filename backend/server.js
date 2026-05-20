import './env.js'
import http from "http"; 
import connectDB from './src/db/index.js';
import { app } from './src/app.js';
import { initSocket } from './src/socket/socket.js';

const port = process.env.PORT || "8000";

const httpServer = http.createServer(app);    

connectDB().then(() => {
    const io = initSocket(httpServer);

    // Store io instance on express app
    app.set("io", io);                          // ← NEW — must be after DB
 
    httpServer.on("error", (error) => {             // ← was app.on(...)
      console.log("Server error", error);
      throw error;
    });
 
    httpServer.listen(port, () => {                 // ← was app.listen(...)
      console.log(`Server is running on port ${port}`);
    });

}).catch((err)=>{
    console.log("Something went wrong while connecting to database",err);
    
    httpServer.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

}).catch((err) => {
    console.log("Something went wrong while connecting to database", err);
});