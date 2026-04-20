import { useEffect, useState } from 'react';

const API_BASE = `http://${window.location.hostname}:3001`;
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import MetricCards from '../components/MetricCards';
import GlobeMap from '../components/GlobeMap';
import AlertsFeed from '../components/AlertsFeed';
import Charts from '../components/Charts';
import AttackerProfiles from '../components/AttackerProfiles';
import AttacksTable from '../components/AttacksTable';

export default function Dashboard() {
  const navigate = useNavigate();
  const { globalStats, socket } = useGlobal();
  const [attacks, setAttacks] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // Initial fetch
    fetch(`${API_BASE}/api/attacks`).then(r => r.json()).then(data => setAttacks(Array.isArray(data) ? data : [])).catch(e => console.error(e));
    fetch(`${API_BASE}/api/sessions`).then(r => r.json()).then(data => setSessions(Array.isArray(data) ? data : [])).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for new attacks and session updates to dynamically build the page
    const handleNewAttack = (attackPayload) => {
        setAttacks(prev => [attackPayload, ...prev].slice(0, 50));
        // Soft refresh sessions
        fetch(`${API_BASE}/api/sessions`).then(r => r.json()).then(data => setSessions(Array.isArray(data) ? data : [])).catch(e => console.error(e));
    };

    socket.on('new_attack', handleNewAttack);
    return () => socket.off('new_attack', handleNewAttack);
  }, [socket]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 flex flex-col gap-8 animate-entry">
      
      <div className="flex items-center justify-between">
          <h1 className="page-title text-white">Command Center</h1>
          <button className="btn btn-ghost" onClick={() => navigate('/settings')}>System Config</button>
      </div>

      <MetricCards stats={globalStats} />

      <div className="flex flex-col lg:flex-row gap-6 h-[480px]">
          <div className="w-full lg:w-[58%] h-full">
              <GlobeMap attacks={attacks} />
          </div>
          <div className="w-full lg:w-[42%] h-full">
              <AlertsFeed attacks={attacks} />
          </div>
      </div>

      <Charts attacks={attacks} />

      <div className="mt-8">
          <h2 className="section-header text-white uppercase tracking-widest text-[16px] mb-6">Active Threat Actors</h2>
          <AttackerProfiles sessions={sessions} />
      </div>

      <div className="mt-8 mb-16">
          <AttacksTable attacks={attacks} onReplay={(id) => navigate('/stories', { state: { sessionId: id } })} />
      </div>

    </div>
  );
}
