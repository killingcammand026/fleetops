import { useEffect } from "react";
import socket from "../sockets/orderSocket";
import { useDispatch } from "react-redux";
import { updateOrder } from "../redux/slices/orderSlice";

const useOrderSocket = (orderId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!orderId) return;

    socket.emit("joinOrderRoom", orderId);

    socket.on("statusUpdated", (data) => {
      dispatch(updateOrder({ _id: data.orderId, status: data.status }));
    });

    socket.on("driverAssigned", (data) => {
      dispatch(updateOrder({ _id: data.orderId, driver: data.driverId }));
    });

    socket.on("orderCancelled", (data) => {
      dispatch(updateOrder({ _id: data.orderId, status: "CANCELLED" }));
    });

    return () => {
      socket.off("statusUpdated");
      socket.off("driverAssigned");
      socket.off("orderCancelled");
    };
  }, [orderId]);
};

export default useOrderSocket;
