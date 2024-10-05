import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        // watchHistory: [
        //     {
        //         type: Schema.Types.ObjectId,
        //         ref: "Video"
        //     }
        // ]
        // ,
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    return next();
});

userSchema.methods.generateAccessToken = async function(){
    console.log('From user model hitted');
    console.log(process.env.ACCESS_TOKEN);
    console.log(this._id);
    console.log(this.username);
    console.log(this.email);
    console.log(this.fullName);
    const msg = await jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        }, 
        process.env.ACCESS_TOKEN, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
    console.log(msg);
    return msg;
}

userSchema.methods.genereateRefreshToken = async function(){
    const msg = await jwt.sign(
        {_id: this._id,
            username: this.username,
        },process.env.REFRESH_TOKEN,{expiresIn : process.env.REFRESH_TOKEN_EXPIRY}
    )
    console.log(msg);
    return msg;
}

userSchema.methods.isPasswordCorrect =  function(password){
    return  bcrypt.compare(password, this.password)
}


export const User = mongoose.model("User", userSchema);