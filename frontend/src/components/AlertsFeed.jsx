import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertsFeed({ attacks }) {
    
    const unreadCount = attacks.length; // In a full app, track 'read' state

    return (
        <div className="bg-cyber-card border border-cyber-border rounded-xl flex flex-col h-full hover:border-cyber-accent-red hover:shadow-[0_0_20px_rgba(230,57,70,0.12)] transition-all overflow-hidden max-h-[480px]">
            <div className="p-5 border-b border-cyber-border flex items-center justify-between bg-cyber-elevated/50">
                <h2 className="section-header text-white uppercase tracking-widest text-[12px]">LIVE ALERTS</h2>
                {unreadCount > 0 && (
                    <div className="bg-cyber-accent-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} NEW
                    </div>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cyber-bg">
                <AnimatePresence initial={false}>
                    {attacks.map((attack) => {
                        const time = format(new Date(attack.timestamp), 'HH:mm:ss');
                        
                        let borderClass = 'border-l-cyber-accent-success';
                        let severityBadge = 'bg-cyber-low-bg text-cyber-low-text border-cyber-low-border';
                        let scoreColor = 'bg-cyber-accent-success';

                        if (attack.severity === 'Critical') {
                            borderClass = 'border-l-cyber-critical-border border-cyber-critical-border';
                            severityBadge = 'bg-cyber-critical-bg text-cyber-critical-text border-cyber-critical-border shadow-[0_0_10px_rgba(230,57,70,0.3)]';
                            scoreColor = 'bg-cyber-accent-red';
                        } else if (attack.severity === 'High') {
                            borderClass = 'border-l-cyber-high-border';
                            severityBadge = 'bg-cyber-high-bg text-cyber-high-text border-cyber-high-border';
                            scoreColor = 'bg-cyber-accent-warning';
                        } else if (attack.severity === 'Medium') {
                            borderClass = 'border-l-cyber-medium-border';
                            severityBadge = 'bg-cyber-medium-bg text-cyber-medium-text border-cyber-medium-border';
                            scoreColor = 'bg-cyber-accent-gold';
                        }

                        const score = Math.round((attack.aiInsight?.threatScore || Math.random()) * 100);

                        return (
                            <motion.div 
                                key={attack.id}
                                layout
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`p-4 bg-cyber-card border border-cyber-border border-l-4 rounded-lg flex flex-col gap-3 hover:bg-cyber-elevated cursor-pointer transition-colors ${borderClass}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded-[4px] ${severityBadge}`}>
                                        {attack.severity}
                                    </span>
                                    <span className="mono-data text-cyber-text-secondary">{time}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white uppercase text-[13px] truncate">{attack.surface} EXPL0IT</span>
                                    <span className="text-cyber-text-secondary text-sm">—</span>
                                    <span className="mono-data font-bold text-white flex items-center gap-2">
                                      {attack.session?.attacker?.ip || 'Unknown'}
                                      {attack.session?.attacker?.country === 'unknown' ? '🏴‍☠️' : '🌍'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] text-cyber-text-secondary w-10">TS: {score}</span>
                                    <div className="flex-1 h-1.5 bg-cyber-elevated rounded-full overflow-hidden">
                                        <div className={`h-full ${scoreColor} rounded-full`} style={{ width: `${score}%` }}></div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
