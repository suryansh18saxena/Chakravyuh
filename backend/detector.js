// detector.js
const { decodePayload } = require('./decoder');

const attackRules = [
  { name: 'SQLi', regex: /(\%27)|(\')|(\-\-)|(\%23)|(#)|(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|EXEC|CAST|CONVERT|WAITFOR)/i, score: 50, type: 'Critical' },
  { name: 'XSS', regex: /(<script>)|(javascript:)|(onerror=)|(onload=)|(<img src=x)|(alert\()/i, score: 30, type: 'High' },
  { name: 'Command Injection', regex: /;|\||&|\$\(|\`|cat\s+\/etc|wget\s|curl\s/i, score: 60, type: 'Critical' },
  { name: 'Path Traversal', regex: /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/|etc\/passwd|boot\.ini/i, score: 40, type: 'High' },
  { name: 'SSRF', regex: /(http:\/\/127\.0\.0\.1)|(http:\/\/localhost)|(file:\/\/)/i, score: 45, type: 'High' },
];

function analyzeRequest(surface, reqMethod, reqPath, reqBodyStr, reqHeadersStr) {
  const combinedPayload = `${reqPath} ${reqBodyStr || ''}`;
  const decodedPayload = decodePayload(combinedPayload);
  
  let matches = [];
  let baseScore = 0;
  
  for (const rule of attackRules) {
    if (rule.regex.test(decodedPayload)) {
      matches.push(rule.name);
      baseScore += rule.score;
    }
  }

  // Calculate generic features for ML
  const entropy = calculateEntropy(decodedPayload);
  const specialCharRatio = (decodedPayload.match(/[^\w\s]/g) || []).length / (decodedPayload.length || 1);
  const len = decodedPayload.length;
  
  return {
    matchedRules: matches,
    baseScore: Math.min(100, baseScore),
    entropy,
    specialCharRatio,
    body_length: len,
    isAttack: matches.length > 0 || entropy > 4.5 || specialCharRatio > 0.15,
    severity: baseScore > 80 ? 'Critical' : (baseScore > 40 ? 'High' : (baseScore > 0 ? 'Medium' : 'Low'))
  };
}

function calculateEntropy(str) {
  if (!str) return 0;
  const len = str.length;
  const frequencies = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  return Object.values(frequencies).reduce((sum, count) => {
    const p = count / len;
    return sum - (p * Math.log2(p));
  }, 0);
}

module.exports = { analyzeRequest };
