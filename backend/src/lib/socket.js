import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:["http://localhost:5173"]
    }
})
//for a given userId return the socket id
export function getReceiverSocketId (userId) {
  return userSocketMap[userId];
};
// The socket.id is ephemeral. It's only valid for the duration of a single connection. 
//  Don't rely on it as a persistent identifier for a user or browser session.  
// If you need to track users across connections, you'll need to implement your own mechanism (e.g., using cookies, authentication tokens, 
// or storing user information associated with the socket.id in a database or session store, but updating it on each new connection).
const userSocketMap = {}; // used to store online users {userId:socketId}
io.on("connection",(socket)=>{
    console.log("a user connected ",socket.id);
    const userId = socket.handshake.query.userId;  //passed from backend in the connectSocket Method
    if(userId){
        userSocketMap[userId]= socket.id //mapped the userId to the socketId
    }
    console.log("user socket map "+ JSON.stringify(userSocketMap))
    //broadcast something to every connected clients 
    io.emit("getOnlineUsers",Object.keys(userSocketMap)); // we are sending the userId that we mapped in the userSocketMap so that in the frontend we can show that these userId are online
    socket.on("disconnect",()=>{
        console.log("A user disconnecrted",socket.id);
        delete userSocketMap[userId]; //deleting the key/userid 
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    })
})
export {io,app,server};