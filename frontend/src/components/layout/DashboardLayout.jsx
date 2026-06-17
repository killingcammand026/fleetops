import { useState } from "react";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { useSelector } from "react-redux";

const DashboardLayout = ({ children }) => {
  const { role } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] bg-gray-50 overflow-x-hidden">
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen lg:ml-64">
        <AppHeader />
        <main className="flex-1 min-w-0 w-full overflow-auto">
          <div className="lg:hidden fixed top-4 left-4 z-30">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-gray-900 text-white shadow-lg hover:bg-gray-800"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="pt-14 lg:pt-4 pb-8">{children}</div>
        </main>
        <AppFooter />
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default DashboardLayout;