import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOrders } from "../../redux/slices/orderSlice";
import { getAllOrdersAPI } from "../../services/orderService";
import OrderCard from "../../components/orders/OrderCard";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await getAllOrdersAPI();
      dispatch(setOrders(res.data.data));
    };
    fetchOrders();
  }, []);

  return (
    <>
      <h2>All Orders</h2>
      {orders.map((o) => (
        <OrderCard key={o._id} order={o} />
      ))}
    </>
  );
};

export default AdminOrders;
