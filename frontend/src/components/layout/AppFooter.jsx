import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const roleLinks = {
  Admin: [
    { to: "/admin/users", label: "Dashboard" },
    { to: "/admin/orders", label: "All Orders" },
  ],
  "Fleet Manager": [
    { to: "/fleet/users", label: "Dashboard" },
    { to: "/fleet/drivers", label: "Drivers" },
    { to: "/fleet/orders", label: "Orders" },
  ],
  Driver: [
    { to: "/driver/dashboard", label: "Dashboard" },
    { to: "/driver/orders", label: "My Orders" },
    { to: "/driver/mapviewer", label: "Live Map" },
  ],
  Customer: [
    { to: "/customer/dashboard", label: "Dashboard" },
    { to: "/customer/allorders", label: "My Orders" },
    { to: "/customer/createorders", label: "Create Order" },
  ],
};

const AppFooter = () => {
  const { role } = useSelector((state) => state.auth);
  const links = roleLinks[role] || [];

  return (
    <footer className="mt-auto w-full bg-gray-900 text-gray-400 border-t border-gray-800">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">FleetOps</span>
          <span className="text-xs">· Fleet Management</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} FleetOps
        </p>
      </div>
    </footer>
  );
};

export default AppFooter;