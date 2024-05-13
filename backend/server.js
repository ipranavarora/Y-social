import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import postRoutes from "./routes/post.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import connectMongodb from "./db/connectMongodb.js"
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary"

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const PORT=process.env.PORT || 5000;

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)



app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
    connectMongodb();
})