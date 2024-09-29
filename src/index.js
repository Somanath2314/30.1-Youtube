import express from "express";
import mongoose from "mongoose";
import DB_NAME from "./constants.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js"; 

dotenv.config(
    {
        path: "./.env"
    }
);
//config the .env as soon as possible, like where the first entry to the code begins
connectDB().then(() => {
    app.listen(3005, () => {
        console.log("Server is running on port 3000");
    });
}).catch((error) => {
    console.log(`some DB error${error}`);
    process.exit(1);
});

/*
const app = express();
(async()=>{
    try {
        await mongoose.connect(`${process.env.DBMS_URL}/${DB_NAME}`);
        console.log(`MongoDb connected DB host:${process.env.DBMS_URL}`);        
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        
    }
})(); //calling the function directly
*/