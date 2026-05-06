import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL, timeout: 10000 })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('hms_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('hms_token')
      localStorage.removeItem('hms_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
