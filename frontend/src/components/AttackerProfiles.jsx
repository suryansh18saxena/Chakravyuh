import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Play, ChevronDown, ChevronUp, Network } from 'lucide-react';

// Generates hex color from string for avatar
const hashToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

export default function AttackerProfiles({ sessions }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sessions.map(s => <ProfileCard key={s.id} session={s} />)}
        </div>
    );
}

function ProfileCard({ session }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    
    // Derived states
    const attacker = session.attacker;
    const initial = attacker.country !== 'unknown' ? attacker.country.substring(0,2).toUpperCase() : '??';
    const avatarColor = useMemo(() => hashToColor(attacker.fingerprint), [attacker.fingerprint]);
    const tags = attacker.tags ? attacker.tags.split(',').filter(Boolean) : [];
    
    // Determine risk level based on max severity in payload
    const maxSeverity = session.payloads.reduce((max, p) => {
        if(p.severity === 'Critical') return 3;
        if(p.severity === 'High' && max < 3) return 2;
        if(p.severity === 'Medium' && max < 2) return 1;
        return max;
    }, 0);
    const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
    const risk = riskLevels[maxSeverity];
    
    // Badges Style Map
    let badgeClass = 'bg-cyber-low-bg text-cyber-low-text border-cyber-low-border';
    if(risk === 'Critical') badgeClass = 'bg-cyber-critical-bg text-cyber-critical-text border-cyber-critical-border';
    else if(risk === 'High') badgeClass = 'bg-cyber-high-bg text-cyber-high-text border-cyber-high-border';
    else if(risk === 'Medium') badgeClass = 'bg-cyber-medium-bg text-cyber-medium-text border-cyber-medium-border';

    const lastSeen = session.payloads.length > 0 
       ? formatDistanceToNow(new Date(session.payloads[session.payloads.length-1].timestamp)) 
       : 'unknown';

    return (
        <div className="cyber-card flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold text-lg border border-cyber-border" style={{ backgroundColor: avatarColor + '40', color: avatarColor }}>
                        {initial}
                    </div>
                    <div>
                        <p className="mono-data font-bold text-[16px] text-white">{attacker.ip}</p>
                        <p className="text-cyber-text-secondary text-[12px] flex items-center gap-1">
                            {attacker.country === 'unknown' ? '🏴‍☠️ Unknown Origin' : `🌍 ${attacker.country}`}
                        </p>
                    </div>
                </div>
                <div className={`px-2 py-1 text-[11px] font-bold uppercase tracking-widest border rounded-[6px] ${badgeClass}`}>
                    {risk.toUpperCase()}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-2 p-3 bg-black rounded-lg border border-cyber-border">
                <div>
                   <p className="text-[10px] text-cyber-text-secondary uppercase tracking-widest mb-1">Total Attacks</p>
                   <p className="font-heading font-bold text-white text-lg">{session.payloads.length}</p>
                </div>
                <div>
                   <p className="text-[10px] text-cyber-text-secondary uppercase tracking-widest mb-1">ISP / ASN</p>
                   <p className="text-[12px] text-white truncate" title={attacker.organization}>{attacker.organization || 'Unknown'}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 text-[10px] text-cyber-text-secondary border border-cyber-border rounded bg-cyber-elevated uppercase tracking-wider">
                        {tag}
                    </span>
                ))}
                {session.tarpitActive && (
                    <span className="px-2 py-1 text-[10px] text-cyber-critical-text border border-cyber-critical-border rounded bg-cyber-critical-bg uppercase tracking-wider flex items-center gap-1">
                         <Network className="w-3 h-3 animate-spin duration-[3000ms]" /> TRAPPED
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between mt-auto pt-4">
               <p className="text-[11px] text-cyber-text-secondary">Last seen {lastSeen} ago</p>
               <div className="flex items-center gap-2">
                   <button onClick={() => setExpanded(!expanded)} className="btn btn-ghost !px-3 !py-1.5 !text-[12px]">
                       {expanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>} Profile
                   </button>
                   <button onClick={() => navigate('/stories')} className="btn btn-primary !px-3 !py-1.5 !text-[12px]">
                       <Play className="w-3 h-3" /> Story
                   </button>
               </div>
            </div>

            {expanded && (
                <div className="mt-4 pt-4 border-t border-cyber-border animate-entry">
                    <h4 className="section-header text-[12px] text-cyber-text-secondary uppercase tracking-widest mb-3">Attack Timeline</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {session.payloads.map(p => (
                            <div key={p.id} className="p-2 border-l-2 border-l-cyber-accent-red bg-black text-[11px] flex justify-between items-center">
                                <div className="flex flex-col gap-1 overflow-hidden">
                                    <span className="text-white font-bold">{p.surface.toUpperCase()} <span className="text-cyber-text-secondary font-normal">{p.method}</span></span>
                                    <span className="mono-data text-cyber-text-secondary truncate">{p.endpoint}</span>
                                </div>
                                <span className={`px-1 rounded text-[10px] ${p.severity === 'Critical' ? 'bg-cyber-accent-red text-white' : 'bg-cyber-elevated text-cyber-text-secondary'}`}>{p.severity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
