import express from "express";
import { Router } from "express"; 
import router from "./routers/user.routes.js";
import Userrouter from "./routers/user.routes.js"; 
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express(); 
 
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/users", Userrouter)
app.get('/', (req, res)=>{
    res.send("hit the app  root")
})

export default app;