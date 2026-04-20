import { useState } from 'react';
import { Search, Info } from 'lucide-react';
import { format } from 'date-fns';

export default function PayloadHistory() {
    const [search, setSearch] = useState('');

    const stats = [
        { label: 'Payloads Analyzed', value: '142' },
        { label: 'Threats Detected', value: '118' },
        { label: 'Clean Payloads', value: '24' },
        { label: 'Average Score', value: '78' },
    ];

    const mockHistory = Array.from({length: 12}).map((_, i) => ({
        id: i,
        time: new Date(Date.now() - i * 3600000).toISOString(),
        preview: i%3 === 0 ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJz1..." : "1'; DROP TABLE users; --",
        type: i%3 === 0 ? "JWT TAMPERING" : "SQL INJECTION",
        score: i%3 === 0 ? 84 : 95,
        severity: i%3 === 0 ? "High" : "Critical"
    }));

    return (
        <div className="w-full max-w-[1600px] mx-auto px-6 py-8 flex flex-col gap-8 animate-entry">
            <div>
               <h1 className="page-title text-white">Analysis Archive</h1>
               <p className="text-cyber-text-secondary mt-1 font-sans">Historical log of manual heuristic extractions from the Payload Analyzer engine.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="bg-cyber-card border border-cyber-border rounded-xl p-6 text-center">
                        <div className="metric-num text-white leading-none tracking-tight">{s.value}</div>
                        <p className="font-sans text-[12px] font-bold text-cyber-text-secondary uppercase tracking-widest mt-4">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="cyber-card flex flex-col p-0 overflow-hidden min-h-[500px]">
                <div className="p-5 border-b border-cyber-border flex items-center justify-between">
                    <h2 className="section-header text-white uppercase tracking-widest text-[16px]">Extraction Logs</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 text-cyber-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                placeholder="Search hashes..." 
                                className="cyber-input py-2 pl-10 text-sm w-64"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans min-w-[800px]">
                        <thead>
                            <tr className="bg-[#0A0A0F] border-b border-cyber-border text-xs text-cyber-text-secondary uppercase tracking-[0.2em] font-bold">
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Payload Signature</th>
                                <th className="p-4">Classification</th>
                                <th className="p-4">Score</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border/50">
                            {mockHistory.map((row, i) => {
                                const isDark = i % 2 === 0;
                                let severityBadge = 'bg-cyber-critical-bg text-cyber-critical-text border-cyber-critical-border';
                                if (row.severity === 'High') severityBadge = 'bg-cyber-high-bg text-cyber-high-text border-cyber-high-border';

                                return (
                                    <tr key={i} className={`hover:bg-cyber-elevated transition-colors border-l-[3px] border-l-transparent hover:border-l-cyber-accent-blue ${isDark ? 'bg-[#0D0D1A]' : 'bg-[#111128]'}`}>
                                        <td className="p-4 font-mono text-[12px] text-cyber-text-secondary whitespace-nowrap">
                                            {format(new Date(row.time), 'yyyy-MM-dd HH:mm:ss')}
                                        </td>
                                        <td className="p-4 font-mono text-[13px] text-white">
                                            {row.preview}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                 <span className="font-bold text-white text-[13px]">{row.type}</span>
                                                 <span className={`px-2 py-0.5 text-[10px] font-bold tracking-widest border rounded inline-block uppercase ${severityBadge}`}>
                                                     {row.severity}
                                                 </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className={`font-heading font-bold text-[18px] leading-none ${row.score > 90 ? 'text-cyber-accent-red' : 'text-cyber-accent-warning'}`}>{row.score}</span>
                                                <div className="h-1 w-16 bg-black rounded overflow-hidden mt-1 px">
                                                    <div className="h-full bg-cyber-accent-red" style={{width: `${row.score}%`}}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button className="btn btn-secondary !px-4 !py-1.5 !text-[12px] flex flex-nowrap shrink-0 whitespace-nowrap shadow-glow-blue">
                                                <Info className="w-3 h-3" /> Full Report
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
