import { useState, useEffect } from 'react';
import { UploadCloud, SearchCode, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function PayloadAnalyzer() {
    const [payload, setPayload] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, analyzing, complete
    const [result, setResult] = useState(null);
    const [typedText, setTypedText] = useState('');

    const handleAnalyze = () => {
        if (!payload.trim()) return;
        setStatus('analyzing');
        setTypedText('');
        setResult(null);
        
        // Mocking an API call
        setTimeout(() => {
             const isClean = !payload.toLowerCase().includes('select') && !payload.toLowerCase().includes('<script>');
             
             const mockResult = isClean ? {
                 clean: true
             } : {
                 clean: false,
                 type: 'SQL INJECTION / XSS',
                 layer: 'RULE ENGINE',
                 score: 92,
                 explanation: `The analyzed payload contains severe malicious patterns attempting to manipulate backend SQL query compilation.\n\nThe attacker is using tautology (OR 1=1) mechanisms combined with comment sequence closures to bypass authentication schemas.\n\nSecondary heuristics indicate an attempt to extract the configuration table.\n\nThis behavior matches known APT footprint signatures accessing unpatched entry nodes.`,
                 recommendation: `// Immediate action required: parameterize queries\nconst query = 'SELECT * FROM users WHERE username = ? AND password = ?';\ndb.execute(query, [req.body.username, req.body.password]);`
             };
             
             setResult(mockResult);
             setStatus('complete');
        }, 1500);
    };

    // Typewriter effect for the AI explanation
    useEffect(() => {
        if (status === 'complete' && result && !result.clean) {
            let i = 0;
            const textToType = result.explanation;
            const interval = setInterval(() => {
                setTypedText(textToType.substring(0, i));
                i++;
                if (i > textToType.length) clearInterval(interval);
            }, 10);
            return () => clearInterval(interval);
        }
    }, [status, result]);

    const highlightSyntax = (text) => {
        if (!text) return null;
        let p = text;
        
        // Simple mock syntax highlighting rules
        const segments = p.split(/(\b(?:SELECT|UNION|OR|AND|FROM|WHERE|INSERT|UPDATE|DELETE)\b|'[^']*'|--.*$|\/\*[\s\S]*?\*\/)/gi);

        return segments.map((seg, i) => {
            if (/^(SELECT|UNION|OR|AND|FROM|WHERE|INSERT|UPDATE|DELETE)$/i.test(seg)) {
                return <span key={i} className="text-cyber-accent-red font-bold">{seg}</span>;
            } else if (/^'[^']*'$/.test(seg)) {
                return <span key={i} className="text-cyber-accent-warning">{seg}</span>;
            } else if (/^--.*$/.test(seg) || /^\/\*[\s\S]*?\*\/$/.test(seg)) {
                return <span key={i} className="text-[#444466] italic">{seg}</span>;
            } else {
                return <span key={i}>{seg}</span>;
            }
        });
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto px-6 py-8 flex flex-col gap-6 animate-entry">
            <div className="flex items-center justify-between">
                <div>
                   <h1 className="page-title"><span className="text-white">Payload</span> <span className="text-cyber-accent-red">Analyzer</span></h1>
                   <p className="text-cyber-text-secondary mt-1 font-sans">Deep inspection, fuzzing, and machine learning heuristics.</p>
                </div>
                <div className="flex items-center gap-2 border border-cyber-accent-success/30 bg-cyber-accent-success/10 px-3 py-1 rounded-full">
                   <div className="w-2 h-2 rounded-full bg-cyber-accent-success animate-pulse"></div>
                   <span className="text-cyber-accent-success font-bold text-[10px] uppercase tracking-widest">Engine Online</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mt-6">
                
                {/* LEFT COLUMN - 55% */}
                <div className="w-full lg:w-[55%] flex flex-col gap-6">
                    {/* Dropzone */}
                    <label 
                        className={`border border-dashed rounded-xl h-32 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragging ? 'border-cyber-accent-red bg-[#1A0A0D]' : 'border-cyber-border bg-cyber-card relative hover:bg-cyber-elevated/50'}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { 
                           e.preventDefault(); 
                           setIsDragging(false); 
                           const file = e.dataTransfer.files[0];
                           if(file) {
                               const reader = new FileReader();
                               reader.onload = (ev) => setPayload(ev.target.result);
                               reader.readAsText(file);
                           }
                        }}
                    >
                        <UploadCloud className="w-8 h-8 text-cyber-accent-red/60 mb-2" />
                        <p className="text-cyber-text-secondary font-sans text-sm">Drag and drop your file here or <span className="text-cyber-accent-red underline hover:text-red-400">click to browse</span></p>
                        <p className="mono-data text-[10px] text-[#444466] mt-2">.log .txt .json .pcap .csv .har .req</p>
                        <input type="file" className="hidden" onChange={e => {
                           const file = e.target.files[0];
                           if(file) {
                               const reader = new FileReader();
                               reader.onload = (ev) => setPayload(ev.target.result);
                               reader.readAsText(file);
                           }
                        }} />
                    </label>

                    {/* Editor */}
                    <div className="flex-1 min-h-[300px] bg-cyber-card border border-cyber-border rounded-xl flex overflow-hidden relative group">
                        {/* Line numbers fake */}
                        <div className="w-12 bg-cyber-elevated border-r border-cyber-border flex flex-col items-end px-2 py-4 font-mono text-[11px] text-[#444466] select-none">
                            {Array.from({length: 15}).map((_, i) => <span key={i}>{i+1}</span>)}
                        </div>
                        <div className="flex-1 relative">
                            <textarea 
                                className="absolute inset-0 w-full h-full p-4 bg-transparent text-cyber-text-secondary focus:text-white caret-cyber-accent-blue font-mono text-[13px] leading-relaxed resize-none outline-none border-none break-all"
                                value={payload}
                                placeholder="// Paste your malicious payload or SQL query here to begin deep analysis..."
                                onChange={e => setPayload(e.target.value)}
                                spellCheck="false"
                            />
                        </div>
                    </div>

                    <button onClick={handleAnalyze} disabled={status === 'analyzing'} className="btn btn-primary w-full py-4 text-lg shadow-glow-red justify-center">
                        <SearchCode className="w-5 h-5" /> 
                        {status === 'analyzing' ? 'ANALYZING THREAT MODEL...' : 'RUN ANALYSIS'}
                    </button>
                </div>

                {/* RIGHT COLUMN - 45% */}
                <div className="w-full lg:w-[45%] bg-cyber-card border border-cyber-border rounded-xl p-8 relative overflow-hidden flex flex-col">
                    {status === 'idle' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                            <ShieldCheck className="w-16 h-16 text-[#1E1E3A] mb-4" />
                            <p className="mono-data tracking-widest text-[#8888AA]">AWAITING PAYLOAD</p>
                            <p className="mono-data text-[10px] text-[#444466] mt-2">System primed for heuristic extraction.</p>
                        </div>
                    )}
                    
                    {status === 'analyzing' && (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 border-4 border-cyber-border border-t-cyber-accent-red rounded-full animate-spin mb-6"></div>
                            <p className="mono-data text-cyber-accent-red animate-pulse tracking-widest">DECODING OBFUSCATION...</p>
                        </div>
                    )}

                    {status === 'complete' && result && (
                        <div className="animate-entry flex flex-col h-full">
                            {result.clean ? (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 rounded-full bg-cyber-accent-success/20 flex items-center justify-center mb-6 border border-cyber-accent-success">
                                        <ShieldCheck className="w-12 h-12 text-cyber-accent-success" />
                                    </div>
                                    <h2 className="font-heading font-bold text-3xl text-cyber-accent-success">NO THREATS DETECTED</h2>
                                    <p className="font-sans text-cyber-text-secondary mt-2">Initial payload analysis returned clean signatures.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    <h2 className="font-heading font-bold text-white text-[18px] uppercase tracking-[0.2em] text-cyber-accent-red flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" /> ANALYSIS COMPLETE
                                    </h2>
                                    
                                    <div className="p-4 bg-[#0A0A0F] border border-cyber-border rounded-lg">
                                        <p className="text-[11px] uppercase text-cyber-text-secondary tracking-widest font-bold mb-2">Detection Result</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                 <span className="font-bold text-white">{result.type}</span>
                                                 <span className="px-2 py-0.5 text-[10px] font-bold text-cyber-accent-blue border border-cyber-accent-blue bg-cyber-elevated rounded tracking-widest uppercase">{result.layer}</span>
                                            </div>
                                            <span className="px-2 py-0.5 text-[10px] font-bold text-cyber-critical-text border border-cyber-critical-border bg-cyber-critical-bg rounded tracking-widest uppercase">CRITICAL</span>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-[11px] uppercase text-cyber-text-secondary tracking-widest">Threat Score</span>
                                                <span className="font-heading font-bold text-[24px] text-cyber-accent-red leading-none">{result.score}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-cyber-elevated rounded-full overflow-hidden">
                                                <div className="h-full bg-cyber-accent-red rounded-full" style={{ width: `${result.score}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[11px] uppercase text-cyber-text-secondary tracking-widest font-bold mb-2">AI Explanation</p>
                                        <div className="font-sans text-[14px] text-cyber-text-secondary leading-relaxed whitespace-pre-wrap">
                                            {typedText}
                                            {typedText.length < result.explanation.length && <span className="inline-block w-2 h-4 bg-cyber-accent-red animate-pulse ml-1 align-middle"></span>}
                                        </div>
                                    </div>

                                    {typedText.length === result.explanation.length && (
                                        <div className="mt-2 animate-entry">
                                            <p className="text-[11px] uppercase text-cyber-text-secondary tracking-widest font-bold mb-2">Defensive Recommendation</p>
                                            <div className="border-l-2 border-cyber-accent-red bg-[#0A0A0F] p-4 rounded-r-lg font-mono text-[12px] whitespace-pre-wrap text-[#8888AA]">
                                                {result.recommendation}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
