import { useState, useMemo } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { Copy, Bot, Play, Maximize2 } from 'lucide-react';

export default function AttacksTable({ attacks, onReplay }) {
    const [search, setSearch] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('All');

    const filteredAttacks = useMemo(() => {
        return attacks.filter(a => {
            const matchesSearch = a.session?.attacker?.ip.includes(search) || a.surface.toLowerCase().includes(search.toLowerCase());
            const matchesSeverity = filterSeverity === 'All' || a.severity === filterSeverity;
            return matchesSearch && matchesSeverity;
        });
    }, [attacks, search, filterSeverity]);

    const Row = ({ index, style }) => {
        const attack = filteredAttacks[index];
        const isDark = index % 2 === 0;
        
        let severityBadge = 'bg-cyber-low-bg text-cyber-low-text border-cyber-low-border';
        let scoreColor = 'bg-cyber-accent-success';
        if (attack.severity === 'Critical') {
            severityBadge = 'bg-cyber-critical-bg text-cyber-critical-text border-cyber-critical-border';
            scoreColor = 'bg-cyber-accent-red';
        } else if (attack.severity === 'High') {
            severityBadge = 'bg-cyber-high-bg text-cyber-high-text border-cyber-high-border';
            scoreColor = 'bg-cyber-accent-warning';
        } else if (attack.severity === 'Medium') {
            severityBadge = 'bg-cyber-medium-bg text-cyber-medium-text border-cyber-medium-border';
            scoreColor = 'bg-cyber-accent-gold';
        }

        const score = Math.round((attack.aiInsight?.threatScore || Math.random()) * 100);

        return (
            <div style={style} className={`flex items-center group transition-colors cursor-pointer border-l-[3px] border-l-transparent hover:border-l-cyber-accent-red hover:bg-cyber-elevated ${isDark ? 'bg-[#0D0D1A]' : 'bg-[#111128]'}`}>
                <div className="w-[10%] px-4 font-mono text-[12px] text-cyber-text-secondary whitespace-nowrap overflow-hidden">
                    {formatDistanceToNow(new Date(attack.timestamp), { addSuffix: true })}
                </div>
                <div className="w-[15%] px-4 font-mono text-[13px] text-white flex items-center justify-between">
                    {attack.session?.attacker?.ip} <Copy className="w-3 h-3 text-cyber-text-secondary hover:text-white cursor-pointer" />
                </div>
                <div className="w-[10%] px-4 flex items-center gap-2">
                     {attack.session?.attacker?.country === 'unknown' ? '🏴‍☠️' : '🌍'}
                     <span className="text-[12px] text-white truncate w-16">{attack.session?.attacker?.country}</span>
                </div>
                <div className="w-[15%] px-4">
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase border border-cyber-border rounded bg-black text-white">{attack.surface}</span>
                </div>
                <div className="w-[10%] px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded inline-block ${severityBadge}`}>
                        {attack.severity}
                    </span>
                </div>
                <div className="w-[15%] px-4 flex items-center gap-2">
                    <span className="text-[11px] text-cyber-text-secondary w-6">{score}</span>
                    <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                        <div className={`h-full ${scoreColor} rounded-full`} style={{ width: `${score}%` }}></div>
                    </div>
                </div>
                <div className="w-[15%] px-4 flex items-center gap-2 relative group-hover/payload">
                    <span className="mono-data text-[11px] text-cyber-text-secondary truncate w-full cursor-help relative z-10" title={attack.payloadPreview}>
                        {attack.payloadPreview || 'No payload preview available...'}
                    </span>
                    <AuthorizeTooltip payload={attack.payloadPreview} />
                </div>
                <div className="w-[10%] px-4 flex items-center gap-2 justify-end">
                    {attack.session?.tarpitActive && <span className="px-1.5 py-0.5 text-[9px] bg-cyber-critical-bg text-cyber-critical-text border border-cyber-critical-border uppercase rounded font-bold">Trapped</span>}
                    <button className="text-cyber-accent-blue hover:bg-cyber-accent-blue/10 p-1.5 rounded"><Bot className="w-4 h-4" /></button>
                    <button onClick={() => onReplay(attack.session.id)} className="text-cyber-text-secondary hover:text-white p-1.5 rounded"><Play className="w-4 h-4" /></button>
                </div>
            </div>
        );
    };

    return (
        <div className="cyber-card flex flex-col p-0 overflow-hidden h-[600px] hover:border-cyber-border hover:shadow-none">
            <div className="p-5 border-b border-cyber-border flex items-center justify-between">
                <h2 className="page-title text-[24px]">Attack Ledger</h2>
                <div className="flex items-center gap-4">
                    <input 
                        type="text" 
                        placeholder="Search IP or Surface..." 
                        className="cyber-input py-2 text-sm w-64"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select className="cyber-input py-2 text-sm" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
                        <option value="All">All Severities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>

            <div className="flex bg-[#0A0A0F] border-b border-cyber-border py-4 uppercase text-[11px] font-bold text-cyber-text-secondary tracking-widest">
                <div className="w-[10%] px-4">Time</div>
                <div className="w-[15%] px-4">IP Address</div>
                <div className="w-[10%] px-4">Origin</div>
                <div className="w-[15%] px-4">Surface</div>
                <div className="w-[10%] px-4">Severity</div>
                <div className="w-[15%] px-4">Score</div>
                <div className="w-[15%] px-4">Payload</div>
                <div className="w-[10%] px-4 text-right">Actions</div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[460px]">
                {filteredAttacks.length > 0 ? (
                    filteredAttacks.slice(0, 50).map((attack, index) => (
                        <Row key={attack.id || index} index={index} 
                            style={{ height: '60px' }} 
                        />
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-cyber-text-secondary mt-12">No matching attacks found.</div>
                )}
            </div>
        </div>
    );
}

function AuthorizeTooltip({ payload }) {
    if (!payload) return null;
    return (
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover/payload:block z-[100] w-96 bg-black border border-cyber-border rounded-lg p-3 shadow-xl">
            <p className="mono-data text-[11px] text-white whitespace-pre-wrap break-all">{payload}</p>
        </div>
    );
}
