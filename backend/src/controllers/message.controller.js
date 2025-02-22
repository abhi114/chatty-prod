import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req,res)=>{
    try {
        const loggedInUSerId = req.user._id;
        const filteredUsers = await User.find({_id:{$ne:loggedInUSerId}}).select("-password");
        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("Error in get User ForSidebar: ",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }

};
export const getMessages = async(req,res)=>{
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id; //the current auth user
        const messages = await Message.find({
          $or: [
            { senderId: myId, receiverId: userToChatId },
            { senderId: userToChatId, receiverId: myId },
          ],
        });
        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages controller",error.message);
        res.status(500).json({error:"Internal Server Error"})
    }
}

export const sendMessage = async (req,res)=>{
    try {
        const {text,image} = req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user._id; //me
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });
        await newMessage.save();
        const receiverSocketId = getReceiverSocketId(receiverId);
        //if user is online send the message in realtime otherwise we can just store it in database and the user will get it 
        console.log(receiverSocketId);
        if(receiverId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }
        res.status(201).json(newMessage);
        //todo realtime functionality 
    } catch (error) {
        console.log("error in sendMessage controller", error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}