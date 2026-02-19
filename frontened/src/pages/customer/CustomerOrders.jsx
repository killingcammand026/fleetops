import { useDispatch, useSelector } from "react-redux";
import { addOrder } from "../../redux/slices/orderSlice";
import { createOrderAPI } from "../../services/orderService";
import OrderCard from "../../components/orders/OrderCard";

const CustomerOrders = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);

  const createOrder = async () => {
    const res = await createOrderAPI({
      pickupLatitude: 28.6,
      pickupLongitude: 77.2,
      dropLatitude: 28.7,
      dropLongitude: 77.3,
      paymentMethod: "COD",
    });

    dispatch(addOrder(res.data));
  };

  return (
    <>
      <button onClick={createOrder}>Create Order</button>

      {orders.map((o) => (
        <OrderCard key={o._id} order={o} />
      ))}
    </>
  );
};

export default CustomerOrders;
