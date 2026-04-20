// index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { analyzeRequest } = require('./detector');
const { generateAIInsight, generateAIChatResponse } = require('./ai');
const { geolocateIp } = require('./geolocate');

const prisma = new PrismaClient();

// ==========================================
// Dashboard Server (Port 3001)
// ==========================================
const dashboardApp = express();
dashboardApp.use(cors());
dashboardApp.use(express.json());

const dashboardHttpServer = http.createServer(dashboardApp);
const io = new Server(dashboardHttpServer, {
  cors: { origin: '*' }
});

// APIs for dashboard
dashboardApp.get('/api/stats', async (req, res) => {
  const attacksTotal = await prisma.payload.count();
  const activeSessions = await prisma.attackSession.count({ where: { endTime: null } });
  const criticalThreats = await prisma.payload.count({ where: { severity: 'Critical' } });
  
  const distinctCountries = await prisma.$queryRaw`SELECT COUNT(DISTINCT country) as count FROM AttackerProfile`;
  const countriesCount = Number(distinctCountries[0].count);

  const stats = await prisma.attackSession.aggregate({
    _sum: { totalWastedTimeSec: true }
  });
  
  res.json({
    totalAttacks: attacksTotal,
    activeSessions,
    criticalThreats,
    countriesDetected: countriesCount,
    totalTarpitTime: stats._sum.totalWastedTimeSec || 0
  });
});

dashboardApp.get('/api/attacks', async (req, res) => {
  const attacks = await prisma.payload.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50,
    include: {
      session: {
        include: { attacker: true }
      },
      aiInsight: true
    }
  });
  res.json(attacks);
});

dashboardApp.get('/api/sessions', async (req, res) => {
  const sessions = await prisma.attackSession.findMany({
    orderBy: { startTime: 'desc' },
    take: 20,
    include: {
      attacker: true,
      payloads: {
        orderBy: { timestamp: 'asc' },
        include: { aiInsight: true }
      }
    }
  });
  res.json(sessions);
});

dashboardApp.get('/api/sessions/:id', async (req, res) => {
  const session = await prisma.attackSession.findUnique({
    where: { id: req.params.id },
    include: {
      attacker: true,
      payloads: {
        orderBy: { timestamp: 'asc' },
        include: { aiInsight: true }
      }
    }
  });
  res.json(session);
});

dashboardApp.get('/api/attacks/login', async (req, res) => {
  const attacks = await prisma.payload.findMany({
    where: { surface: 'login' },
    orderBy: { timestamp: 'desc' },
    take: 50,
    include: {
      session: {
        include: { attacker: true }
      },
      aiInsight: true
    }
  });
  res.json(attacks);
});

dashboardApp.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }
    const reply = await generateAIChatResponse(messages);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

io.on('connection', (socket) => {
  console.log('Dashboard client connected');
});

dashboardHttpServer.listen(3001, '0.0.0.0', () => {
  console.log('Dashboard API & Socket Server running on port 3001 (0.0.0.0)');
});


// ==========================================
// Honeypot Server (Port 8080)
// ==========================================
const honeypotApp = express();
honeypotApp.use(express.json());
honeypotApp.use(express.urlencoded({ extended: true }));

// Tarpit engine helper
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Track active connections for continuous streaming
const activeTarpits = new Map();

// Helper to interact with Python ML Service
async function getMLScore(features) {
  try {
    const res = await fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features)
    });
    if (res.ok) {
      return await res.json(); // { is_anomaly, anomaly_score }
    }
  } catch (err) {
    console.error('Python ML Service unreachable', err.message);
  }
  return { is_anomaly: false, anomaly_score: 0 };
}

