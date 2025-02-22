import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { config } from "dotenv";

config();
export const protectRoute = async (req,res,next)=>{
    try {
        console.log("hit here");
        //console.log(req)
        console.log("Cookies received:", req.cookies); 
        const token = req.cookies.jwt;
      
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized - No Token Provided" });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET); //decode the cookie using the same key it was encoded;
      //if it is a false value then it is invalid
      if (!decoded) {
        return res
          .status(401)
          .json({ message: "Unauthorized - Invalid Token" });
      }
      const user = await User.findById(decoded.userId).select("-password"); //select everything except the password
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      req.user = user; //this sets the user to req which will be used by updateProfile
      next();
    } catch (error) {
        console.log("error in protect Route middleware",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}