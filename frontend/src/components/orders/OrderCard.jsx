import { useSelector, useDispatch } from "react-redux";
import {
  assignDriverAPI,
  driverAcceptAPI,
  driverRejectAPI,
  updateStatusAPI,
  cancelOrderAPI,
} from "../../services/orderService";
import { updateOrder } from "../../redux/slices/orderSlice";

const OrderCard = ({ order }) => {
  const { role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const normalize = (res) =>
    res.data.data || res.data;

  const assign = async () => {
    const res = await assignDriverAPI(order._id);
    dispatch(updateOrder(normalize(res)));
  };

  const accept = async () => {
    const res = await driverAcceptAPI(order._id);
    dispatch(updateOrder(normalize(res)));
  };

  const reject = async () => {
    const res = await driverRejectAPI(order._id);
    dispatch(updateOrder(normalize(res)));
  };

  const updateStatus = async (status) => {
    const res = await updateStatusAPI(order._id, status);
    dispatch(updateOrder(normalize(res)));
  };

  const cancel = async () => {
    const res = await cancelOrderAPI(order._id);
    dispatch(updateOrder(normalize(res)));
  };

  return (
    <div style={{ border: "1px solid black", margin: 10, padding: 10 }}>
      <p>ID: {order.orderId}</p>
      <p>Status: {order.status}</p>

      {(role === "Admin" || role === "Fleet Manager") &&
        order.status === "CREATED" && (
          <button onClick={assign}>Assign Driver</button>
        )}

      {role === "Driver" &&
        order.status === "DRIVER_ASSIGNED" && (
          <>
            <button onClick={accept}>Accept</button>
            <button onClick={reject}>Reject</button>
          </>
        )}

      {role === "Driver" &&
        order.status === "DRIVER_ACCEPTED" && (
          <button onClick={() => updateStatus("PICKED_UP")}>
            Picked Up
          </button>
        )}

      {role === "Driver" &&
        order.status === "PICKED_UP" && (
          <button onClick={() => updateStatus("IN_TRANSIT")}>
            In Transit
          </button>
        )}

      {role === "Driver" &&
        order.status === "IN_TRANSIT" && (
          <button onClick={() => updateStatus("DELIVERED")}>
            Delivered
          </button>
        )}

      {role === "Customer" &&
        (order.status === "CREATED" ||
          order.status === "DRIVER_ASSIGNED") && (
          <button onClick={cancel}>Cancel</button>
        )}
    </div>
  );
};

export default OrderCard;
