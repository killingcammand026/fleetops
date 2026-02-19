import Sidebar from "./Sidebar";
import { useSelector } from "react-redux";

const DashboardLayout = ({ children }) => {
  const { role } = useSelector((state) => state.auth);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
