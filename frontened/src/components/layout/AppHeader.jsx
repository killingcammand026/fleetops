import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const roleConfig = {
  Admin: {
    tagline: "System control & user management",
    icon: "⚙️",
    gradient: "from-slate-700 to-slate-900",
    accent: "text-amber-400",
  },
  "Fleet Manager": {
    tagline: "Assign drivers & track orders",
    icon: "🚛",
    gradient: "from-indigo-700 to-purple-800",
    accent: "text-cyan-300",
  },
  Driver: {
    tagline: "Deliver orders & update status",
    icon: "🛵",
    gradient: "from-emerald-700 to-teal-800",
    accent: "text-lime-300",
  },
  Customer: {
    tagline: "Place orders & track deliveries",
    icon: "📦",
    gradient: "from-blue-700 to-indigo-800",
    accent: "text-sky-300",
  },
};

const AppHeader = () => {
  const { user, role } = useSelector((state) => state.auth);
  const config = roleConfig[role] || { tagline: "FleetOps", icon: "🚀", gradient: "from-gray-700 to-gray-900", accent: "text-white" };

  return (
    <header
      className={`sticky top-0 z-20 w-full bg-gradient-to-r ${config.gradient} text-white shadow-lg border-b border-white/10`}
    >
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl" aria-hidden>{config.icon}</span>
            <span className="font-bold text-lg truncate">FleetOps</span>
          </Link>
          <span className="hidden sm:inline text-sm opacity-90 truncate border-l border-white/30 pl-3 ml-1">
            {config.tagline}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm opacity-90 truncate max-w-[140px] sm:max-w-none" title={user?.email}>
            {user?.name ?? "User"}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium bg-white/20 ${config.accent}`}>
            {role ?? "User"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;