// Honeypot Middleware
honeypotApp.use(async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const method = req.method;
  const path = req.path;
  const bodyStr = JSON.stringify(req.body || {});
  const headersStr = JSON.stringify(req.headers || {});
  
  // Fingerprinting (simplified)
  const userAgent = req.headers['user-agent'] || 'unknown';
  const fingerprintSource = ip + userAgent;
  const fingerprintHash = crypto.createHash('sha256').update(fingerprintSource).digest('hex');

  // Surface detection based on path
  let surface = 'unknown';
  if (path.includes('login')) surface = 'login';
  else if (path.includes('admin')) surface = 'admin';
  else if (path.includes('api')) surface = 'api';
  else if (path.includes('files')) surface = 'files';
  else if (path.includes('ssh')) surface = 'ssh';

  // Detection Engine
  const analysis = analyzeRequest(surface, method, path, bodyStr, headersStr);
  
  // ML Inference
  const mlResult = await getMLScore({
    entropy: analysis.entropy,
    special_char_ratio: analysis.specialCharRatio,
    keyword_freq: analysis.matchedRules.length,
    encoding_depth: 1, // simplified
    body_length: analysis.body_length
  });

  if (mlResult.is_anomaly) {
    analysis.baseScore = Math.min(100, analysis.baseScore + mlResult.anomaly_score);
    if (!analysis.matchedRules.includes('Anomaly Detected')) {
      analysis.matchedRules.push('Anomaly Detected');
    }
    if (analysis.baseScore > 80) analysis.severity = 'Critical';
    else if (analysis.baseScore > 60) analysis.severity = 'High';
  }

  // Create/Update Attacker Profile
  let profile = await prisma.attackerProfile.findUnique({ where: { fingerprint: fingerprintHash } });
  if (!profile) {
    const geo = await geolocateIp(ip);
    
    // Assign behavioral tags
    let tags = [];
    if (analysis.matchedRules.length === 0) tags.push('Explorer');
    else if (analysis.matchedRules.includes('SQLi') || analysis.matchedRules.includes('Command Injection')) tags.push('Dangerous');
    else tags.push('Script Kiddie');
    
    if (geo.proxy) tags.push('VPN Rotation');

    profile = await prisma.attackerProfile.create({
      data: {
        fingerprint: fingerprintHash,
        ip,
        country: geo.country,
        city: geo.city,
        latitude: geo.lat,
        longitude: geo.lon,
        organization: geo.isp,
        isProxy: geo.proxy,
        tags: tags.join(', ')
      }
    });
  }

  // Manage Sessions
  let session = await prisma.attackSession.findFirst({
    where: { attackerId: profile.id, endTime: null }
  });

  if (!session) {
    session = await prisma.attackSession.create({
      data: { attackerId: profile.id, tarpitLevel: 0 }
    });
  }

  // Adjust tarpit level based on threat severity
  let tarpitLevel = session.tarpitLevel;
  if (analysis.severity === 'Critical') tarpitLevel += 2;
  else if (analysis.severity === 'High') tarpitLevel += 1;
  const delaySec = Math.min(30, 2 * Math.pow(2, tarpitLevel)); // 2, 4, 8, 16, 30 max
  
  await prisma.attackSession.update({
    where: { id: session.id },
    data: { tarpitLevel, totalWastedTimeSec: session.totalWastedTimeSec + delaySec }
  });

  // Record Payload
  const payloadRecord = await prisma.payload.create({
    data: {
      sessionId: session.id,
      surface,
      method,
      endpoint: path,
      body: bodyStr,
      headers: headersStr,
      matchedRules: JSON.stringify(analysis.matchedRules),
      threatScore: analysis.baseScore,
      severity: analysis.severity
    }
  });

  // Generate AI Insight if high threat
  let aiInsightId = null;
  if (analysis.baseScore > 60) {
    const payloadHash = crypto.createHash('sha256').update(analysis.matchedRules.join(',') + path).digest('hex');
    let aiInsight = await prisma.aIInsight.findUnique({ where: { payloadHash } });
    if (!aiInsight) {
      const gInsight = await generateAIInsight({
        endpoint: path,
        method,
        body: bodyStr,
        matchedRules: analysis.matchedRules,
        severity: analysis.severity
      });
      if (gInsight) {
         aiInsight = await prisma.aIInsight.create({
           data: {
             payloadId: payloadRecord.id,
             payloadHash,
             explanation: gInsight.explanation,
             intention: gInsight.intention,
             danger: gInsight.danger,
             recommendation: gInsight.recommendation
           }
         });
      }
    } else {
         // Create duplicate record for this new payload but with same explanation
         aiInsight = await prisma.aIInsight.create({
           data: {
             payloadId: payloadRecord.id,
             payloadHash: crypto.createHash('sha256').update(payloadRecord.id).digest('hex'), // unique hash for DB constraint
             explanation: aiInsight.explanation,
             intention: aiInsight.intention,
             danger: aiInsight.danger,
             recommendation: aiInsight.recommendation
           }
         });
    }
    aiInsightId = aiInsight ? aiInsight.id : null;
  }
  
  // Telegram mock
  if (analysis.severity === 'Critical') {
     console.log(`[TELEGRAM MOCK] 🔴 CRITICAL THREAT DETECTED from ${profile.country}. IP: ${ip}. Rules: ${analysis.matchedRules.join(',')}`);
  }

  // Fetch full details to emit via socket
  const fullPayload = await prisma.payload.findUnique({
    where: { id: payloadRecord.id },
    include: {
      session: { include: { attacker: true } },
      aiInsight: true
    }
  });

  io.emit('new_attack', fullPayload);
  io.emit('stats_update'); // trigger dashboard refresh

  // Execute Tarpit HTTP Chunked Response
  if (analysis.baseScore > 40) {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    io.emit('session_update', { sessionId: session.id, status: 'tarpitting', currentDelay: delaySec });
    
    // Send fake processing messages slowly
    res.write('Processing request...\n');
    for (let i = 0; i < delaySec; i++) {
      await sleep(1000);
      res.write(`...${i}...\n`);
    }
    
    res.end('Error 503: Service Unavailable after processing. Retry later.');
    return;
  }

  // Proceed to normal honeypot response if not tarpitted
  next();
});

// Fallback Routes for Honeypot Surfaces
honeypotApp.use('/login', (req, res) => res.status(200).send('<html><body>Fake Corporate Portal Login</body></html>'));
honeypotApp.use('/admin', (req, res) => res.status(403).send('Forbidden: Admin Access Required'));
honeypotApp.use('/files', (req, res) => res.status(200).send('Directory listing: passwords.txt, backup.sql'));
honeypotApp.use('/api/v1', (req, res) => res.status(200).json({ status: "ok", data: "Fake sensitive data" }));
honeypotApp.use((req, res) => res.status(404).send('Not Found'));

const HTTP_PORT = 8080;
honeypotApp.listen(HTTP_PORT, '0.0.0.0', () => {
   console.log(`Honeypot Server running on port ${HTTP_PORT} (0.0.0.0)`);
});
