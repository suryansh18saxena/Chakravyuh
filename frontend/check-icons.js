import * as lucide from 'lucide-react';
const req = [
'Bot', 'Search', 'ArrowRight', 'Box', 'BrainCircuit', 'Globe', 'Activity', 'ShieldAlert', 'Clock',
'UploadCloud', 'SearchCode', 'ShieldCheck', 'AlertTriangle', 'Database', 'MessageSquare',
'RotateCcw', 'MonitorPlay', 'Volume2', 'Moon', 'Info', 'Play', 'FastForward', 'PauseCircle',
'PlayCircle', 'SkipBack', 'SkipForward', 'X', 'Network', 'Copy', 'Maximize2', 'ChevronDown', 'ChevronUp'
];

req.forEach(name => {
    if (!lucide[name]) console.log(`MISSING ICON: ${name}`);
});
console.log('Done checking icons.');
