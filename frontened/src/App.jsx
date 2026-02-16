import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import DriverDashboard from "./pages/driver/DriverDashboard"
import CustomerDashboard from "./pages/customer/CustomerDashboard"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
         <Route path="/driver/dashboard" element={<ProtectedRoute allowedRole="Driver"><DriverDashboard /></ProtectedRoute>} /> 
         <Route path="/customer/dashboard" element={<ProtectedRoute allowedRole="Customer"><CustomerDashboard /></ProtectedRoute>} /> 
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
