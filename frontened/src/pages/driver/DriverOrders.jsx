import { useSelector } from "react-redux";
import OrderCard from "../../components/orders/OrderCard";

const DriverOrders = () => {
  const { orders } = useSelector((state) => state.order);

  return (
    <>
      <h2>Driver Orders</h2>
      {orders.map((o) => (
        <OrderCard key={o._id} order={o} />
      ))}
    </>
  );
};

export default DriverOrders;
