// decoder.js
function decodePayload(payload) {
  if (!payload) return '';
  
  let decoded = payload;
  let changed = true;
  let iterations = 0;

  while (changed && iterations < 5) {
    changed = false;
    iterations++;

    // URL decode
    try {
      const urlDecoded = decodeURIComponent(decoded);
      if (urlDecoded !== decoded) {
        decoded = urlDecoded;
        changed = true;
      }
    } catch (e) {}

    // Hex decode
    const hexDecoded = decoded.replace(/%u([0-9a-fA-F]{4})/g, (m, c) => String.fromCharCode(parseInt(c, 16)));
    if (hexDecoded !== decoded) {
      decoded = hexDecoded;
      changed = true;
    }

    // Attempt Base64 decode if string looks like b64 
    if (/^[A-Za-z0-9+/=]{16,}$/.test(decoded)) {
      try {
        const b64Decoded = Buffer.from(decoded, 'base64').toString('utf-8');
        // Basic check if b64 result contains printable ascii instead of binary garbage
        if (/^[\x20-\x7E]*$/.test(b64Decoded)) {
          decoded = b64Decoded;
          changed = true;
        }
      } catch (e) {}
    }
    
    // HTML entity decode
    const htmlDecoded = decoded.replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d))
                               .replace(/&#x([0-9a-fA-F]+);/g, (m, h) => String.fromCharCode(parseInt(h, 16)));
    if (htmlDecoded !== decoded) {
      decoded = htmlDecoded;
      changed = true;
    }
  }

  return decoded;
}

module.exports = { decodePayload };
