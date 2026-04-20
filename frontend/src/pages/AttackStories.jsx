import { useState, useEffect } from 'react';

const API_BASE = `http://${window.location.hostname}:3001`;
import { useLocation } from 'react-router-dom';
import { Play, ShieldAlert, FastForward, PauseCircle, PlayCircle, SkipBack, SkipForward, X, Network } from 'lucide-react';
import SpiderWebIcon from '../components/SpiderWebIcon';

export default function AttackStories() {
    const location = useLocation();
    const [sessions, setSessions] = useState([]);
    const [activeStory, setActiveStory] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/api/sessions`).then(r => r.json()).then(data => {
            const valid = data.filter(s => s.payloads.length >= 3);
            setSessions(valid);
            
            if (location.state?.sessionId) {
                const target = valid.find(s => s.id === location.state.sessionId);
                if (target) setActiveStory(target);
            }
        });
    }, [location]);

    // Ensure Russia, Ukraine, Germany are featured first
    const sortedSessions = [...sessions].sort((a, b) => {
        const featured = ['Russia', 'Ukraine', 'Germany'];
        const aFeat = featured.includes(a.attacker.country);
        const bFeat = featured.includes(b.attacker.country);
        if (aFeat && !bFeat) return -1;
        if (!aFeat && bFeat) return 1;
        return b.payloads.length - a.payloads.length;
    });

    return (
        <div className="w-full max-w-[1600px] mx-auto px-6 py-8 flex flex-col gap-8 animate-entry pb-24">
            <div>
               <h1 className="page-title text-white">ATTACK STORIES</h1>
               <p className="font-heading italic text-cyber-accent-red mt-1 text-lg">Every attacker has a story. Ours just ends with them trapped.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {sortedSessions.map(session => (
                    <StoryCard 
                        key={session.id} 
                        session={session} 
                        onPlay={() => setActiveStory(session)} 
                        isFeatured={['Russia', 'Ukraine', 'Germany'].includes(session.attacker.country)} 
                    />
                ))}
            </div>

            {activeStory && (
                <StoryModal session={activeStory} onClose={() => setActiveStory(null)} />
            )}
        </div>
    );
}

function StoryCard({ session, onPlay, isFeatured }) {
    const attacker = session.attacker;
    const durationMs = new Date(session.payloads[session.payloads.length-1].timestamp) - new Date(session.payloads[0].timestamp);
    const m = Math.floor(durationMs / 60000);
    const s = Math.floor((durationMs % 60000) / 1000);

    return (
        <div className="cyber-card relative overflow-hidden flex flex-col group h-64 border-cyber-accent-red/20 hover:border-cyber-accent-red">
            {/* Background Red Glow */}
            <div className="absolute inset-0 bg-cyber-accent-red/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            
            {isFeatured && (
                <div className="absolute top-4 right-4 bg-cyber-accent-gold/20 text-cyber-accent-gold border border-cyber-accent-gold/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                    Featured
                </div>
            )}

            <div className="flex items-start gap-4 z-10 relative">
                <div className="text-4xl">{attacker.country === 'unknown' ? '🏴‍☠️' : '🌍'}</div>
                <div>
                    <h3 className="mono-data font-bold text-lg text-white">{attacker.ip}</h3>
                    <p className="text-cyber-text-secondary text-xs uppercase tracking-widest">{attacker.country}</p>
                </div>
            </div>

            <p className="font-sans text-sm text-[#8888AA] mt-4 flex-1 z-10 relative line-clamp-2">
                "Multi-stage intrusion attempt targeting {session.payloads[0].surface} vulnerabilities resulting in tarpit classification."
            </p>

            <div className="flex items-end justify-between z-10 relative mt-auto border-t border-cyber-border pt-4">
                <div className="flex flex-col gap-1">
                    <span className="mono-data text-[11px] text-cyber-text-secondary">{m}m {s}s duration</span>
                    <span className="mono-data text-[11px] text-cyber-text-secondary">6 chapters</span>
                </div>
                <button onClick={onPlay} className="btn btn-primary text-xs shadow-glow-red !px-4 !py-2">
                    <Play className="w-4 h-4" /> Watch Story
                </button>
            </div>
        </div>
    );
}

// Full Cinematic Modal
function StoryModal({ session, onClose }) {
    const chapters = [
        "Attacker Connected",
        "Reconnaissance",
        "First Strike",
        "Escalation",
        "The Trap",
        "Intelligence Gathered"
    ];
    
    const [chapterIdx, setChapterIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(1);
    
    // Auto advance chapters perfectly matching the 6-chapter breakdown pacing
    useEffect(() => {
        if (!isPlaying) return;
        const baseDuration = [4000, 5000, 6000, 5000, 6000, 8000][chapterIdx];
        const timeout = setTimeout(() => {
            if (chapterIdx < 5) setChapterIdx(c => c + 1);
            else setIsPlaying(false);
        }, baseDuration / speed);
        return () => clearTimeout(timeout);
    }, [chapterIdx, isPlaying, speed]);

    return (
        <div className="fixed inset-0 z-[100] bg-[#0A0A0F] flex flex-col animate-entry">
            {/* Top Bar */}
            <div className="h-16 border-b border-cyber-border flex items-center justify-between px-6 shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <ShieldAlert className="w-6 h-6 text-cyber-accent-red" />
                    <span className="font-heading font-bold text-white uppercase tracking-widest">Operation: Red Dawn // {session.attacker.ip}</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="btn btn-secondary !px-4 !py-1 text-xs">
                         Narrate (AI)
                    </button>
                    <button onClick={onClose} className="text-cyber-text-secondary hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-[280px] border-r border-cyber-border bg-[#0D0D1A] shrink-0 p-6 flex flex-col gap-6 overflow-y-auto">
                    <h3 className="section-header text-cyber-text-secondary text-[12px] uppercase">Chapters</h3>
                    <div className="flex flex-col gap-4 relative">
                        <div className="absolute left-2.5 top-2 bottom-2 w-px bg-cyber-border z-0"></div>
                        {chapters.map((cap, i) => {
                            const isPast = i < chapterIdx;
                            const isActive = i === chapterIdx;
                            return (
                                <div key={i} className="flex gap-4 relative z-10 items-center">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-[#0D0D1A] ${isActive ? 'border-cyber-accent-red text-cyber-accent-red font-bold text-[10px]' : isPast ? 'border-cyber-accent-success text-cyber-accent-success' : 'border-cyber-text-secondary text-transparent'}`}>
                                        {isPast && !isActive ? '✓' : ''}
                                        {isActive ? '❯' : ''}
                                    </div>
                                    <div className={`font-sans font-bold text-[13px] ${isActive ? 'text-white' : isPast ? 'text-cyber-text-secondary' : 'text-[#444466]'}`}>
                                        {cap}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Center Content Component Selector */}
                <div className="flex-1 bg-black relative flex items-center justify-center p-8 overflow-hidden">
                    {chapterIdx === 0 && <ChapterOne session={session} />}
                    {chapterIdx === 1 && <ChapterTwo session={session} />}
                    {chapterIdx === 2 && <ChapterThree session={session} />}
                    {chapterIdx === 3 && <ChapterFour session={session} />}
                    {chapterIdx === 4 && <ChapterFive session={session} />}
                    {chapterIdx === 5 && <ChapterSix session={session} />}
                </div>

                {/* Right AI Sidebar */}
                <div className="w-[300px] border-l border-cyber-border bg-[#0D0D1A] shrink-0 p-6 flex flex-col">
                    <h3 className="section-header text-cyber-text-secondary text-[12px] uppercase mb-4">Claude Narration</h3>
                    <div className="flex-1 overflow-y-auto font-sans text-[14px] text-cyber-text-secondary leading-relaxed">
                        <p className="mb-4">"The entity originating from {session.attacker.ip} established handshakes across perimeter routers at {new Date(session.payloads[0]?.timestamp).toISOString()}."</p>
                        {chapterIdx > 1 && <p className="mb-4">"Initial reconnaissance probed structural integrities inside the REST API matrix, searching for low-hanging fruit."</p>}
                        {chapterIdx > 2 && <p className="mb-4 text-white">"A hostile SQL Injection payload was fired seamlessly, confirming Malicious intent. We allowed it to sink into the isolation layer."</p>}
                        {chapterIdx > 4 && <p className="mb-4 text-cyber-accent-red">"The trap is closed. Connection latency artificially inflated. The adversary is trapped in our infinite response loop."</p>}
                    </div>
                </div>
            </div>

            {/* Playback Controls */}
            <div className="h-20 border-t border-cyber-border bg-[#0A0A0F] shrink-0 flex flex-col justify-center px-6 relative z-20">
                <div className="absolute top-0 left-0 right-0 h-1 bg-cyber-elevated">
                     <div className="h-full bg-cyber-accent-red transition-all duration-300" style={{ width: `${((chapterIdx + 1) / 6) * 100}%` }}></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className="mono-data text-white font-bold">0{chapterIdx+1} : 06</div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setChapterIdx(Math.max(0, chapterIdx-1))} className="text-cyber-text-secondary hover:text-white"><SkipBack className="w-5 h-5" /></button>
                        <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-cyber-accent-red transition-colors">
                            {isPlaying ? <PauseCircle className="w-10 h-10" /> : <PlayCircle className="w-10 h-10" />}
                        </button>
                        <button onClick={() => setChapterIdx(Math.min(5, chapterIdx+1))} className="text-cyber-text-secondary hover:text-white"><SkipForward className="w-5 h-5" /></button>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 5].map(s => (
                            <button key={s} onClick={() => setSpeed(s)} className={`px-2 py-1 text-[11px] font-mono border rounded ${speed === s ? 'bg-cyber-text-secondary text-black font-bold' : 'text-cyber-text-secondary border-cyber-border'}`}>
                                {s}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// MOCK CHAPTER VISUALS
function ChapterOne({ session }) {
    return (
        <div className="flex items-center justify-center flex-col animate-entry">
             <div className="w-48 h-48 border border-cyber-border rounded-full flex items-center justify-center relative mb-8" style={{ background: 'radial-gradient(circle, rgba(67, 97, 238, 0.1) 0%, transparent 70%)'}}>
                 <div className="w-2 h-2 rounded-full bg-cyber-accent-blue animate-ping absolute"></div>
                 <div className="w-4 h-4 rounded-full bg-cyber-accent-blue relative z-10 border-2 border-black"></div>
             </div>
             <p className="mono-data text-white text-xl text-center typewriter-text">NODE DETECTED</p>
             <p className="mono-data text-cyber-accent-blue text-center mt-2">{session.attacker.ip} [{session.attacker.country}]</p>
             <p className="mono-data text-cyber-text-secondary text-sm text-center mt-4 tracking-widest">{session.attacker.fingerprint.substring(0, 32)}</p>
        </div>
    )
}

function ChapterTwo({ session }) {
    const list = ["/login", "/api/v1/users", "/admin/settings", "/files/backup.sql", "/ssh/keys"];
    return (
        <div className="flex flex-col gap-4 animate-entry w-full max-w-md">
            {list.map((l, i) => (
                <div key={i} className="flex justify-between p-4 border border-cyber-border bg-cyber-card" style={{ animation: `fadeSlideIn ${i*0.5}s forwards`, opacity: 0 }}>
                    <span className="font-bold text-white font-sans">GET</span>
                    <span className="mono-data text-cyber-accent-blue">{l}</span>
                </div>
            ))}
            <style dangerouslySetInnerHTML={{__html: `@keyframes fadeSlideIn { to { opacity: 1; transform: translateX(10px); } }`}}/>
        </div>
    )
}

function ChapterThree({ session }) {
    return (
        <div className="w-full max-w-3xl flex items-start gap-8 animate-entry">
             <div className="flex-1 bg-[#0A0A0F] border border-cyber-border p-6 rounded relative shadow-[0_0_50px_rgba(230,57,70,0.1)]">
                 <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyber-accent-red animate-pulse"></span>
                      <span className="text-[10px] font-bold uppercase text-cyber-accent-red tracking-widest">Malicious Payload</span>
                 </div>
                 <p className="mono-data text-[14px] text-cyber-text-secondary leading-relaxed mt-4">
                     {session.payloads[0]?.payloadPreview || "SELECT * FROM users WHERE '1'='1'"}
                 </p>
             </div>
             <div className="w-48 shrink-0 flex flex-col items-center">
                 <h4 className="section-header text-cyber-accent-red text-center mb-4">THREAT SCORE</h4>
                 <div className="metric-num text-white animate-pulse">98</div>
                 <div className="w-full h-2 bg-cyber-border mt-4">
                     <div className="h-full bg-cyber-accent-red w-full animate-entry"></div>
                 </div>
             </div>
        </div>
    )
}

function ChapterFour() {
    return (
        <div className="w-full max-w-2xl h-64 border border-cyber-border text-center flex flex-col justify-center animate-entry bg-cyber-card relative overflow-hidden">
             <h3 className="section-header text-white mb-2 z-10 w-full text-center">ATTACK FREQUENCY SURGE</h3>
             <div className="flex items-end justify-center gap-2 h-32 z-10">
                 {[10, 40, 20, 60, 30, 80, 100].map((h, i) => (
                     <div key={i} className="w-8 bg-cyber-accent-red" style={{ height: `${h}%`, animation: `grow ${i*0.2}s forwards`, transformOrigin: 'bottom', transform: 'scaleY(0)' }}></div>
                 ))}
             </div>
             <style dangerouslySetInnerHTML={{__html:`@keyframes grow { to { transform: scaleY(1); } }`}}/>
        </div>
    )
}

function ChapterFive() {
    return (
        <div className="flex flex-col items-center justify-center animate-entry relative">
            <SpiderWebIcon className="w-64 h-64 absolute opacity-10 animate-spin transition-all duration-[5000ms] scale-[2.0]" color="#E63946" />
            <div className="bg-cyber-critical-bg border-2 border-cyber-critical-border px-12 py-6 rounded z-10 text-center shadow-glow-red">
                <Network className="w-16 h-16 text-cyber-accent-red animate-pulse mx-auto mb-4" />
                <h2 className="font-heading font-bold text-cyber-accent-red text-4xl tracking-[0.3em] uppercase">TRAPPED</h2>
            </div>
            <p className="mono-data text-white mt-8 z-10">Artificially dilating connection by +35,000ms</p>
        </div>
    )
}

function ChapterSix({ session }) {
    const tags = session.attacker.tags ? session.attacker.tags.split(',') : ['Automated Scanner', 'SQLi Attempt'];
    return (
        <div className="w-full max-w-2xl animate-entry">
            <h2 className="section-header text-white mb-8 border-b border-cyber-border pb-4 text-center">THREAT INTEL EXTRACTED</h2>
            <div className="grid grid-cols-2 gap-4">
                {tags.map((t, i) => (
                    <div key={i} className="bg-cyber-card border border-cyber-accent-blue/50 p-4 shadow-glow-blue rounded flex items-center justify-center text-center">
                        <span className="font-sans font-bold text-white text-sm uppercase tracking-widest">{t}</span>
                    </div>
                ))}
            </div>
            <div className="mt-8 bg-[#0A0A0F] border border-cyber-border p-4 rounded-lg font-mono text-sm text-[#444466] border-l-2 border-l-cyber-accent-success">
                // Recommended Action
                <br/>
                Add firewall rule blocking subnet: {session.attacker.ip.split('.').slice(0,3).join('.')}.0/24
            </div>
        </div>
    )
}
