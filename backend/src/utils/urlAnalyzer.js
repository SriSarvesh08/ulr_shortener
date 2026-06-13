/**
 * URL Safety Analyzer — Rule-based URL risk scoring
 * No external APIs. Pure pattern analysis.
 */

// Suspicious keywords commonly found in phishing/scam URLs
const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'payment', 'free', 'claim', 'password',
  'account', 'secure', 'update', 'confirm', 'suspend', 'wallet',
  'prize', 'winner', 'urgent', 'banking', 'signin', 'credential',
  'reset', 'unlock',
];

// Suspicious TLDs often used for spam/phishing
const SUSPICIOUS_TLDS = [
  '.xyz', '.tk', '.ml', '.ga', '.cf', '.top', '.buzz',
  '.gq', '.work', '.click', '.link', '.info', '.biz',
  '.icu', '.monster', '.quest',
];

/**
 * Analyze a URL and return a safety report
 * @param {string} urlString - The URL to analyze
 * @returns {{ score: number, status: string, risks: Array<{rule: string, deduction: number, detail: string}>, domain: string }}
 */
const analyzeUrl = (urlString) => {
  let score = 100;
  const risks = [];

  // Parse URL
  let parsedUrl;
  try {
    parsedUrl = new URL(urlString);
  } catch {
    return {
      score: 0,
      status: 'High Risk',
      risks: [{ rule: 'Invalid URL', deduction: 100, detail: 'The URL format is invalid' }],
      domain: 'unknown',
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const fullUrl = urlString.toLowerCase();
  const pathname = parsedUrl.pathname.toLowerCase();

  // --- Rule 1: Non-HTTP/HTTPS protocol ---
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    const deduction = 40;
    score -= deduction;
    risks.push({
      rule: 'Unsafe Protocol',
      deduction,
      detail: `Uses "${parsedUrl.protocol}" instead of http/https`,
    });
  }

  // --- Rule 2: HTTP without SSL ---
  if (parsedUrl.protocol === 'http:') {
    const deduction = 10;
    score -= deduction;
    risks.push({
      rule: 'No SSL',
      deduction,
      detail: 'URL uses HTTP instead of HTTPS (no encryption)',
    });
  }

  // --- Rule 3: URL length ---
  if (urlString.length > 500) {
    const deduction = 30;
    score -= deduction;
    risks.push({
      rule: 'Extremely Long URL',
      deduction,
      detail: `URL is ${urlString.length} characters (very suspicious)`,
    });
  } else if (urlString.length > 200) {
    const deduction = 15;
    score -= deduction;
    risks.push({
      rule: 'Long URL',
      deduction,
      detail: `URL is ${urlString.length} characters (unusually long)`,
    });
  }

  // --- Rule 4: Suspicious keywords ---
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter(
    (kw) => fullUrl.includes(kw) || pathname.includes(kw)
  );
  if (foundKeywords.length > 0) {
    const deduction = Math.min(foundKeywords.length * 10, 30);
    score -= deduction;
    risks.push({
      rule: 'Suspicious Keywords',
      deduction,
      detail: `Contains: ${foundKeywords.join(', ')}`,
    });
  }

  // --- Rule 5: Excessive special characters in path ---
  const specialChars = (pathname.match(/[@!$%^&*()=+{}\[\]|\\<>~`]/g) || []).length;
  if (specialChars > 5) {
    const deduction = 15;
    score -= deduction;
    risks.push({
      rule: 'Excessive Symbols',
      deduction,
      detail: `Path contains ${specialChars} special characters`,
    });
  }

  // --- Rule 6: IP address as domain ---
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipPattern.test(hostname)) {
    const deduction = 20;
    score -= deduction;
    risks.push({
      rule: 'IP Address Domain',
      deduction,
      detail: 'Uses an IP address instead of a domain name',
    });
  }

  // --- Rule 7: Long subdomain chains ---
  const dotCount = hostname.split('.').length - 1;
  if (dotCount > 3) {
    const deduction = 10;
    score -= deduction;
    risks.push({
      rule: 'Deep Subdomains',
      deduction,
      detail: `Domain has ${dotCount} levels (${hostname})`,
    });
  }

  // --- Rule 8: Suspicious TLD ---
  const hasSuspiciousTld = SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld));
  if (hasSuspiciousTld) {
    const deduction = 10;
    score -= deduction;
    risks.push({
      rule: 'Suspicious TLD',
      deduction,
      detail: `Uses a commonly abused domain extension`,
    });
  }

  // --- Rule 9: Double file extensions ---
  const doubleExtPattern = /\.\w{2,4}\.\w{2,4}$/;
  if (doubleExtPattern.test(pathname)) {
    const deduction = 25;
    score -= deduction;
    risks.push({
      rule: 'Double Extension',
      deduction,
      detail: 'Path has double file extension (common malware trick)',
    });
  }

  // --- Rule 10: Contains encoded characters excessively ---
  const encodedCount = (urlString.match(/%[0-9a-fA-F]{2}/g) || []).length;
  if (encodedCount > 5) {
    const deduction = 10;
    score -= deduction;
    risks.push({
      rule: 'Heavy Encoding',
      deduction,
      detail: `URL contains ${encodedCount} encoded characters (may hide real content)`,
    });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine status
  let status;
  if (score >= 70) {
    status = 'Safe';
  } else if (score >= 40) {
    status = 'Medium Risk';
  } else {
    status = 'High Risk';
  }

  return {
    score,
    status,
    risks,
    domain: extractDomain(urlString),
  };
};

/**
 * Extract clean domain from a URL
 * @param {string} urlString
 * @returns {string}
 */
const extractDomain = (urlString) => {
  try {
    const url = new URL(urlString);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
};

module.exports = { analyzeUrl, extractDomain };
