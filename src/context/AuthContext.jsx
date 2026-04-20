import { useMemo, useState, useEffect } from 'react'
import { AuthContext } from './AuthContextValue.js'
import { getCurrentUser, loginWithEmail, logoutUser, signupWithEmail, loginWithGoogle, listenToAuthChanges } from '../services/authService.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser())

  useEffect(() => {
    const unsubscribe = listenToAuthChanges((u) => setUser(u))
    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      login(email) {
        const nextUser = loginWithEmail(email)
        setUser(nextUser)
        return nextUser
      },
      async loginGoogle() {
        const nextUser = await loginWithGoogle()
        setUser(nextUser)
        return nextUser
      },
      signup(name, email) {
        const nextUser = signupWithEmail(name, email)
        setUser(nextUser)
        return nextUser
      },
      async logout() {
        await logoutUser()
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
