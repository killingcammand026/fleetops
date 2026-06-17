import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ForgotPassword from "./pages/auth/ForgotPassword"
import DriverDashboard from "./pages/driver/DriverDashboard"
import DriverOrders from "./pages/driver/DriverOrders"
import CustomerDashboard from "./pages/customer/CustomerDashboard"
import CustomerOrders from "./pages/customer/CustomerOrders"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminOrders from "./pages/admin/AdminOrders"
import FleetDashboard from "./pages/fleet/FleetDashboard"
import FleetDrivers from "./pages/fleet/FleetDrivers"
import ProtectedRoute from "./components/ProtectedRoute"
import CustomerCreateOrder from "./pages/customer/CustomerCreateOrder"
import DriverMapViewer from './pages/driver/DriverMapViewer'
import FleetOrdersViewer from './pages/fleet/FleetOrdersViewer'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Driver Routes */}
        <Route 
          path="/driver/dashboard" 
          element={<ProtectedRoute allowedRole="Driver"><DriverDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/driver/orders" 
          element={<ProtectedRoute allowedRole="Driver"><DriverOrders /></ProtectedRoute>} 
        />
        <Route 
          path="/driver/mapviewer" 
          element={<ProtectedRoute allowedRole="Driver"><DriverMapViewer /></ProtectedRoute>} 
        />

        {/* Customer Routes */}
        <Route 
          path="/customer/dashboard" 
          element={<ProtectedRoute allowedRole="Customer"><CustomerDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/customer/allorders" 
          element={<ProtectedRoute allowedRole="Customer"><CustomerOrders /></ProtectedRoute>} 
        />
        <Route 
          path="/customer/createorders" 
          element={<ProtectedRoute allowedRole="Customer"><CustomerCreateOrder /></ProtectedRoute>} 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/users" 
          element={<ProtectedRoute allowedRole="Admin"><AdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/orders" 
          element={<ProtectedRoute allowedRole="Admin"><AdminOrders /></ProtectedRoute>} 
        />

        {/* Fleet Manager Routes */}
        <Route 
          path="/fleet/users" 
          element={<ProtectedRoute allowedRole="Fleet Manager"><FleetDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/fleet/drivers" 
          element={<ProtectedRoute allowedRole="Fleet Manager"><FleetDrivers /></ProtectedRoute>} 
        />
        <Route 
          path="/fleet/orders" 
          element={<ProtectedRoute allowedRole="Fleet Manager"><FleetOrdersViewer /></ProtectedRoute>} 
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App