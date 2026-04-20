import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const GlobalContext = createContext({});

export const useGlobal = () => useContext(GlobalContext);

const API_BASE = `http://${window.location.hostname}:3001`;

export function GlobalProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  
  // Real-time metric state fed globally
  const [globalStats, setGlobalStats] = useState({
      totalAttacks: 0,
      activeSessions: 0,
      criticalThreats: 0,
      countriesDetected: 0,
      totalTarpitTime: 0
  });

  useEffect(() => {
    const newSocket = io(API_BASE, {
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    });
    
    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    
    // Fetch initial stats immediately once
    fetch(`${API_BASE}/api/stats`).then(r => r.json()).then(data => setGlobalStats(data)).catch(console.error);

    newSocket.on('stats_update', () => {
        // Backend emits an empty trigger; fetch new stats
        fetch(`${API_BASE}/api/stats`).then(r => r.json()).then(data => setGlobalStats(data)).catch(console.error);
    });

    // Listen for new attacks and fire toasts
    newSocket.on('new_attack', (payload) => {
        if (payload) {
            const attacker = payload.session?.attacker;
            addToast({
                type: `${payload.severity} — ${payload.surface?.toUpperCase() || 'UNKNOWN'}`,
                ip: `${attacker?.ip || 'Unknown IP'} • ${attacker?.country || 'Unknown'}`,
                severity: payload.severity
            });
        }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
     const down = (e) => {
       if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
         e.preventDefault();
         setCmdOpen((open) => !open);
       }
     };
     document.addEventListener('keydown', down);
     return () => document.removeEventListener('keydown', down);
  }, []);

  const addToast = (attack) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, ...attack }]);
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
  };

  return (
    <GlobalContext.Provider value={{ socket, isConnected, globalStats, addToast, API_BASE }}>
      {children}
      
      {/* Search Command Palette Overlay */}
      {cmdOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex justify-center items-start pt-[15vh]" onClick={() => setCmdOpen(false)}>
              <div className="bg-cyber-card border border-cyber-border w-full max-w-2xl rounded-xl overflow-hidden shadow-glow-blue" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-cyber-border flex items-center gap-3">
                      <span className="text-cyber-text-secondary w-5 h-5">🔍</span>
                      <input 
                         autoFocus
                         type="text" 
                         placeholder="Search attackers, APIs, IPs, signatures..." 
                         className="flex-1 bg-transparent border-none outline-none text-white font-sans text-lg"
                      />
                      <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-cyber-elevated rounded border border-cyber-border text-xs font-mono text-cyber-text-secondary tracking-widest">ESC</kbd>
                  </div>
                  <div className="p-4 text-center text-cyber-text-secondary py-12 text-sm italic">
                      Ready for indexing queries...
                  </div>
              </div>
          </div>
      )}

      {/* Connection Indicator Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border bg-cyber-card ${
              isConnected ? 'border-cyber-accent-success text-cyber-accent-success' : 'border-cyber-accent-warning text-cyber-accent-warning'
          }`}>
             {isConnected ? (
                 <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-accent-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-accent-success"></span>
                    </span>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest">Live</span>
                 </>
             ) : (
                 <>
                    <span className="w-2 h-2 rounded-full bg-cyber-accent-warning animate-pulse"></span>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest">Reconnecting</span>
                 </>
             )}
          </div>
      </div>

      {/* Toasts Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          {toasts.map(toast => (
              <div key={toast.id} className="w-80 bg-cyber-card border-l-4 border-cyber-accent-red border border-l-cyber-accent-red border-cyber-border rounded overflow-hidden shadow-glow-red animate-entry relative">
                 <div className="p-4">
                     <p className="font-heading font-bold text-white text-[14px]">{toast.type || 'CRITICAL INTRUSION'}</p>
                     <p className="font-mono text-[12px] text-cyber-text-secondary mt-1">{toast.ip}</p>
                     <span className="inline-block mt-3 px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-cyber-critical-bg text-cyber-critical-text border border-cyber-critical-border rounded-md">{toast.severity || 'CRITICAL'}</span>
                 </div>
                 {/* 5 second bar */}
                 <div className="h-1 bg-cyber-border w-full absolute bottom-0 left-0">
                     <div className="h-full bg-cyber-accent-red" style={{ animation: 'drain 5s linear forwards' }}></div>
                 </div>
                 <style dangerouslySetInnerHTML={{__html: `
                    @keyframes drain { from { width: 100%; } to { width: 0%; } }
                 `}} />
              </div>
          ))}
      </div>
      
    </GlobalContext.Provider>
  );
}
