import { SecretFinding } from '../types/documentation';

export interface SecretDetectionResult {
  maskedString: string;
  findings: SecretFinding[];
}

// Common patterns for sensitive values
const JWT_REGEX = /Bearer\s+(eyJ[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]{4,})/gi;
const GENERIC_TOKEN_REGEX = /(?:bearer|token)\s+([a-zA-Z0-9_-]{24,})/gi;
const API_KEY_REGEX = /(?:api[_-]?key|secret|access[_-]?token|app[_-]?key)[\s:=]+["']?([a-zA-Z0-9_\-\.]{16,})["']?/gi;
const PRIVATE_KEY_REGEX = /-----BEGIN[ A-Z_-]+PRIVATE KEY-----[a-zA-Z0-9+/=\s]+-----END[ A-Z_-]+PRIVATE KEY-----/g;

export function detectAndMaskSecrets(
  targetId: string,
  targetName: string,
  location: string,
  value: string,
  shouldMask: boolean = true
): { value: string; findings: SecretFinding[] } {
  if (!value || typeof value !== 'string') {
    return { value: value || '', findings: [] };
  }

  const findings: SecretFinding[] = [];
  let masked = value;

  // 1. Check Bearer JWT or Long Tokens
  let jwtMatch;
  while ((jwtMatch = JWT_REGEX.exec(value)) !== null) {
    const raw = jwtMatch[1];
    findings.push({
      id: `secret-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'bearer_token',
      location: `${location} (Authorization Header)`,
      targetId,
      targetName,
      rawValue: raw,
      maskedValue: 'YOUR_ACCESS_TOKEN',
      isMasked: shouldMask,
    });
    if (shouldMask) {
      masked = masked.replace(raw, 'YOUR_ACCESS_TOKEN');
    }
  }

  // 2. Check Private Keys
  const privateKeys = value.match(PRIVATE_KEY_REGEX);
  if (privateKeys) {
    privateKeys.forEach((key) => {
      findings.push({
        id: `secret-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'private_key',
        location: `${location} (Private Key)`,
        targetId,
        targetName,
        rawValue: key,
        maskedValue: 'YOUR_PRIVATE_KEY',
        isMasked: shouldMask,
      });
      if (shouldMask) {
        masked = masked.replace(key, 'YOUR_PRIVATE_KEY');
      }
    });
  }

  // 3. Header/Key checks based on name
  const locLower = location.toLowerCase();
  const isKeyField =
    locLower.includes('authorization') ||
    locLower.includes('api-key') ||
    locLower.includes('x-api-key') ||
    locLower.includes('apikey') ||
    locLower.includes('secret') ||
    locLower.includes('token') ||
    locLower.includes('password');

  if (findings.length === 0 && isKeyField && value.length > 5 && !value.includes('YOUR_') && !value.includes('{{')) {
    let maskedVal = 'YOUR_API_KEY';
    let type: SecretFinding['type'] = 'api_key';

    if (locLower.includes('authorization') || locLower.includes('token')) {
      maskedVal = 'YOUR_ACCESS_TOKEN';
      type = 'bearer_token';
    } else if (locLower.includes('password')) {
      maskedVal = 'YOUR_PASSWORD';
      type = 'password';
    } else if (locLower.includes('secret')) {
      maskedVal = 'YOUR_CLIENT_SECRET';
      type = 'client_secret';
    }

    findings.push({
      id: `secret-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      location,
      targetId,
      targetName,
      rawValue: value,
      maskedValue: maskedVal,
      isMasked: shouldMask,
    });

    if (shouldMask) {
      masked = maskedVal;
    }
  }

  return { value: masked, findings };
}
