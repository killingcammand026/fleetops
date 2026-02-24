import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";

const Sidebar = ({ role, isOpen = false, onClose }) => {
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
    <div
      className={`
        w-64 bg-gray-900 text-white h-screen flex flex-col
        fixed inset-y-0 left-0 z-40
        transform transition-transform duration-200 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* Logo/Brand + close on mobile */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">FleetOps</h2>
          <p className="text-xs text-gray-400 mt-1">Fleet Management</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 -m-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* User: name and role */}
      <div className="p-4 border-b border-gray-800">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Logged in as</p>
        <p className="text-sm font-semibold text-white">{user?.name ?? "User"}</p>
        <p className="text-xs text-gray-400 truncate" title={user?.email}>{user?.email ?? ""}</p>
        <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-blue-600 rounded-md text-white">
          {role ?? "User"}
        </span>
      </div>

      {/* Navigation - close sidebar on link click (mobile) */}
      <nav className="flex-1 p-4 overflow-y-auto" onClick={onClose}>
        {role === "Admin" && (
          <>
            <Link to="/admin/users" style={navItemStyle("/admin/users")}>
              <span className="mr-3">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/orders" style={navItemStyle("/admin/orders")}>
              <span className="mr-3">📦</span>
              <span>All Orders</span>
            </Link>
          </>
        )}

        {role === "Fleet Manager" && (
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
            <Link to="/customer/allorders" style={navItemStyle("/customer/orders")}>
              <span className="mr-3">📦</span>
              <span>My Orders</span>
            </Link>
            <Link to="/customer/createorders" style={navItemStyle("/customer/createorders")}>
              <span className="mr-3">👤</span>
              <span>Create Order</span>
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
            <Link to="/driver/mapviewer" style={navItemStyle("/driver/mapviewer")}>
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