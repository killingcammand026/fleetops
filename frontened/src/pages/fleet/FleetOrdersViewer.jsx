 import FleetOrders from "@/components/orders/FleetOrders"
import DashboardLayout from "../../components/layout/DashboardLayout";
           

 const FleetOrdersViewer=()=>{
    return(
        <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Fleet Orders</h1>
          <FleetOrders />
        </div>
        </DashboardLayout>
    )
 }

    export default FleetOrdersViewer;