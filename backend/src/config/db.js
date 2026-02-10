import mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config();
 const connectDB = async () => {
	try {
		mongoose.connect(`${process.env.MONGO_URI}`);
        console.log("MONGODB CONNECTED");
	} catch (error) {
		console.log("Error connecting to MONGODB", error.message);
	}
};
export default connectDB;
