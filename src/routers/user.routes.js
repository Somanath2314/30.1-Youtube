import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js"; 
import upload from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import express from "express";
import cookieParser from "cookie-parser";
const Userrouter = Router();

Userrouter.post('/register',(req, res, next)=>{
    console.log("hitting in user/register");
    next();
},
    //this is the multer, where we upload the files, so in the req we get the extra req.files option, we can access like req.files.avatar?[0] something of this kind
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount : 1
        }
    ]),   
    registerUser); 

    Userrouter.post('/login', express.json(), (req, res, next) => {
        console.log(req.body);
        next();
      }, loginUser);
    Userrouter.post('/logout',verifyJwt, logoutUser);
    Userrouter.post('/refreshToken', refreshAccessToken);

export default Userrouter;