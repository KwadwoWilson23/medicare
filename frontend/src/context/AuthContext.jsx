import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hms_user')) } catch { return null }
  })
  const [roleData, setRoleData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hms_role_data')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('hms_token', data.token)
      localStorage.setItem('hms_user', JSON.stringify(data.user))
      localStorage.setItem('hms_role_data', JSON.stringify(data.roleData))
      setUser(data.user)
      setRoleData(data.roleData)
      return { success: true, role: data.user.role }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (form) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('hms_token', data.token)
      localStorage.setItem('hms_user', JSON.stringify(data.user))
      localStorage.setItem('hms_role_data', JSON.stringify(data.roleData))
      setUser(data.user)
      setRoleData(data.roleData)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('hms_token')
    localStorage.removeItem('hms_user')
    localStorage.removeItem('hms_role_data')
    setUser(null)
    setRoleData(null)
  }

  return (
    <AuthContext.Provider value={{ user, roleData, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
