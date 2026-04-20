import { useEffect, useState } from 'react';

/** CountUp animated number */
const CountUp = ({ value }) => {
    const [display, setDisplay] = useState(0);
    
    useEffect(() => {
        if (display === value) return;
        const duration = 1000;
        const frames = 30;
        const step = (value - display) / frames;
        
        let currentIter = 0;
        const interval = setInterval(() => {
            currentIter++;
            setDisplay(prev => {
                const next = prev + step;
                return currentIter === frames ? value : next;
            });
            if(currentIter === frames) clearInterval(interval);
        }, duration / frames);
        
        return () => clearInterval(interval);
    }, [value]);

    return <span>{Math.round(display).toLocaleString()}</span>;
};

export default function MetricCards({ stats }) {
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const cards = [
        { label: 'Total Attacks Today', value: stats.totalAttacks, accent: '#E63946' },
        { label: 'Active Tarpitted Sessions', value: stats.activeSessions, accent: '#F4A261' },
        { label: 'Critical Threats', value: stats.criticalThreats, accent: '#E63946', pulse: true },
        { label: 'Countries Detected', value: stats.countriesDetected, accent: '#4361EE' },
        { label: 'Time Wasted', value: stats.totalTarpitTime, accent: '#FFD700', isTime: true },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {cards.map((card, i) => (
                <div key={i} className="bg-cyber-card border border-cyber-border rounded-xl p-5 relative overflow-hidden group shadow-lg transition-all duration-200 hover:border-cyber-accent-red hover:shadow-[0_0_20px_rgba(230,57,70,0.12)]">
                    <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: card.accent }} />
                    <div className="mt-2 text-center">
                        <div className={`metric-num text-white leading-none tracking-tight ${card.pulse ? 'animate-pulse text-cyber-accent-red' : ''}`}>
                            {card.isTime ? formatTime(card.value) : <CountUp value={card.value || 0} />}
                        </div>
                        <p className="font-sans text-[12px] font-bold text-cyber-text-secondary uppercase tracking-widest mt-4">
                            {card.label}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
