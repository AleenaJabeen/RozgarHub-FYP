import './env.js'

import connectDB from './src/db/index.js';
import { app } from './src/app.js';



const port=process.env.PORT || "8000"
connectDB().then(()=>{
    app.on("error",(error)=>{
        console.log("Error",error);
        throw error;
    });
    app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})

}).catch((err)=>{
    console.log("Something went wrong while connecting to database",err);
    
})

