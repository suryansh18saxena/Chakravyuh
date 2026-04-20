import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Bot, KeyRound } from 'lucide-react';
import SpiderWebIcon from '../components/SpiderWebIcon';
import AIChatWidget from '../components/AIChatWidget';

export default function MainLayout() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Payload Analyzer', path: '/analyzer' },
    { name: 'Attack Stories', path: '/stories' },
    { name: 'Login Attempts', path: '/login-attempts' },
    { name: 'Settings', path: '/settings' }
  ];

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text-primary flex flex-col">
      <nav 
        className={`fixed top-0 left-0 right-0 h-[64px] z-50 flex items-center justify-between px-6 border-b border-cyber-border transition-colors duration-200 backdrop-blur-sm ${
          scrolled ? 'bg-cyber-card' : 'bg-cyber-bg/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <SpiderWebIcon className="w-8 h-8" color="#E63946" />
          <span className="font-heading font-bold text-[20px] text-white tracking-wider">CHAKRAVYUH</span>
        </div>

        <div className="hidden md:flex items-center gap-8 h-full">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => 
                `flex items-center h-full border-b-2 font-sans text-[14px] transition-colors ${
                  isActive 
                    ? 'border-cyber-accent-red text-white' 
                    : 'border-transparent text-cyber-text-secondary hover:text-white'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyber-accent-success/30 bg-cyber-accent-success/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-accent-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-accent-success"></span>
            </span>
            <span className="font-mono text-[12px] text-cyber-accent-success tracking-widest font-bold">HONEYPOT ACTIVE</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full mt-[64px] relative">
        <Outlet />
      </main>

      {/* AI Chat Widget - available on every page */}
      <AIChatWidget />
    </div>
  );
}
