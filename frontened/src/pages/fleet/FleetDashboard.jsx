import DashboardLayout from "../../components/layout/DashboardLayout";
import { useSelector } from "react-redux";
import FleetOrders from "../../components/orders/FleetOrders"; 


const FleetDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <DashboardLayout>
      <h2>Fleet Manager Dashboard</h2>

      <div>
        <h4>Welcome, {user?.name}</h4>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>

      <div>
        <FleetOrders />
      </div>
    </DashboardLayout>
  );
};

export default FleetDashboard;
