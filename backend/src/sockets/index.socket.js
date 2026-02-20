
import { log } from "console";
import driverSocket from "./Driver.socket.js"  
import orderSocket from "./Order.socket.js"
import { Server } from "socket.io";
import jwt from "jsonwebtoken"


let io;


const initializeSocket=(server)=>{
    io=new Server(server,{
        cors:{
            origin:"*",
        },
    });
    io.use((socket,next)=>{
        const token=socket.handshake.auth?.token;
        if(!token){
            return next(new Error("Authentication Error"));
        }
    
        try {
            const decoded=jwt.verify(token,process.env.JWT_SECRET);
            socket.user=decoded;
            next();
        }
        catch(error){
            next(new Error("Invalid Token"));
        }
    
    });
    
    io.on("connection",(socket)=>{
        console.log("socket connected:",socket.id);
        
        driverSocket(io,socket);
        orderSocket(io,socket);
        
        socket.on("disconnect",()=>{
            console.log("socket disconnected");
            
        });
    });
};

export const getIO=()=>{
    if(!io){
        throw new Error("Socket not initialized");
    }
    return io||null;
};
export default initializeSocket;