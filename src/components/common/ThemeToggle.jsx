import { useEffect, useState } from 'react';
import { getTheme, setTheme } from '../../services/themeService.js';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const [theme, setInternalTheme] = useState(getTheme());

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setInternalTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="theme-switch-container">
      <input 
        type="checkbox" 
        id="theme-toggle-checkbox" 
        className="theme-switch-checkbox"
        checked={theme === 'light'}
        onChange={toggleTheme}
      />
      <label htmlFor="theme-toggle-checkbox" className="theme-switch-label">
        <div className="theme-switch-background">
          {/* Dark Mode Landscape */}
          <div className="landscape-dark">
            <div className="stars"></div>
            <div className="mountain-dark"></div>
          </div>
          
          {/* Light Mode Landscape */}
          <div className="landscape-light">
            <div className="clouds"></div>
            <div className="mountain-light"></div>
          </div>
        </div>
        
        {/* The Toggle Ball */}
        <div className="theme-switch-ball">
          <div className="moon-craters"></div>
        </div>
      </label>
    </div>
  );
}