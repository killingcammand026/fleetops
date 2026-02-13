import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

const appRouter = createBrowserRouter([
  {
    path: '/login',
    element: < Login />
  },
  {
    path: '/register',
    element: <Register />
  },

]);
  


function App() {

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App
