// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'
import Ordenes   from './pages/Ordenes'
import Productos from './pages/Productos'
import Mozos     from './pages/Mozos'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }/>
          <Route path="/ordenes" element={
            <PrivateRoute>
              <Ordenes />
            </PrivateRoute>
          }/>
          <Route path="/productos" element={
            <PrivateRoute>
              <Productos />
            </PrivateRoute>
          }/>
          <Route path="/mozos" element={
            <PrivateRoute>
              <Mozos />
            </PrivateRoute>
          }/>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}