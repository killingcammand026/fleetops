import Sidebar from "./Sidebar";
import { useSelector } from "react-redux";

const DashboardLayout = ({ children }) => {
  const { role } = useSelector((state) => state.auth);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role={role} />
      <div style={{ flex: 1, padding: "20px" }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
