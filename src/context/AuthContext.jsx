// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const rol   = localStorage.getItem('rol')
    const nombre= localStorage.getItem('nombre')
    if (token) setUser({ token, rol, nombre })
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const { data } = await api.post('/auth/token/', { username, password })
    localStorage.setItem('access_token',  data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('rol',           data.rol)
    localStorage.setItem('nombre',        data.nombre)
    setUser({ token: data.access, rol: data.rol, nombre: data.nombre })
    return data.rol
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout/', {
        refresh: localStorage.getItem('refresh_token')
      })
    } finally {
      localStorage.clear()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)