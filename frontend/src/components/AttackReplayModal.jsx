import { useEffect, useState } from 'react';

const API_BASE = `http://${window.location.hostname}:3001`;
import { X, PlayCircle, PauseCircle, Activity, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function AttackReplayModal({ sessionId, onClose }) {
  const [session, setSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [typedContent, setTypedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/sessions/${sessionId}`)
      .then(r => r.json())
      .then(data => setSession(data));
  }, [sessionId]);

  useEffect(() => {
    let timer;
    if (isPlaying && session && !isTyping && currentStep < session.payloads.length) {
      timer = setTimeout(() => {
        setCurrentStep(s => s + 1);
      }, 1000);
    } else if (currentStep >= session?.payloads.length) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, session, isTyping]);

  useEffect(() => {
    if (!session || currentStep === -1) {
        setTypedContent('');
        return;
    }

    const payload = session.payloads[currentStep];
    if (!payload && currentStep > -1) {
        // Timeline completed
        setTypedContent(prev => prev + '\n\nSESSION TERMINATED.\n');
        return;
    }

    const time = format(new Date(payload.timestamp), 'HH:mm:ss.SSS');
    const newText = `\n> [${time}] TARGET ACQUIRED: ${payload.surface.toUpperCase()} PORTAL
> PROTOCOL: ${payload.method} ${payload.endpoint}
> IDENTIFIED VECTORS: ${JSON.parse(payload.matchedRules || '[]').join(', ')}
> SEVERITY: ${payload.severity.toUpperCase()}
> ${payload.aiInsight?.intention || 'Analyzing payload structure...'}
> ${payload.aiInsight?.explanation || ''}`;

    setIsTyping(true);
    let charIndex = 0;
    
    // Smooth fast typewriter
    const typeInterval = setInterval(() => {
       if (charIndex <= newText.length) {
           setTypedContent(prev => prev + newText.charAt(charIndex));
           charIndex++;
       } else {
           clearInterval(typeInterval);
           setIsTyping(false);
       }
    }, 15);

    return () => clearInterval(typeInterval);

  }, [currentStep, session]);

  if (!session) return null;

  const togglePlay = () => {
    if (currentStep >= session.payloads.length) {
      setCurrentStep(-1);
      setTypedContent('');
    }
    setIsPlaying(!isPlaying);
  };

  const timelineSteps = [
    { label: 'CONNECTION ESTABLISHED' }
  ];
  session.payloads.forEach(p => {
    timelineSteps.push({ label: `BREACH ATTEMPT: ${p.surface.toUpperCase()}` });
  });

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-mono text-sm">
      
      {/* Header Bar */}
      <div className="h-14 border-b border-chakravyuh-primary bg-chakravyuh-bg flex items-center justify-between px-6">
        <h2 className="label-wide text-chakravyuh-primary flex items-center gap-4">
          <Activity className="w-5 h-5 text-chakravyuh-primary" />
          ATTACK STORY REPLAY // ID: {session.id.substring(0,8)}
        </h2>
        <button onClick={onClose} className="text-chakravyuh-primary hover:text-green-300 hover:shadow-neon transition-all p-1 border border-transparent hover:border-chakravyuh-primary">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Timeline */}
        <div className="w-80 border-r border-chakravyuh-primary/50 bg-chakravyuh-card p-6 overflow-y-auto">
            <h3 className="label-wide text-chakravyuh-muted mb-8">Execution Sequence</h3>
            
            <div className="space-y-6">
                {timelineSteps.map((step, idx) => {
                    const isActive = idx === currentStep || (idx === 0 && currentStep === -1);
                    const isPast = idx < currentStep;
                    
                    let textColor = 'text-chakravyuh-inactive';
                    if (isActive) textColor = 'text-chakravyuh-primary font-bold';
                    if (isPast) textColor = 'text-chakravyuh-muted';

                    return (
                        <div key={idx} className={`flex items-center gap-3 transition-colors duration-300 ${textColor}`}>
                            <span className="w-4 flex justify-center">
                                {isActive ? (
                                    <span className="animate-pulse">❯</span>
                                ) : (
                                    <span className={isPast ? 'opacity-100' : 'opacity-0'}>•</span>
                                )}
                            </span>
                            <span className="text-xs tracking-widest leading-relaxed">
                                [{idx}] {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Main Terminal Area */}
        <div className="flex-1 bg-black p-6 flex flex-col relative">
            <div className="mb-4 flex items-center gap-4 border-b border-chakravyuh-inactive pb-4">
               <button 
                  onClick={togglePlay}
                  className="flex items-center gap-2 px-4 py-2 bg-chakravyuh-primary text-black font-bold uppercase tracking-widest text-xs hacker-btn"
               >
                  {isPlaying ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  {isPlaying ? 'PAUSE STREAM' : 'INITIALIZE'}
               </button>
               <div className="text-xs text-chakravyuh-muted uppercase tracking-widest flex items-center gap-2">
                   Target: <span className="text-chakravyuh-primary">{session.attacker.ip} [{session.attacker.country}]</span>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-chakravyuh-primary">
                {`> INITIATING PLAYBACK FOR SESSION ${session.id.substring(0,8)}...
> ATTACKER FINGERPRINT: ${session.attacker.fingerprint.substring(0,16)}
> BEHAVIORAL PROFILE: ${session.attacker.tags}
`}
                {typedContent}
                <span className="animate-ping inline-block w-2-h-4 bg-chakravyuh-primary ml-1">_</span>
            </div>
        </div>
      </div>

    </div>
  );
}
