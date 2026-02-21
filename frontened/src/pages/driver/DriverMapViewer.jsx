import DriverMap from "./DriverMap";
import LocationTracker from "./LocationTracker";
import DashboardLayout from "../../components/layout/DashboardLayout";


const DriverMapViewer = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Driver Map Viewer</h1>
        <DriverMap />
        <LocationTracker />
      </div>
    </DashboardLayout>
  );
};

export default DriverMapViewer;