import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Box, BrainCircuit, Globe, Activity, ShieldAlert, Clock } from 'lucide-react';
import SpiderWebIcon from '../components/SpiderWebIcon';

export default function LandingPage() {
    const navigate = useNavigate();
    const [typingText, setTypingText] = useState('');
    const phrases = [
        "Honeypot Active — 15 sessions monitored", 
        "Tarpit Engaged — 3 attackers trapped", 
        "AI Analysis Ready — Claude API connected"
    ];
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        let currentText = '';
        let targetText = phrases[phraseIndex];
        let isDeleting = false;
        let charIndex = 0;

        const type = () => {
            if (!isDeleting && charIndex <= targetText.length) {
                setTypingText(targetText.slice(0, charIndex));
                charIndex++;
                if (charIndex > targetText.length) {
                    isDeleting = true;
                    setTimeout(type, 3000);
                } else {
                    setTimeout(type, 80);
                }
            } else if (isDeleting && charIndex > 0) {
                charIndex--;
                setTypingText(targetText.slice(0, charIndex));
                if (charIndex === 0) {
                    isDeleting = false;
                    setPhraseIndex((prev) => (prev + 1) % phrases.length);
                } else {
                    setTimeout(type, 40);
                }
            }
        };
        const timer = setTimeout(type, 500);
        return () => clearTimeout(timer);
    }, [phraseIndex]);

    return (
        <div className="w-full flex flex-col items-center relative overflow-hidden -mt-[64px] pt-[64px]">
            {/* Animated Grid Background */}
            <div 
                className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                style={{
                  backgroundImage: 'radial-gradient(circle at center, #1E1E3A 1.5px, transparent 1.5px)',
                  backgroundSize: '32px 32px',
                  animation: 'pulseGrid 4s ease-in-out infinite alternate'
                }} 
            />
            <style dangerouslySetInnerHTML={{__html: `@keyframes pulseGrid { from { opacity: 0.1; } to { opacity: 0.3; } }`}} />

            <div className="w-full max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center z-10 min-h-screen">
                
                {/* Rotating 120px Spiderweb */}
                <div className="mb-12" style={{ animation: 'spin 20s linear infinite' }}>
                    <SpiderWebIcon className="w-[120px] h-[120px]" color="#E63946" />
                </div>

                <h1 className="font-heading font-bold text-[72px] text-white leading-tight">Chakravyuh</h1>
                <h2 className="font-heading text-[24px] text-cyber-text-secondary mt-2">Intelligent Honeypot Defense System</h2>
                <p className="font-sans italic text-[18px] text-cyber-accent-red mt-6 font-semibold">"Enter. Never Escape."</p>

                {/* Status Bar */}
                <div className="mt-12 mb-12 h-[50px] bg-cyber-elevated border border-cyber-border rounded-lg px-6 flex items-center justify-center">
                    <div className="font-mono text-[14px] text-cyber-accent-success flex items-center gap-2">
                        <span>&gt;</span>
                        <span>{typingText}</span>
                        <span className="w-2 h-4 bg-cyber-accent-success animate-pulse inline-block"></span>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary text-xl shadow-glow-red">
                        Enter the Trap <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-secondary text-xl">
                        View Dashboard
                    </button>
                </div>

                {/* Stat Pills Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24 w-full text-left">
                    <StatPill label="Total Attacks Today" value="3,142" icon={ShieldAlert} />
                    <StatPill label="Countries Detected" value="48" icon={Globe} />
                    <StatPill label="Critical Threats" value="12" icon={Activity} />
                    <StatPill label="Time Wasted by Tarpit" value="14h 22m" icon={Clock} />
                </div>

                {/* Features Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full text-left pb-16">
                    <FeatureCard 
                        title="Tarpit Engine" 
                        desc="Asymmetric response latency indefinitely trapping high-risk payloads in connection limbo."
                        accent="#E63946"
                        icon={Box}
                    />
                    <FeatureCard 
                        title="AI Analysis Brain" 
                        desc="Real-time reverse engineering of malicious inputs converting attacks into actionable intel."
                        accent="#4361EE"
                        icon={BrainCircuit}
                    />
                    <FeatureCard 
                        title="Global Operations" 
                        desc="3D spatial tracking and geographical monitoring mapping attacker origin nodes instantly."
                        accent="#2DC653"
                        icon={Globe}
                    />
                </div>

            </div>
        </div>
    );
}

function StatPill({ label, value, icon: Icon }) {
    return (
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4 flex items-center gap-4">
            <div className="bg-cyber-elevated p-3 rounded-md">
                <Icon className="w-5 h-5 text-cyber-accent-red" />
            </div>
            <div>
                <p className="font-heading font-bold text-[24px] text-cyber-accent-red tracking-tight leading-none">{value}</p>
                <p className="font-sans text-[12px] text-cyber-text-secondary mt-1">{label}</p>
            </div>
        </div>
    )
}

function FeatureCard({ title, desc, accent, icon: Icon }) {
    return (
        <div className="cyber-card flex flex-col relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: accent }} />
            
            <div className="flex justify-between items-start mb-6 z-10 pl-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-opacity-10 backdrop-blur-sm border border-opacity-30" style={{ backgroundColor: `${accent}1A`, borderColor: accent }}>
                    <Icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: accent }} />
            </div>
            <h3 className="font-heading font-bold text-[18px] text-white mb-2 pl-2 z-10">{title}</h3>
            <p className="font-sans text-[14px] text-cyber-text-secondary leading-relaxed pl-2 z-10">{desc}</p>
        </div>
    );
}
