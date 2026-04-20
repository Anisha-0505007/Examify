import { useContext } from 'react'
import { AuthContext } from '../context/AuthContextValue.js'

export function useAuth() {
  return useContext(AuthContext)
}
