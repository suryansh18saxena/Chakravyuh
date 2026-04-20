const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const generateFingerprint = () => crypto.randomBytes(32).toString('hex');

const sampleAttacks = [
  { country: 'Russia', city: 'Moscow', ip: '194.58.112.50', lat: 55.7558, lon: 37.6173, tags: 'Targeted, Experienced', surface: 'admin', method: 'POST', endpoint: '/admin/login', matchedRules: '["SQLi", "Brute Force"]', threat: 95, severity: 'Critical' },
  { country: 'China', city: 'Beijing', ip: '114.114.114.114', lat: 39.9042, lon: 116.4074, tags: 'Automated Tool, Persistent', surface: 'api', method: 'GET', endpoint: '/api/v1/users', matchedRules: '["Rate Limit", "Path Traversal"]', threat: 85, severity: 'High' },
  { country: 'USA', city: 'New York', ip: '198.51.100.12', lat: 40.7128, lon: -74.0060, tags: 'Explorer', surface: 'files', method: 'GET', endpoint: '/files/passwords.txt', matchedRules: '["Sensitive Endpoint"]', threat: 60, severity: 'Medium' },
  { country: 'Brazil', city: 'São Paulo', ip: '200.147.67.142', lat: -23.5505, lon: -46.6333, tags: 'Script Kiddie', surface: 'ssh', method: 'POST', endpoint: '/ssh/cmd', matchedRules: '["Command Injection"]', threat: 90, severity: 'High' },
  { country: 'Germany', city: 'Berlin', ip: '85.214.20.141', lat: 52.5200, lon: 13.4050, tags: 'Methodical', surface: 'login', method: 'POST', endpoint: '/login', matchedRules: '["XSS"]', threat: 40, severity: 'Low' },
  { country: 'Nigeria', city: 'Lagos', ip: '105.112.18.23', lat: 6.5244, lon: 3.3792, tags: 'Manual Attacker', surface: 'admin', method: 'GET', endpoint: '/admin/dashboard', matchedRules: '["Unauthorized Access"]', threat: 50, severity: 'Medium' },
  { country: 'Romania', city: 'Bucharest', ip: '82.76.253.111', lat: 44.4268, lon: 26.1025, tags: 'Targeted', surface: 'api', method: 'POST', endpoint: '/api/v1/execute', matchedRules: '["Command Injection"]', threat: 92, severity: 'Critical' },
  { country: 'India', city: 'Mumbai', ip: '122.169.112.45', lat: 19.0760, lon: 72.8777, tags: 'Explorer', surface: 'files', method: 'GET', endpoint: '/files/backup.sql', matchedRules: '["Path Traversal"]', threat: 70, severity: 'High' },
  { country: 'Finland', city: 'Helsinki', ip: '195.148.124.5', lat: 60.1695, lon: 24.9354, tags: 'Persistent', surface: 'ssh', method: 'POST', endpoint: '/ssh/cmd', matchedRules: '["Command Injection"]', threat: 85, severity: 'High' },
  { country: 'France', city: 'Paris', ip: '80.11.255.45', lat: 48.8566, lon: 2.3522, tags: 'Script Kiddie', surface: 'login', method: 'POST', endpoint: '/login', matchedRules: '["Brute Force"]', threat: 30, severity: 'Low' },
  { country: 'Kenya', city: 'Nairobi', ip: '197.248.88.22', lat: -1.2921, lon: 36.8219, tags: 'Automated Tool', surface: 'api', method: 'GET', endpoint: '/api/v1/status', matchedRules: '["Rate Limit"]', threat: 45, severity: 'Low' },
  { country: 'Colombia', city: 'Bogotá', ip: '181.129.55.122', lat: 4.7110, lon: -74.0721, tags: 'Experienced', surface: 'admin', method: 'POST', endpoint: '/admin/tables', matchedRules: '["SQLi"]', threat: 88, severity: 'High' },
  { country: 'Ukraine', city: 'Kyiv', ip: '91.222.12.33', lat: 50.4501, lon: 30.5234, tags: 'Multi-Vector', surface: 'api', method: 'POST', endpoint: '/api/v1/update', matchedRules: '["XSS", "SQLi"]', threat: 99, severity: 'Critical' },
  { country: 'Japan', city: 'Tokyo', ip: '124.146.222.10', lat: 35.6762, lon: 139.6503, tags: 'VPN Rotation', surface: 'login', method: 'POST', endpoint: '/login/reset', matchedRules: '["Brute Force"]', threat: 65, severity: 'Medium' },
  { country: 'South Africa', city: 'Cape Town', ip: '41.13.250.8', lat: -33.9249, lon: 18.4241, tags: 'Explorer', surface: 'files', method: 'GET', endpoint: '/files/etc/passwd', matchedRules: '["Path Traversal"]', threat: 82, severity: 'High' }
];

async function main() {
  console.log('Seeding database with initial attack data...');
  for (const attack of sampleAttacks) {
    const fingerprint = generateFingerprint();
    const profile = await prisma.attackerProfile.create({
      data: {
        fingerprint,
        ip: attack.ip,
        country: attack.country,
        city: attack.city,
        latitude: attack.lat,
        longitude: attack.lon,
        organization: 'Generic ISP',
        isProxy: false,
        tags: attack.tags,
      }
    });

    const session = await prisma.attackSession.create({
      data: {
        attackerId: profile.id,
        tarpitLevel: Math.floor(attack.threat / 20),
        totalWastedTimeSec: Math.floor(Math.random() * 300) + 10, // random 10-310 seconds
      }
    });

    const payload = await prisma.payload.create({
      data: {
        sessionId: session.id,
        surface: attack.surface,
        method: attack.method,
        endpoint: attack.endpoint,
        body: '{"username": "admin", "password": "\' OR 1=1--"}',
        headers: '{"user-agent": "curl/7.68.0"}',
        matchedRules: attack.matchedRules,
        threatScore: attack.threat,
        severity: attack.severity,
      }
    });

    if (attack.threat > 70) {
      // Setup AI Insight caching for major threats
      await prisma.aIInsight.create({
        data: {
          payloadId: payload.id,
          payloadHash: crypto.createHash('sha256').update(payload.id).digest('hex'),
          explanation: `This represents a highly sophisticated ${JSON.parse(attack.matchedRules).join(' and ')} attack originating from ${attack.country}.`,
          intention: 'The attacker is likely attempting to bypass authentication or execute arbitrary code.',
          danger: 'On an unprotected system, this could lead to full system compromise or a database breach.',
          recommendation: 'Implement strict input validation, parameterized queries, and robust rate-limiting at the network layer.',
        }
      });
    }
  }

  console.log('Seeding complete. 15 diverse attacker profiles inserted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
