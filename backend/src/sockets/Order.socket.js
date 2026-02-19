const orderSocket=(io,socket)=>{

    socket.on("joinOrderRoom",(orderId)=>{
        socket.join(`order_${orderId}`);
    });
};
export default orderSocket;