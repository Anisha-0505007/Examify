import './AuthLayout.css';
import ThemeToggle from './ThemeToggle.jsx';

function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>
      {/* Background Animations */}

      <div className="auth-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className="moving-text-container">
        <div className="moving-text text-1">Mathematics • Science • Physics • Chemistry • Biology</div>
        <div className="moving-text text-2">Calculus • Algebra • Geometry • Stats • AI</div>
        <div className="moving-text text-3">EXAMIFY • PREP • SUCCEED • REPEAT</div>
      </div>

      <section className="auth-card">
        {/* Left Side: Marketing/Vision */}
        <div className="auth-left">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="12" fill="var(--accent)" fillOpacity="0.1"/>
              <path d="M12 14C12 12.8954 12.8954 12 14 12H26C27.1046 12 28 12.8954 28 14V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V14Z" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M16 17H24" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M16 22H24" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M22 28L28 22" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="30" cy="10" r="3" fill="var(--accent)">
                <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
            <span style={{ color: 'white' }}>Examify</span>
          </div>
          <h1 className="auth-title">

            Transform practice PDFs into timed exam sessions.
          </h1>
          <p className="auth-subtitle">
            Upload papers, review extracted questions, attempt tests with precision controls, and evaluate results instantly.
          </p>
        </div>

        {/* Right Side: Auth Form */}
        <div className="auth-right">
          <header className="mb-8">
            <h2 className="text-4xl font-black tracking-tight text-white">{title}</h2>
            <p className="mt-2 text-lg text-white/50">{subtitle}</p>
          </header>
          
          <div className="auth-form-container">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;