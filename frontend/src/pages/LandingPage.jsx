import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Box, BrainCircuit, Globe, Activity, ShieldAlert, Clock, Building2, Shield, Check } from 'lucide-react';
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

                {/* ============================== */}
                {/* SUBSCRIPTION / PRICING SECTION */}
                {/* ============================== */}
                <div className="w-full py-24 border-t border-cyber-border">
                    <div className="text-center mb-16">
                        <p className="font-mono text-[12px] text-cyber-accent-blue uppercase tracking-[0.3em] mb-3">Deployment Models</p>
                        <h2 className="font-heading font-bold text-[42px] text-white leading-tight">Choose Your Shield</h2>
                        <p className="font-sans text-cyber-text-secondary mt-3 max-w-xl mx-auto">From cloud-hosted SaaS to air-gapped classified environments. Chakravyuh adapts to your threat landscape.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                        {/* TIER 1 — Company / SaaS */}
                        <div className="relative bg-cyber-card border border-cyber-accent-success/40 rounded-2xl p-8 flex flex-col group hover:border-cyber-accent-success transition-colors overflow-hidden">
                            {/* Popular Badge */}
                            <div className="absolute top-5 right-5">
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-cyber-accent-success/20 text-cyber-accent-success border border-cyber-accent-success/40">Most Popular</span>
                            </div>
                            {/* Glow */}
                            <div className="absolute inset-0 bg-cyber-accent-success/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                            <div className="relative z-10 flex flex-col flex-1">
                                <div className="w-12 h-12 rounded-xl bg-cyber-accent-success/10 border border-cyber-accent-success/30 flex items-center justify-center mb-6">
                                    <Globe className="w-6 h-6 text-cyber-accent-success" />
                                </div>

                                <p className="font-mono text-[11px] text-cyber-accent-success uppercase tracking-[0.2em] mb-1">Model 1 — SaaS</p>
                                <h3 className="font-heading font-bold text-[28px] text-white mb-3">For Company</h3>
                                <p className="font-sans text-[14px] text-cyber-text-secondary leading-relaxed mb-8">
                                    The simplest way to get started. Visit our platform, connect your infrastructure — everything runs on our secure cloud with zero setup required.
                                </p>

                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="font-heading font-bold text-[48px] text-cyber-accent-success">Free</span>
                                    <span className="text-cyber-text-secondary text-sm">/ to start</span>
                                </div>

                                <div className="flex flex-col gap-3 mb-10 flex-1">
                                    <PricingFeature text="Instant access — no installation" />
                                    <PricingFeature text="Cloud-hosted honeypot surfaces" />
                                    <PricingFeature text="AI-powered threat analysis" />
                                    <PricingFeature text="Dashboard & reports included" />
                                    <PricingFeature text="Auto-updates & new detections" />
                                </div>

                                <button className="w-full btn btn-primary text-[15px] shadow-glow-red py-3">
                                    Start Scanning Free →
                                </button>
                            </div>
                        </div>

                        {/* TIER 2 — Enterprise / On-Premise */}
                        <div className="relative bg-cyber-card border border-cyber-border rounded-2xl p-8 flex flex-col group hover:border-cyber-accent-blue transition-colors overflow-hidden">
                            <div className="absolute inset-0 bg-cyber-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                            <div className="relative z-10 flex flex-col flex-1">
                                <div className="w-12 h-12 rounded-xl bg-cyber-accent-blue/10 border border-cyber-accent-blue/30 flex items-center justify-center mb-6">
                                    <Building2 className="w-6 h-6 text-cyber-accent-blue" />
                                </div>

                                <p className="font-mono text-[11px] text-cyber-accent-blue uppercase tracking-[0.2em] mb-1">Model 2 — On-Premise</p>
                                <h3 className="font-heading font-bold text-[28px] text-white mb-3">For Enterprises</h3>
                                <p className="font-sans text-[14px] text-cyber-text-secondary leading-relaxed mb-8">
                                    Download and deploy Chakravyuh entirely within your own infrastructure. Runs inside your firewall — your data never leaves your network.
                                </p>

                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="font-heading font-bold text-[48px] text-cyber-accent-blue">$9</span>
                                    <span className="text-cyber-text-secondary text-sm">/ month</span>
                                </div>
                                <div className="mb-8">
                                    <span className="text-cyber-text-secondary text-[11px]">per organization</span>
                                    <span className="ml-3 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-cyber-elevated border border-cyber-border text-cyber-text-secondary">Billed Monthly</span>
                                </div>

                                <div className="flex flex-col gap-3 mb-10 flex-1">
                                    <PricingFeature text="Deployed on your own servers" />
                                    <PricingFeature text="Runs inside your firewall" />
                                    <PricingFeature text="You never share data externally" />
                                    <PricingFeature text="Full audit log & SIEM integration" />
                                    <PricingFeature text="Enterprise SLA & priority support" />
                                </div>

                                <button className="w-full btn btn-secondary text-[15px] py-3">
                                    Get Enterprise Plan — $9/mo →
                                </button>
                            </div>
                        </div>

                        {/* TIER 3 — Government / Air-Gapped */}
                        <div className="relative bg-cyber-card border border-cyber-accent-warning/30 rounded-2xl p-8 flex flex-col group hover:border-cyber-accent-warning transition-colors overflow-hidden">
                            {/* Air-Gapped Badge */}
                            <div className="absolute top-5 right-5">
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-cyber-accent-warning/15 text-cyber-accent-warning border border-cyber-accent-warning/40">Air-Gapped</span>
                            </div>
                            <div className="absolute inset-0 bg-cyber-accent-warning/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                            <div className="relative z-10 flex flex-col flex-1">
                                <div className="w-12 h-12 rounded-xl bg-cyber-accent-warning/10 border border-cyber-accent-warning/30 flex items-center justify-center mb-6">
                                    <Shield className="w-6 h-6 text-cyber-accent-warning" />
                                </div>

                                <p className="font-mono text-[11px] text-cyber-accent-warning uppercase tracking-[0.2em] mb-1">Model 3 — Air-Gapped</p>
                                <h3 className="font-heading font-bold text-[28px] text-white mb-3">For Government / Defense</h3>
                                <p className="font-sans text-[14px] text-cyber-text-secondary leading-relaxed mb-8">
                                    Maximum isolation for classified environments. Runs on a completely isolated network with zero internet connectivity. No phone-home, no telemetry — ever.
                                </p>

                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="font-heading font-bold text-[48px] text-cyber-accent-warning">$99</span>
                                    <span className="text-cyber-text-secondary text-sm">/ month</span>
                                </div>
                                <div className="mb-8">
                                    <span className="text-cyber-text-secondary text-[11px]">per deployment</span>
                                    <span className="ml-3 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-cyber-accent-warning/10 border border-cyber-accent-warning/30 text-cyber-accent-warning">Air Gapped</span>
                                </div>

                                <div className="flex flex-col gap-3 mb-10 flex-1">
                                    <PricingFeature text="Zero internet connection required" color="warning" />
                                    <PricingFeature text="Completely isolated network deployment" color="warning" />
                                    <PricingFeature text="No telemetry or phone-home" color="warning" />
                                    <PricingFeature text="Offline license verification" color="warning" />
                                    <PricingFeature text="FISMA / NIST 800-53 aligned" color="warning" />
                                </div>

                                <button className="w-full py-3 rounded-lg text-[15px] font-semibold bg-cyber-accent-warning/10 border border-cyber-accent-warning/40 text-cyber-accent-warning hover:bg-cyber-accent-warning/20 transition-colors cursor-pointer flex items-center justify-center gap-2">
                                    Request Deployment — $99/mo →
                                </button>
                            </div>
                        </div>
                    </div>
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

function PricingFeature({ text, color = "success" }) {
    const colorMap = {
        success: "text-cyber-accent-success",
        warning: "text-cyber-accent-warning"
    };
    return (
        <div className="flex items-start gap-3">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${colorMap[color]}`} />
            <span className="font-sans text-[13px] text-cyber-text-secondary">{text}</span>
        </div>
    );
}
