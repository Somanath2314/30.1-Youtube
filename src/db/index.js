import mongoose from "mongoose";
import DB_NAME from "../constants.js";

const connectDB = async () => {
    try {
        const connectionRes = await mongoose.connect(`${process.env.DBMS_URL}/${DB_NAME}`);
        console.log(`MongoDb connected DB host:${connectionRes}`);
        
    } catch (error) {
        console.log(`some DB error${error}`);
        process.exit(1);
    }
};

export default connectDB