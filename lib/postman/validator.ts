export interface ValidationResult {
  valid: boolean;
  version?: 'v2.0' | 'v2.1' | 'unknown';
  error?: string;
  collectionName?: string;
}

export function validatePostmanCollection(jsonStringOrObj: string | unknown): ValidationResult {
  let parsed: any;

  if (typeof jsonStringOrObj === 'string') {
    try {
      parsed = JSON.parse(jsonStringOrObj);
    } catch (e: any) {
      return {
        valid: false,
        error: 'Unable to parse this file. Please upload a valid JSON file.',
      };
    }
  } else {
    parsed = jsonStringOrObj;
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      valid: false,
      error: 'This file does not appear to be a supported Postman Collection.',
    };
  }

  // Check Postman Schema in info
  const info = parsed.info;
  if (!info || typeof info !== 'object') {
    return {
      valid: false,
      error: 'This file does not appear to be a supported Postman Collection. Missing collection info.',
    };
  }

  const schema: string = info.schema || '';
  let version: 'v2.0' | 'v2.1' | 'unknown' = 'unknown';

  if (schema.includes('v2.1.0') || schema.includes('v2.1')) {
    version = 'v2.1';
  } else if (schema.includes('v2.0.0') || schema.includes('v2.0')) {
    version = 'v2.0';
  } else if (parsed.item && Array.isArray(parsed.item)) {
    // Tolerant heuristic fallback if schema url is missing
    version = 'v2.1';
  } else {
    return {
      valid: false,
      error: 'This Postman collection version is not currently supported. Only v2.0 and v2.1 are supported.',
    };
  }

  if (!parsed.item || !Array.isArray(parsed.item) || parsed.item.length === 0) {
    return {
      valid: false,
      version,
      collectionName: info.name,
      error: 'The collection contains no API requests.',
    };
  }

  return {
    valid: true,
    version,
    collectionName: info.name || 'API Documentation',
  };
}

