const http = require('http');

console.log("==========================================");
console.log("       CHAKRAVYUH LIVE DEMO SEEDER        ");
console.log("==========================================\n");

const targets = [
  { path: '/login', method: 'POST', body: '{"username":"admin", "password":"\' OR 1=1 --"}' },
  { path: '/login', method: 'POST', body: '{"username":"root", "password":"password123"}' },
  { path: '/admin', method: 'GET' },
  { path: '/api/v1/users', method: 'GET' },
  { path: '/api/v1/users?id=1%20UNION%20SELECT%20*%20FROM%20config--', method: 'GET' },
  { path: '/files/backup.sql', method: 'GET' },
  { path: '/ssh/keys', method: 'GET' }
];

const mockIPs = [
  '194.26.29.11',  // Russiaish
  '45.133.1.22',   // Unknown/Proxy
  '185.15.22.4',   // Germany
  '91.222.12.9',   // Ukraine
  '103.44.11.2',   // China
  '8.8.8.8',       // Google DNS / spoofed
  '112.55.33.1'    // Random
];

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'curl/7.68.0',
  'python-requests/2.25.1',
  'Nmap Scripting Engine',
  'sqlmap/1.5'
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function sendRequest(path, method, body, ip, agent) {
  return new Promise((resolve, reject) => {
    const postData = body ? body : '';
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'X-Forwarded-For': ip, // spoof IP
        'User-Agent': agent
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve({ code: res.statusCode, data }));
    });

    req.on('error', (e) => resolve({ error: e.message }));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runDemo() {
  console.log("Starting Live Attack Simulation... Dashboard will light up.\n");

  const attackCount = 30; // Number of events for the demo

  for (let i = 0; i < attackCount; i++) {
    const target = targets[Math.floor(Math.random() * targets.length)];
    // Stick to the same IP for a few requests to build a session, then switch
    const ip = mockIPs[Math.floor((i / 4)) % mockIPs.length]; 
    const agent = userAgents[Math.floor(Math.random() * userAgents.length)];

    console.log(`[${i+1}/${attackCount}] Dispatched ${target.method} ${target.path} from ${ip}`);
    
    // Do not await the request fully if it is tarpitted, otherwise the script hangs!
    // But we don't want to overlap too heavily. We wait 1.5 seconds and fire the next.
    sendRequest(target.path, target.method, target.body, ip, agent).then(r => {
        if (r.error) console.log(`   -> Error: ${r.error}`);
        else console.log(`   -> Response: ${r.code}`);
    });

    // Random delay between 500ms and 2500ms
    const delay = Math.floor(Math.random() * 2000) + 500;
    await sleep(delay);
  }

  console.log("\nDemo Seeding Completed. All 30 packets dispatched.");
  console.log("Note: Some requests may still be held open by the Tarpit engine.");
  process.exit(0);
}

runDemo();
