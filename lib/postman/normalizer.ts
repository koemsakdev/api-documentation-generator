import {
  DocumentationProject,
  DocumentationSection,
  DocumentationMetadata,
  DocumentationTheme,
  DocumentationVariable,
  Endpoint,
  HttpMethod,
  Parameter,
  RequestBody,
  ResponseExample,
  Authentication,
  SecretFinding,
} from '../types/documentation';
import { detectAndMaskSecrets } from './secrets';
import { generateCurlSnippet, generateHttpSnippet } from './curl';
import { calculateQualityReport } from './quality';

const defaultTheme: DocumentationTheme = {
  primaryColor: '#2563eb', // Blue 600
  secondaryColor: '#4f46e5', // Indigo 600
  accentColor: '#0ea5e9', // Sky 500
  backgroundColor: '#ffffff',
  textColor: '#0f172a', // Slate 900
  codeBackgroundColor: '#0f172a',
  borderColor: '#e2e8f0', // Slate 200
  fontFamily: 'Inter',
  codeFontFamily: 'Roboto Mono',
  borderRadius: 'rounded-lg',
  coverStyle: 'corporate',
};

export function normalizePostmanCollection(
  postmanJson: any,
  options: { maskSecrets?: boolean } = { maskSecrets: true }
): DocumentationProject {
  const shouldMask = options.maskSecrets !== false;
  const allSecrets: SecretFinding[] = [];

  const info = postmanJson.info || {};
  const collectionName = info.name || 'API Documentation';
  const collectionDesc = typeof info.description === 'string' ? info.description : info.description?.content || '';

  // Extract variables
  const variables: DocumentationVariable[] = [];
  if (Array.isArray(postmanJson.variable)) {
    for (const v of postmanJson.variable) {
      if (v.key) {
        variables.push({
          key: v.key,
          value: String(v.value ?? ''),
          type: v.type || 'string',
          description: v.description?.content || v.description || '',
        });
      }
    }
  }

  // Base auth at collection level
  const collectionAuth = parseAuth(postmanJson.auth, 'Collection', 'Collection Auth', shouldMask, allSecrets);

  // Traverse items
  const sections: DocumentationSection[] = [];

  // 1. Cover Section
  sections.push({
    id: 'section-cover',
    type: 'cover',
    title: 'Cover Page',
    description: 'Document cover and branding information',
  });

  // 2. Table of Contents Section
  sections.push({
    id: 'section-toc',
    type: 'toc',
    title: 'Table of Contents',
    description: 'Overview of all documentation sections',
  });

  // 3. Overview Section
  sections.push({
    id: 'section-overview',
    type: 'overview',
    title: 'Overview & Getting Started',
    description: collectionDesc || 'Welcome to the API reference documentation.',
  });

  // Parse items (folders and requests)
  if (Array.isArray(postmanJson.item)) {
    for (const item of postmanJson.item) {
      const section = processItem(item, collectionAuth, shouldMask, allSecrets);
      if (section) {
        sections.push(section);
      }
    }
  }

  // Build metadata
  const metadata: DocumentationMetadata = {
    title: collectionName,
    subtitle: 'REST API Reference Documentation',
    version: info.version || '1.0.0',
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    companyName: 'API Provider',
    description: collectionDesc,
  };

  // Build project
  const project: DocumentationProject = {
    id: `project-${Date.now()}`,
    metadata,
    theme: defaultTheme,
    sections,
    variables,
    qualityReport: {
      score: 0,
      totalEndpoints: 0,
      endpointsWithDescriptions: 0,
      endpointsWithMethods: 0,
      endpointsWithRequestExamples: 0,
      endpointsWithResponseExamples: 0,
      missingDescriptionsCount: 0,
      missingParametersCount: 0,
      missingResponsesCount: 0,
      findings: [],
    },
    secrets: allSecrets,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Calculate quality report
  project.qualityReport = calculateQualityReport(project);

  return project;
}

function processItem(
  item: any,
  inheritedAuth: Authentication | undefined,
  shouldMask: boolean,
  secrets: SecretFinding[]
): DocumentationSection | null {
  if (!item || typeof item !== 'object') return null;

  const id = item.id || `item-${Math.random().toString(36).substring(2, 9)}`;
  const name = item.name || 'Untitled Section';
  const desc = typeof item.description === 'string' ? item.description : item.description?.content || '';

  // Check if it's a folder (has items)
  if (Array.isArray(item.item)) {
    const folderAuth = item.auth
      ? parseAuth(item.auth, id, `${name} Auth`, shouldMask, secrets)
      : inheritedAuth;

    const children: DocumentationSection[] = [];
    for (const sub of item.item) {
      const childSection = processItem(sub, folderAuth, shouldMask, secrets);
      if (childSection) children.push(childSection);
    }

    return {
      id,
      type: 'group',
      title: name,
      description: desc,
      children,
    };
  }

  // It's a request endpoint
  if (item.request) {
    const endpoint = parseEndpoint(item, inheritedAuth, shouldMask, secrets);
    return {
      id,
      type: 'endpoint',
      title: name,
      description: desc,
      endpoint,
    };
  }

  return null;
}

function parseEndpoint(
  item: any,
  inheritedAuth: Authentication | undefined,
  shouldMask: boolean,
  secrets: SecretFinding[]
): Endpoint {
  const req = item.request;
  const endpointId = item.id || `ep-${Math.random().toString(36).substring(2, 9)}`;
  const endpointName = item.name || 'Endpoint';
  const description = typeof req.description === 'string' ? req.description : req.description?.content || item.description?.content || item.description || '';
  const method = (req.method || 'GET').toUpperCase() as HttpMethod;

  // URL parsing
  let path = '';
  let fullUrl = '';
  const queryParams: Parameter[] = [];
  const pathParams: Parameter[] = [];

  if (typeof req.url === 'string') {
    fullUrl = req.url;
    path = extractPath(req.url);
  } else if (req.url && typeof req.url === 'object') {
    fullUrl = req.url.raw || '';
    if (Array.isArray(req.url.path)) {
      path = '/' + req.url.path.join('/');
    } else {
      path = extractPath(fullUrl);
    }

    // Query parameters
    if (Array.isArray(req.url.query)) {
      for (const q of req.url.query) {
        if (!q.disabled) {
          const secretCheck = detectAndMaskSecrets(
            endpointId,
            endpointName,
            `Query: ${q.key}`,
            String(q.value ?? ''),
            shouldMask
          );
          secrets.push(...secretCheck.findings);

          queryParams.push({
            name: q.key || '',
            type: 'string',
            required: false,
            description: q.description?.content || q.description || '',
            example: secretCheck.value,
            default: secretCheck.value,
          });
        }
      }
    }

    // Path variables
    if (Array.isArray(req.url.variable)) {
      for (const pv of req.url.variable) {
        pathParams.push({
          name: pv.key || '',
          type: 'string',
          required: true,
          description: pv.description?.content || pv.description || '',
          example: pv.value,
          default: pv.value,
        });
      }
    }
  }

  // Headers
  const headers: Parameter[] = [];
  if (Array.isArray(req.header)) {
    for (const h of req.header) {
      if (!h.disabled && h.key) {
        const secretCheck = detectAndMaskSecrets(
          endpointId,
          endpointName,
          `Header: ${h.key}`,
          String(h.value ?? ''),
          shouldMask
        );
        secrets.push(...secretCheck.findings);

        headers.push({
          name: h.key,
          type: 'string',
          required: false,
          description: h.description?.content || h.description || '',
          example: secretCheck.value,
          default: secretCheck.value,
        });
      }
    }
  }

  // Authentication
  let authentication = inheritedAuth;
  if (req.auth) {
    authentication = parseAuth(req.auth, endpointId, endpointName, shouldMask, secrets);
  }

  // Request Body
  let requestBody: RequestBody | undefined;
  if (req.body) {
    requestBody = parseRequestBody(req.body, endpointId, endpointName, shouldMask, secrets);
  }

  // Responses from examples
  const responses: ResponseExample[] = [];
  if (Array.isArray(item.response)) {
    for (const res of item.response) {
      responses.push(parseResponseExample(res));
    }
  }

  // cURL and HTTP snippets
  const curlSnippet = generateCurlSnippet(method, fullUrl || path, headers, authentication, requestBody);
  const httpSnippet = generateHttpSnippet(method, fullUrl || path, headers, authentication, requestBody);

  return {
    id: endpointId,
    name: endpointName,
    description,
    method,
    path: path || '/',
    fullUrl: fullUrl || path,
    authentication,
    headers,
    pathParameters: pathParams,
    queryParameters: queryParams,
    requestBody,
    responses,
    curlSnippet,
    httpSnippet,
  };
}

function parseAuth(
  authObj: any,
  targetId: string,
  targetName: string,
  shouldMask: boolean,
  secrets: SecretFinding[]
): Authentication {
  if (!authObj || authObj.type === 'noauth') {
    return { type: 'none' };
  }

  const type = authObj.type;
  if (type === 'bearer') {
    let token = '';
    if (Array.isArray(authObj.bearer)) {
      const tokenItem = authObj.bearer.find((b: any) => b.key === 'token');
      token = tokenItem?.value || '';
    }
    const secretCheck = detectAndMaskSecrets(targetId, targetName, 'Bearer Token', token, shouldMask);
    secrets.push(...secretCheck.findings);

    return {
      type: 'bearer',
      details: { token: secretCheck.value },
    };
  }

  if (type === 'basic') {
    let u = '';
    let p = '';
    if (Array.isArray(authObj.basic)) {
      u = authObj.basic.find((b: any) => b.key === 'username')?.value || '';
      p = authObj.basic.find((b: any) => b.key === 'password')?.value || '';
    }
    const secretCheck = detectAndMaskSecrets(targetId, targetName, 'Basic Auth Password', p, shouldMask);
    secrets.push(...secretCheck.findings);

    return {
      type: 'basic',
      details: { username: u, password: secretCheck.value },
    };
  }

  if (type === 'apikey') {
    let k = 'X-API-Key';
    let v = '';
    let inLoc: 'header' | 'query' = 'header';
    if (Array.isArray(authObj.apikey)) {
      k = authObj.apikey.find((b: any) => b.key === 'key')?.value || 'X-API-Key';
      v = authObj.apikey.find((b: any) => b.key === 'value')?.value || '';
      const inVal = authObj.apikey.find((b: any) => b.key === 'in')?.value;
      if (inVal === 'query') inLoc = 'query';
    }
    const secretCheck = detectAndMaskSecrets(targetId, targetName, `API Key (${k})`, v, shouldMask);
    secrets.push(...secretCheck.findings);

    return {
      type: 'apikey',
      details: { key: k, value: secretCheck.value, in: inLoc },
    };
  }

  return { type: 'custom' };
}

function parseRequestBody(
  body: any,
  targetId: string,
  targetName: string,
  shouldMask: boolean,
  secrets: SecretFinding[]
): RequestBody {
  const mode = body.mode || 'none';

  if (mode === 'raw') {
    const rawContent = body.raw || '';
    const secretCheck = detectAndMaskSecrets(targetId, targetName, 'Request Body', rawContent, shouldMask);
    secrets.push(...secretCheck.findings);

    let rawType: RequestBody['rawType'] = 'json';
    const lang = body.options?.raw?.language;
    if (lang === 'json') rawType = 'json';
    else if (lang === 'xml') rawType = 'xml';
    else if (lang === 'html') rawType = 'html';
    else if (lang === 'javascript') rawType = 'javascript';
    else if (rawContent.trim().startsWith('{') || rawContent.trim().startsWith('[')) rawType = 'json';

    // Parse parameters from raw JSON if applicable
    const parameters: Parameter[] = [];
    if (rawType === 'json') {
      try {
        const parsed = JSON.parse(secretCheck.value);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          for (const [key, val] of Object.entries(parsed)) {
            parameters.push({
              name: key,
              type: Array.isArray(val) ? 'array' : typeof val,
              required: true,
              description: '',
              example: val,
              default: val,
            });
          }
        }
      } catch {
        // Not strict JSON
      }
    }

    return {
      mode: 'raw',
      rawType,
      rawContent: secretCheck.value,
      parameters: parameters.length > 0 ? parameters : undefined,
    };
  }

  if (mode === 'urlencoded' || mode === 'formdata') {
    const paramsList: Parameter[] = [];
    const arr = mode === 'urlencoded' ? body.urlencoded : body.formdata;
    if (Array.isArray(arr)) {
      for (const p of arr) {
        if (!p.disabled && p.key) {
          const secretCheck = detectAndMaskSecrets(
            targetId,
            targetName,
            `Body param (${p.key})`,
            String(p.value ?? ''),
            shouldMask
          );
          secrets.push(...secretCheck.findings);

          paramsList.push({
            name: p.key,
            type: p.type || 'string',
            required: false,
            description: p.description?.content || p.description || '',
            example: secretCheck.value,
            default: secretCheck.value,
          });
        }
      }
    }
    return {
      mode,
      parameters: paramsList,
    };
  }

  return { mode: 'none' };
}

function parseResponseExample(res: any): ResponseExample {
  const statusCode = res.code || 200;
  const statusText = res.status || 'OK';
  const name = res.name || `${statusCode} ${statusText}`;
  const body = res.body || '';

  let bodyType: ResponseExample['bodyType'] = 'text';
  if (body.trim().startsWith('{') || body.trim().startsWith('[')) {
    bodyType = 'json';
  } else if (body.trim().startsWith('<')) {
    bodyType = 'xml';
  }

  const headers = Array.isArray(res.header)
    ? res.header.map((h: any) => ({
        key: h.key,
        value: h.value,
        description: h.description,
      }))
    : [];

  return {
    id: `res-${Math.random().toString(36).substring(2, 9)}`,
    name,
    statusCode,
    statusText,
    headers,
    body,
    bodyType,
    description: res.description || '',
  };
}

function extractPath(urlStr: string): string {
  try {
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      const url = new URL(urlStr);
      return url.pathname;
    }
    const idx = urlStr.indexOf('/');
    return idx !== -1 ? urlStr.substring(idx) : urlStr;
  } catch {
    return urlStr;
  }
}

