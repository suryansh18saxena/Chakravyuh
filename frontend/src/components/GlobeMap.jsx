import { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'globe.gl';

export default function GlobeMap({ attacks }) {
  const globeEl = useRef(null);
  const containerRef = useRef();

  const [autoRotate, setAutoRotate] = useState(true);
  const [showArcs, setShowArcs] = useState(true);

  const INDIA_LAT = 20.5937;
  const INDIA_LNG = 78.9629;

  useEffect(() => {
    if (!containerRef.current) return;

    const globe = Globe()(containerRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .backgroundColor('rgba(0,0,0,0)')
      .pointOfView({ lat: INDIA_LAT, lng: INDIA_LNG, altitude: 2 })
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(1500)
      .arcsTransitionDuration(1000)
      .ringColor('color')
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod')
      .atmosphereColor('#E63946')
      .atmosphereAltitude(0.15);

    globeEl.current = globe;

    const handleResize = () => {
      globe.width(containerRef.current.clientWidth);
      globe.height(containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (globeEl.current) {
        // cleanup internal logic if necessary
      }
    };
  }, []);

  useEffect(() => {
    if (!globeEl.current || !attacks) return;

    const arcs = [];
    const rings = [];

    attacks.forEach(attack => {
       const attacker = attack.session?.attacker;
       if (attacker && attacker.latitude && attacker.longitude) {
           
           let color = 'rgba(67, 97, 238, 0.6)'; // Blue
           if (attack.severity === 'Critical') color = 'rgba(230, 57, 70, 0.9)'; // Red
           else if (attack.severity === 'High') color = 'rgba(244, 162, 97, 0.8)'; // Orange
           else if (attack.severity === 'Low') color = 'rgba(45, 198, 83, 0.5)'; // Green

           if (showArcs) {
               arcs.push({
                   startLat: attacker.latitude,
                   startLng: attacker.longitude,
                   endLat: INDIA_LAT,
                   endLng: INDIA_LNG,
                   color: [color, color]
               });
           }

           // Target ring
           rings.push({
               lat: INDIA_LAT,
               lng: INDIA_LNG,
               maxR: 5,
               propagationSpeed: 2,
               repeatPeriod: 1000,
               color: color
           });
           
           // Origin ring
           rings.push({
               lat: attacker.latitude,
               lng: attacker.longitude,
               maxR: 2,
               propagationSpeed: 1,
               repeatPeriod: 2000,
               color: color
           })
       }
    });

    globeEl.current.arcsData(arcs);
    globeEl.current.ringsData(rings);

    // Controls
    globeEl.current.controls().autoRotate = autoRotate;
    globeEl.current.controls().autoRotateSpeed = 0.5;

  }, [attacks, autoRotate, showArcs]);

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl flex flex-col h-full hover:border-cyber-accent-red hover:shadow-[0_0_20px_rgba(230,57,70,0.12)] transition-all overflow-hidden relative group">
        <div className="p-5 border-b border-cyber-border flex items-center justify-between z-10 bg-cyber-card/50 backdrop-blur">
             <div className="flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-cyber-accent-red animate-pulse"></span>
                 <h2 className="section-header text-white uppercase tracking-widest text-[12px]">LIVE THREAT MAP</h2>
             </div>
        </div>
        
        <div className="flex-1 relative cursor-move bg-black min-h-[480px]">
           <div ref={containerRef} className="absolute inset-0" />
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 z-10 pointer-events-none">
            <button onClick={() => setAutoRotate(!autoRotate)} className="btn btn-ghost pointer-events-auto bg-cyber-card/80 backdrop-blur-sm text-xs py-2 px-4 shadow-xl">
                {autoRotate ? 'Stop Rotation' : 'Auto-Rotate'}
            </button>
            <button onClick={() => setShowArcs(!showArcs)} className="btn btn-ghost pointer-events-auto bg-cyber-card/80 backdrop-blur-sm text-xs py-2 px-4 shadow-xl">
                {showArcs ? 'Hide Arcs' : 'Show Arcs'}
            </button>
            <button className="btn btn-ghost pointer-events-auto bg-cyber-card/80 backdrop-blur-sm text-xs py-2 px-4 shadow-xl">
                Heatmap (Pro)
            </button>
        </div>
    </div>
  );
}
