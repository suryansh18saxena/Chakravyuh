import { useState } from 'react';
import { Database, BrainCircuit, MessageSquare, Bot, AlertTriangle, RotateCcw, MonitorPlay, Volume2, Moon } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

export default function Settings() {
    const { addToast } = useGlobal();

    const [seedConfirm, setSeedConfirm] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [arcsEnabled, setArcsEnabled] = useState(true);
    const [rotationEnabled, setRotationEnabled] = useState(true);

    const playPing = () => {
        if (!soundEnabled) return;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
    };

    const StatusRow = ({ icon: Icon, label, status }) => (
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3 text-white font-sans">
                <Icon className="w-5 h-5 text-cyber-text-secondary" />
                {label}
            </div>
            <div className="flex items-center gap-4">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded ${status === 'connected' ? 'bg-cyber-accent-success/10 text-cyber-accent-success border-cyber-accent-success/30' : 'bg-cyber-accent-red/10 text-cyber-accent-red border-cyber-accent-red/30'}`}>
                    {status}
                </span>
                <button className="btn btn-ghost !px-3 !py-1 !text-xs" onClick={() => addToast({ type: `Testing ${label}...`, ip: '127.0.0.1' })}>Test</button>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8 animate-entry">
            <div className="mb-4">
                <h1 className="page-title text-white">System Settings</h1>
                <p className="text-cyber-text-secondary mt-1 font-sans">Configure core honeypot parameters and local display preferences.</p>
            </div>

            <section className="bg-cyber-card border border-cyber-border rounded-xl flex flex-col overflow-hidden">
                <div className="p-5 border-b border-cyber-border bg-cyber-elevated/30">
                    <h2 className="section-header text-white">System Configuration</h2>
                </div>
                <div className="p-6 divide-y divide-cyber-border flex flex-col">
                    <StatusRow icon={Database} label="PostgreSQL Data Layer" status="connected" />
                    <StatusRow icon={BrainCircuit} label="ML Anomaly Microservice" status="connected" />
                    <StatusRow icon={MessageSquare} label="Telegram Alerting Bot" status="disconnected" />
                    <StatusRow icon={Bot} label="Anthropic Claude API" status="connected" />
                </div>
            </section>

            <section className="bg-cyber-card border border-cyber-border rounded-xl flex flex-col overflow-hidden">
                <div className="p-5 border-b border-cyber-border bg-cyber-elevated/30">
                    <h2 className="section-header text-white">Alert Configuration</h2>
                </div>
                <div className="p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-sans font-bold">Telegram Forwarding</p>
                            <p className="text-cyber-text-secondary text-sm">Forward critical events to SOC channel.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-cyber-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cyber-text-secondary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-accent-blue peer-checked:after:bg-white"></div>
                        </label>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-cyber-text-secondary">Telegram Chat ID</label>
                        <input type="text" className="cyber-input w-full max-w-sm" placeholder="-10092384729" disabled />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-cyber-text-secondary">Minimum Severity Threshold</label>
                        <select className="cyber-input w-full max-w-sm text-white">
                            <option value="Critical">Critical</option>
                            <option value="High">High & Above</option>
                            <option value="Medium">Medium & Above</option>
                            <option value="Low">All Events</option>
                        </select>
                    </div>

                    <button className="btn btn-secondary w-fit mt-2 shadow-glow-blue" onClick={() => addToast({ type: 'Alert test dispatched' })}>
                        <AlertTriangle className="w-4 h-4" /> TEST ALERT PIPELINE
                    </button>
                </div>
            </section>

            <section className="bg-cyber-card border border-cyber-border rounded-xl flex flex-col overflow-hidden">
                <div className="p-5 border-b border-cyber-border bg-cyber-elevated/30">
                    <h2 className="section-header text-white">Display Preferences</h2>
                </div>
                <div className="p-6 flex flex-col gap-6">
                    
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <RotateCcw className="w-5 h-5 text-cyber-text-secondary" />
                            <div>
                                <p className="text-white font-sans font-bold">Globe Auto-Rotation</p>
                                <p className="text-cyber-text-secondary text-sm shrink-0">Slowly pans the 3D threat map.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={rotationEnabled} onChange={e => setRotationEnabled(e.target.checked)} />
                          <div className="w-11 h-6 bg-cyber-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cyber-text-secondary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-accent-success peer-checked:after:bg-white"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <MonitorPlay className="w-5 h-5 text-cyber-text-secondary" />
                            <div>
                                <p className="text-white font-sans font-bold">Attack Arc Animations</p>
                                <p className="text-cyber-text-secondary text-sm">Draw live trajectory lines from attacker origins.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={arcsEnabled} onChange={e => setArcsEnabled(e.target.checked)} />
                          <div className="w-11 h-6 bg-cyber-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cyber-text-secondary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-accent-success peer-checked:after:bg-white"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-cyber-text-secondary" />
                            <div>
                                <p className="text-white font-sans font-bold">Sound Alerts (Web Audio API)</p>
                                <p className="text-cyber-text-secondary text-sm">Play a subtle radar ping on new Critical events.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="btn btn-ghost !px-3 !py-1 !text-xs" onClick={playPing}>Play Sample</button>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={soundEnabled} onChange={e => setSoundEnabled(e.target.checked)} />
                              <div className="w-11 h-6 bg-cyber-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cyber-text-secondary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-accent-blue peer-checked:after:bg-white"></div>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-between group border-t border-cyber-border pt-6 opacity-60">
                        <div className="flex items-center gap-3 group relative cursor-not-allowed">
                            <Moon className="w-5 h-5 text-cyber-text-secondary" />
                            <div>
                                <p className="text-white font-sans font-bold flex items-center gap-2">
                                    Dark Mode 
                                    <span className="px-2 py-0.5 text-[8px] bg-cyber-elevated border border-cyber-border rounded font-bold uppercase tracking-widest text-[#8888AA]">Forced</span>
                                </p>
                                <p className="text-cyber-text-secondary text-sm">Light mode does not exist in a SOC.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-not-allowed">
                          <input type="checkbox" className="sr-only peer" checked readOnly disabled />
                          <div className="w-11 h-6 bg-cyber-accent-success rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>
                </div>
            </section>

            <section className="bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMGQwZDFhIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMWUxZTNhIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] border border-cyber-accent-red/30 rounded-xl flex flex-col overflow-hidden mb-16 shadow-[0_0_30px_rgba(230,57,70,0.05)]">
                <div className="p-5 border-b border-cyber-accent-red/30 bg-cyber-critical-bg/50 backdrop-blur-md">
                    <h2 className="section-header text-cyber-accent-red flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Danger Zone: Demo Controls
                    </h2>
                </div>
                <div className="p-6 flex flex-col gap-6 bg-[#0D0D1A]/95 backdrop-blur-md">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                            <p className="text-white font-sans font-bold">Seed Synthesized Data</p>
                            <p className="text-cyber-text-secondary text-sm">Inject 100 fake attacker sessions to populate the dashboard.</p>
                        </div>
                        <button className="btn bg-transparent border border-cyber-accent-red text-cyber-accent-red hover:bg-cyber-accent-red hover:text-white hover:shadow-glow-red font-mono tracking-widest uppercase text-xs">
                            Run Seed Script
                        </button>
                    </div>

                    <div className="w-full h-px bg-cyber-accent-red/20 my-2"></div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-white font-sans font-bold">Wipe Database</p>
                            <p className="text-cyber-text-secondary text-sm">This will permanently destroy all captured payload and session data.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <input 
                                type="text" 
                                placeholder="Type CONFIRM to enable" 
                                className="cyber-input w-full max-w-sm border-cyber-accent-red/50 focus:border-cyber-accent-red text-center tracking-widest placeholder:tracking-normal placeholder:normal-case font-mono uppercase"
                                value={seedConfirm}
                                onChange={e => setSeedConfirm(e.target.value)}
                            />
                            <button 
                                className="btn btn-primary w-full sm:w-auto uppercase tracking-widest text-xs font-mono shadow-glow-red disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={seedConfirm.toUpperCase() !== 'CONFIRM'}
                            >
                                Clear All Data
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
