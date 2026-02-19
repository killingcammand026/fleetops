const driverSocket=(io,socket)=>{
    socket.on("driverLocationUpdate",({orderId,latitude,longitude})=>{

        io.to(`order_${orderId}`).emit("liveLocation",{
            latitude,
            longitude
        });
    });
};
export default driverSocket;