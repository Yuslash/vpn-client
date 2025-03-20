import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.DB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB!");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
};

export default connectDB;
