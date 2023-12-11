import { connectDB } from "../databases/db-connection";

connectDB()
    .then(() => {
        console.log("DB connected!");
    })
    .catch((err) => console.log(err));
