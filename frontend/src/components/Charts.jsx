import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

ChartJS.defaults.color = '#8888AA';
ChartJS.defaults.borderColor = '#1E1E3A';
ChartJS.defaults.font.family = '"Space Grotesk", sans-serif';

export default function Charts({ attacks }) {
   const types = {};
   const timeline = {};
   const countries = {};
   
   attacks.forEach(a => {
       let rules = [];
       try { rules = JSON.parse(a.matchedRules || '[]'); } catch(e) {}
       rules.forEach(r => types[r] = (types[r] || 0) + 1);
       if(rules.length === 0) types['Unknown'] = (types['Unknown'] || 0) + 1;
       
       const hour = new Date(a.timestamp || Date.now()).getHours();
       timeline[hour] = (timeline[hour] || 0) + 1;

       const country = a.session?.attacker?.country || 'Unknown';
       countries[country] = (countries[country] || 0) + 1;
   });

   // Doughnut Chart: Red/Orange shades
   const typeData = {
       labels: Object.keys(types),
       datasets: [{
           data: Object.values(types),
           backgroundColor: [
               'rgba(230, 57, 70, 1.0)',   // Red
               'rgba(244, 162, 97, 1.0)',  // Orange
               'rgba(230, 57, 70, 0.6)',
               'rgba(244, 162, 97, 0.6)',
               'rgba(230, 57, 70, 0.3)',
               'rgba(244, 162, 97, 0.3)'
           ],
           borderColor: '#0A0A0F',
           borderWidth: 2
       }]
   };

   // Line Chart: Red line, Red glow fill
   const hours = Array.from({length: 24}, (_, i) => i);
   const timelineData = {
       labels: hours.map(h => `${h}:00`),
       datasets: [{
           label: 'Attacks',
           data: hours.map(h => timeline[h] || 0),
           borderColor: '#E63946',
           backgroundColor: 'rgba(230, 57, 70, 0.15)',
           borderWidth: 2,
           fill: true,
           tension: 0.4, // smooth curves
           pointBackgroundColor: '#0A0A0F',
           pointBorderColor: '#E63946',
           pointRadius: 3,
           pointHoverRadius: 6
       }]
   };

   // Horizontal Bar Chart: Electric Blue
   const topCountries = Object.entries(countries).sort((a,b) => b[1]-a[1]).slice(0, 5);
   const countriesData = {
       labels: topCountries.map(c => c[0]),
       datasets: [{
           label: 'Volume',
           data: topCountries.map(c => c[1]),
           backgroundColor: 'rgba(67, 97, 238, 0.8)',
           borderColor: '#4361EE',
           borderWidth: 1,
           borderRadius: 4
       }]
   }

   const commonOptions = {
       maintainAspectRatio: false,
       plugins: { legend: { display: false } },
       scales: {
           x: { grid: { color: '#1E1E3A' } },
           y: { grid: { color: '#1E1E3A' } }
       }
   };

   return (
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-72">
           <div className="cyber-card flex flex-col hover:border-cyber-accent-red hover:shadow-[0_0_20px_rgba(230,57,70,0.12)]">
               <h3 className="section-header text-white uppercase mb-4 tracking-widest text-[12px]">Type Distribution</h3>
               <div className="flex-1 relative bg-black rounded-lg p-2">
                 <Doughnut data={typeData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#8888AA', boxWidth: 12 } } } }} />
               </div>
           </div>
           <div className="cyber-card flex flex-col hover:border-cyber-accent-red hover:shadow-[0_0_20px_rgba(230,57,70,0.12)]">
               <h3 className="section-header text-white uppercase mb-4 tracking-widest text-[12px]">Attacks Over Time (24h)</h3>
               <div className="flex-1 relative bg-black rounded-lg p-2">
                 <Line data={timelineData} options={commonOptions} />
               </div>
           </div>
           <div className="cyber-card flex flex-col hover:border-cyber-accent-red hover:shadow-[0_0_20px_rgba(230,57,70,0.12)]">
               <h3 className="section-header text-white uppercase mb-4 tracking-widest text-[12px]">Top Origins</h3>
               <div className="flex-1 relative bg-black rounded-lg p-2">
                 <Bar data={countriesData} options={{ ...commonOptions, indexAxis: 'y' }} />
               </div>
           </div>
       </div>
   );
}
