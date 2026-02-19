import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";

const Sidebar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItemStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    margin: "4px 0",
    color: isActive(path) ? "#fff" : "#a0a0a0",
    textDecoration: "none",
    borderRadius: "8px",
    backgroundColor: isActive(path) ? "#2563eb" : "transparent",
    transition: "all 0.2s",
    fontWeight: isActive(path) ? "600" : "400",
  });

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">FleetOps</h2>
        <p className="text-xs text-gray-400 mt-1">Fleet Management</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-800">
        <p className="text-sm font-medium text-white">{user?.name || "User"}</p>
        <p className="text-xs text-gray-400">{user?.email || ""}</p>
        <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-600 rounded">
          {role || "User"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {role === "Admin" && (
          <>
            <Link to="/admin/users" style={navItemStyle("/admin/users")}>
              <span className="mr-3">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/users" style={navItemStyle("/admin/users")}>
              <span className="mr-3">👥</span>
              <span>Manage Users</span>
            </Link>
            <Link to="/admin/orders" style={navItemStyle("/admin/orders")}>
              <span className="mr-3">📦</span>
              <span>All Orders</span>
            </Link>
          </>
        )}

        {role === "FleetManager" && (
          <>
            <Link to="/fleet/users" style={navItemStyle("/fleet/users")}>
              <span className="mr-3">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/fleet/drivers" style={navItemStyle("/fleet/drivers")}>
              <span className="mr-3">🚗</span>
              <span>Drivers</span>
            </Link>
            <Link to="/fleet/orders" style={navItemStyle("/fleet/orders")}>
              <span className="mr-3">📦</span>
              <span>Orders</span>
            </Link>
          </>
        )}

        {role === "Customer" && (
          <>
            <Link to="/customer/dashboard" style={navItemStyle("/customer/dashboard")}>
              <span className="mr-3">🏠</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/customer/orders" style={navItemStyle("/customer/orders")}>
              <span className="mr-3">📦</span>
              <span>My Orders</span>
            </Link>
            <Link to="/customer/profile" style={navItemStyle("/customer/profile")}>
              <span className="mr-3">👤</span>
              <span>Profile</span>
            </Link>
          </>
        )}

        {role === "Driver" && (
          <>
            <Link to="/driver/dashboard" style={navItemStyle("/driver/dashboard")}>
              <span className="mr-3">🏠</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/driver/orders" style={navItemStyle("/driver/orders")}>
              <span className="mr-3">📦</span>
              <span>My Orders</span>
            </Link>
            <Link to="/driver/map" style={navItemStyle("/driver/map")}>
              <span className="mr-3">🗺️</span>
              <span>Live Map</span>
            </Link>
          </>
        )}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <span className="mr-3">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
