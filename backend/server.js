import './env.js'
import http from 'http'; 
import connectDB from './src/db/index.js';
import { app } from './src/app.js';
import { initSocket } from './src/utils/socket.js'; 

const port = process.env.PORT || "8000";

const server = http.createServer(app);

initSocket(server);

connectDB().then(() => {
    app.on("error", (error) => {
        console.log("Error", error);
        throw error;
    });
    
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

}).catch((err) => {
    console.log("Something went wrong while connecting to database", err);
});