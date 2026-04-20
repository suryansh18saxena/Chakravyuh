export default function SpiderWebIcon({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Radiating lines */}
      <line x1="50" y1="50" x2="50" y2="5" />
      <line x1="50" y1="50" x2="95" y2="50" />
      <line x1="50" y1="50" x2="50" y2="95" />
      <line x1="50" y1="50" x2="5" y2="50" />
      <line x1="50" y1="50" x2="81.8" y2="18.2" />
      <line x1="50" y1="50" x2="81.8" y2="81.8" />
      <line x1="50" y1="50" x2="18.2" y2="81.8" />
      <line x1="50" y1="50" x2="18.2" y2="18.2" />

      {/* Hexagonal webs inner */}
      <polygon points="50,20 71.2,28.8 80,50 71.2,71.2 50,80 28.8,71.2 20,50 28.8,28.8" />
      
      {/* Hexagonal webs outer */}
      <polygon points="50,12 76.9,23.1 88,50 76.9,76.9 50,88 23.1,76.9 12,50 23.1,23.1" />
    </svg>
  );
}
