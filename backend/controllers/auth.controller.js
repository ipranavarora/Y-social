import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
    try{
        const {fullname, username, email, password} =  req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({error: "Invalid email format"});
        }

        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(400).json({error: "Username already taken"});
        }
        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({error: "Email already taken"});
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPassword,
        })

        if(newUser){
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImage: newUser.profileImage,
                coverImage: newUser.coverImage,
            });
        }
        else{
            res.status(400).json({error: "Invalid user data"});
        }

    }
    catch(error){
        console.log("Error in signup: ", error);
        res.status(500).json({error: "Internal server error"});
    }
}

export const login = async (req, res) => {
    try{
        const {username, password} = req.body;

        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({error: "Invalid username or password"});
        }
        const isPasswordValid = await bcrypt.compare(password, user?.password || "");
        if(!isPasswordValid){
            return res.status(400).json({error: "Invalid username or password"});
        }
        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImage: user.profileImage,
            coverImage: user.coverImage,
        });




    }
    catch(error){
        console.log("Error in login: ", error);
        res.status(500).json({error: "Internal server error"});
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message: "Logged out"});
    } catch (error) {
        console.log("Error in logging out: ", error);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getMe = async (req , res) =>{
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe: ", error);
        res.status(500).json({error: "Internal server error"});
    }
}
