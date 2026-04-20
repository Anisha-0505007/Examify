import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/common/AuthLayout.jsx'
import { useAuth } from '../hooks/useAuth.js'

function Signup() {
  const [name, setName] = useState('Demo Student')
  const [email, setEmail] = useState('student@example.com')
  const { signup } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    signup(name, email)
    navigate('/dashboard')
  }

  return (
    <AuthLayout title="Create account" subtitle="Start your journey to better exam preparation.">
      <form className="grid gap-6" onSubmit={handleSubmit}>
        <div className="auth-input-group">
          <label htmlFor="name">Full Name</label>
          <input 
            id="name"
            className="auth-input input" 
            required 
            placeholder="John Doe"
            value={name} 
            onChange={(event) => setName(event.target.value)} 
          />
        </div>
        <div className="auth-input-group">
          <label htmlFor="email">Email Address</label>
          <input 
            id="email"
            className="auth-input input" 
            required 
            type="email" 
            placeholder="john@example.com"
            value={email} 
            onChange={(event) => setEmail(event.target.value)} 
          />
        </div>
        <button className="btn primary-gradient-btn" type="submit">Create account</button>
      </form>
      <p className="mt-8 text-center text-sm text-white/40">
        Already have an account? <Link className="font-bold text-[var(--accent)] hover:text-[var(--accent-strong)] transition-colors" to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}

export default Signup
