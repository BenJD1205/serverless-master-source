import mongoose from "mongoose";
import { config } from "../config/config";
mongoose.set('strictQuery', false);

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongo.url).then((data) => {
            console.log(`Database connected with ${data.connection.host}`)
        })
    }
    catch (err: any) {
        console.log(err.message);
        setTimeout(connectDB, 5000);
    }
}
