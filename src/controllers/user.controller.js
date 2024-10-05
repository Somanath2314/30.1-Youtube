import { User } from "../models/user.models.js";
import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async function(userId){
  // req.body
  // username or url
  // find the user
  // password check
  // access and refresh token
  // send cookie
  const user = await User.findById(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.genereateRefreshToken();
  user.refreshToken = refreshToken 
  await user.save({ validateBeforeSave:false })  //that extra we will be writing na like required:true
  return {accessToken, refreshToken};  
}

export const registerUser = asyncHandler(async (req, res)=>{ 
  console.log("Came here");
  const username = req.body.username
  const fullName = req.body.fullName
  const email =   req.body.email
  const password = req.body.password
  if(!username || !fullName || !email || !password){
    throw new apiError(200, "All fields are required");
  }

  const userCheck = await User.findOne(
    {
      $or: [{username}, {email}]
    });
    if (userCheck) {
      throw new apiError(409, "User with email or username already exists")
    }  

    const avatarPath = req.files?.avatar[0]?.path;
    const coverPath = req.files?.avatar[0]?.path;
    if(!avatarPath){
      throw new apiError(200, "Avatar required is must");
    }
    const avatarResponse = await uploadOnCloudinary(avatarPath);
    const coverResponse = await uploadOnCloudinary(coverPath)
    if(!avatarResponse){
      throw new apiError(500, 'Uploading the avatar to the cloudinary error');
    }

    const user = await User.create({
      username,
      email,
      fullName,
      avatar: avatarResponse.url,
      coverImage: coverResponse?.url || "",
      password,
    }); 
    //Alternate to create the user and store is
    /*
    Yes, calling User.create() will add the data to the database immediately in many ORM systems (like Sequelize or Mongoose). It creates a new record and saves it directly in the database in one step. 
    However, in some cases, you might see save() being used, especially in a two-step process: 
    Instantiation: You first create an instance of the model (without saving it immediately): 
    const user = new User({ fullName, avatar: avatar.url, ... });
    await user.save(); 
    */
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
  )

  if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
  }
  console.log("Register till last step");
  return res.status(201).json(
      new apiResponse(200, createdUser, "User registered Successfully")
  )
})

export const loginUser = asyncHandler( async (req, res)=>{
  //in the req body i will be getting all the access
  const {username, email, password} = req.body;
  console.log(req.body);
  
  if(!username && !email){
    throw new apiError(400, "Either username or email is mandatory");
  }
  const user = await User.findOne({
    $or: [{username}, {email}]
  }, {});
  if(!user){
    throw new apiError(400, 'User with the entered credentials wont exist');
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if(!isPasswordValid){
    throw new apiError(400, "Entered wrong password");
  }  
  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedUser = await User.findById(user._id).select("-password -refreshToken");
  //Cookie takes out the two objects
  const options = {
    httpOnly: true,
    secure: true
  }
  console.log("tokens", accessToken, refreshToken);
  return res
  .status(200)
  .cookie('accessToken', accessToken)
  .cookie('refreshToken', refreshToken)
  .json(
    new apiResponse(200, "User logged in successfully", {
      user : loggedUser,
    })
  )
})

export const logoutUser = asyncHandler( async (req, res)=>{
  //will do it out
  //as i added the custom auth middleware, i made sure there will be the user in the req

  //get the details of the user from the middleware we created
  //Remove the refresh tokens from the db
  //Clear out the coolkies
  //Send message as successfully logged out

  const user = req.user;
  //delete the refreshToken in the db
  await User.findByIdAndUpdate(user._id, 
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  )
  const options = {
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new apiResponse(200, "Logged out successfuly", {}));
})

export const refreshAccessToken = asyncHandler( async(req, res)=>{
    
    // {
    //   /*
    //   Lets understand the working of the 
    //   access token and the refresh token
    //   Refresh token is the thing that we store in our DB, and it is of more
    //   day of expiry compared ot the access token

    //   Basically for the login and all we make use of the accesstoken
    //   as its of shortlived like 15mins, 1day 
    //   after it gets expired, the user shld again login
    //   Which indirectly makes the user experience bad
    //   what we instead do is, we maintain the refresh token
    //   Whenever the access token gets expired, the frontend
    //   will trigger the this refreshAccessToken
    //   where we get the refreshToken via cookies or the body
    //   from this refreshtToken, we again create new access and refresh token
    //    */
    //   }
   /*
      basic steps;
      // get the refreshToken
      // decode it with jwt
      // check whether its the same refreshToken stored in our db
      // if yes, working everything very clean
      // generate the new tokens
    */

    const incomingToken = req.cookies?.refreshToken || req.body.refreshToken;
    if(!incomingToken){
      throw new apiError(500, "Refresh token we didnt receive via cookie or the body")
    }
    try { 
      const decodeUser = jwt.verify(incomingToken, process.env.REFRESH_TOKEN);
      const user = await User.findById(decodeUser._id);
      if(!user){
        throw new apiError(400, "Wrong token passed");
      }
      if(user.refreshToken != incomingToken){
        throw new apiError(400, "Refresh token given is wrong");
      }
      const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user);
      res.status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .json(
        new apiResponse(200, "successfully refreshed the tokens", {
          accessToken, refreshToken
        })
      )
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
    }
});

export const changePassword = asyncHandler( async(req, res)=>{
  const {oldPassword, newPassword} = req.body; 
  if(!user){
    new apiError(400, "User isnt logged in");
  }
  const user = await User.findById(req.user._id);
  if(!user){
    new apiError(400, "User doesnt exisit");
  }
  const isCorrectPassword = user.isPasswordCorrect(oldPassword);
  if(!isCorrectPassword){
    throw new apiError(400, "Old password is incorrect");
  }
  user.password = newPassword;
  await user.save({validateBeforeSave: false});
  return res
  .status(200)
  .json(new apiResponse(200, "Changed password successfully", {}));
})

export const getCurrentUser = asyncHandler( async(req, res)=>{
  return res.status(200).json(
    new apiResponse(200, "user fetched successfullu", req.user)
  );
})

export const updateAccountDetails = ayncHandler( async(req, res)=>{
  const {fullName, email} = req.body;
  if(!fullName || !email){
    new apiError(400, "Need both the username and email");
  }
  const user = User.findByIdAndUpdate(req.user?._id, 
    {
      $set: {
        fullName,
        email
      },
    },
    {
      new: true
    }
  ).select('-password');
      return res
      .status(200)
      .json(new ApiResponse(200, user, "Account details updated successfully"))
})

export const updateUserAvatar = asyncHandler( async(req, res)=>{
  const file = req.file?.path
  if(!file){
    throw new apiError(400, "File is not given");
  }
  const upload = await uploadOnCloudinary(file); 
  const newUser = User.findByIdAndUpdate(req.user._id, {
    $set:{
      avatar: upload.url
    }
  }, {new:true}).select('-password');
  return res
    .status(200)
    .json(
        new ApiResponse(200, newUser, "Avatar image updated successfully")
    )
})

export const updateUserCover = asyncHandler( async(req, res)=>{
  const file = req.file?.path
  if(!file){
    throw new apiError(400, "File is not given");
  }
  const upload = await uploadOnCloudinary(file); 
  const newUser = User.findByIdAndUpdate(req.user._id, {
    $set:{
      coverImage: upload.url
    }
  }, {new:true}).select('-password');
  return res
    .status(200)
    .json(
        new ApiResponse(200, newUser, "Avatar image updated successfully")
    )
})

