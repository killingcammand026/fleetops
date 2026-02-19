import { useSelector } from "react-redux";
import AssignDriverForm from "../../pages/fleet/AssignDriverForm";

const FleetOrders = () => {
  const { orders } = useSelector((state) => state.order);
  const { assignments } = useSelector((state) => state.assignment);
  const { user } = useSelector((state) => state.auth);

  const myOrders = orders.filter(
    (order) => order.fleetManagerId === user._id
  );

  return (
    <div>
      <h3>My Orders</h3>

      {myOrders.map((order) => {
        const assigned = assignments.find(
          (a) => a.orderId === order._id
        );

        return (
          <div key={order._id} style={{ border: "1px solid gray", padding: "10px", marginBottom: "10px" }}>
            <p>Customer: {order.customerName}</p>
            <p>Status: {order.status}</p>

            {assigned ? (
              <p>Driver Assigned: {assigned.driverId}</p>
            ) : (
              <AssignDriverForm orderId={order._id} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FleetOrders;
