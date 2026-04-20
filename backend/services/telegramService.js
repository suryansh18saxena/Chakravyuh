const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

// Basic rate limiting setup
const alertCache = new Map();

/**
 * Mask sensitive data like passwords inside payload.
 */
function maskSensitiveData(payload) {
  if (!payload || typeof payload !== 'string') return payload;
  // Simple masking for passwords in JSON or form-data
  return payload.replace(/("password"\s*:\s*")[^"]+(")/gi, '$1***$2')
                .replace(/(password=)[^&]+/gi, '$1***');
}

/**
 * Helper to determine severity based on simple logic or return what's passed
 */
function getSeverityScore(severityOrScore) {
  if (typeof severityOrScore === 'number') {
    if (severityOrScore >= 80) return 'Critical';
    if (severityOrScore >= 60) return 'High';
    if (severityOrScore >= 40) return 'Medium';
    return 'Low';
  }
  return severityOrScore || 'Low';
}

/**
 * Sends a Telegram alert
 */
async function sendTelegramAlert({ type, severity, ip, endpoint, payload, userAgent, timestamp }) {
  try {
    const time = timestamp || new Date().toISOString();
    const safePayload = maskSensitiveData(payload);
    const resolvedSeverity = getSeverityScore(severity);

    // Rate limiting: avoid duplicate alerts (1 minute window)
    const cacheKey = `${ip}-${type}`;
    const now = Date.now();
    if (alertCache.has(cacheKey) && (now - alertCache.get(cacheKey) < 60000)) {
        return; // Skip duplicate
    }
    alertCache.set(cacheKey, now);

    const message = `🚨 CHAKRAVYUH ALERT 🚨\n─────────────────────\nAttack Type: ${type}\nSeverity: ${resolvedSeverity}\nEndpoint: ${endpoint}\nIP Address: ${ip}\nTime: ${time}\n\nPayload: ${safePayload}\n\nDevice: ${userAgent}\n\nStatus: Blocked / Logged`;

    await axios.post(TELEGRAM_API_URL, {
      chat_id: CHAT_ID,
      text: message
    });
    console.log(`[TelegramService] Alert sent for ${type} from ${ip}`);
  } catch (error) {
    console.error(`[TelegramService Error] Failed to send alert:`, error.message);
  }
}

module.exports = { sendTelegramAlert };
