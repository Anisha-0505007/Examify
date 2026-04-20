import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/common/AuthLayout.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getFirebaseDebugStatus } from '../services/firebase.js'

function Login() {
  const [email, setEmail] = useState('student@example.com')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState(null)
  const { login, loginGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const debug = getFirebaseDebugStatus()

  function handleSubmit(event) {
    event.preventDefault()
    login(email)
    navigate(location.state?.from || '/dashboard')
  }

  async function handleGoogleSubmit() {
    setIsLoggingIn(true)
    setError(null)
    try {
      await loginGoogle()
      navigate(location.state?.from || '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <AuthLayout title="Log in" subtitle="Manage your exams and attempts securely.">
      <div className="grid gap-6">
        <button 
          className="auth-glass-btn flex items-center justify-center gap-3 transition-all active:scale-95" 
          type="button"
          disabled={isLoggingIn}
          onClick={handleGoogleSubmit}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.27l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="font-bold">Sign in with Google</span>
        </button>

        <div className="relative my-4 flex items-center justify-center text-center">
          <hr className="w-full border-white/10" />
          <span className="absolute bg-[#0f172a] px-4 text-[10px] font-black uppercase text-white/30 tracking-widest">OR</span>
        </div>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              className="auth-input input" 
              required 
              type="email" 
              placeholder="student@example.com"
              value={email} 
              onChange={(event) => setEmail(event.target.value)} 
            />
          </div>
          <button className="btn primary-gradient-btn" type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? 'Logging in...' : 'Continue with Email'}
          </button>
        </form>
        
        {!debug.isReady && (
          <div className="mt-4 p-4 rounded-xl bg-red-400/10 border border-red-400/20">
            <p className="text-center text-xs font-bold text-red-400 leading-relaxed uppercase tracking-wider">
              Firebase Configuration Missing
            </p>
            {debug.missingKeys.length > 0 && (
              <div className="mt-2 text-[10px] text-white/40 font-mono text-center">
                Missing: {debug.missingKeys.join(', ')}
              </div>
            )}
            <p className="mt-2 text-[10px] text-white/30 text-center italic">
              Please check your Vercel Environment Variables.
            </p>
          </div>
        )}

        {error && <p className="mt-2 text-center text-xs font-bold text-red-400">{error}</p>}
      </div>
      <p className="mt-8 text-center text-sm text-white/40">
        New to Examify? <Link className="font-bold text-[var(--accent)] hover:text-[var(--accent-strong)] transition-colors" to="/signup">Create an account</Link>
      </p>
    </AuthLayout>
  )
}

export default Login
