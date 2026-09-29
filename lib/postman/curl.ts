import { HttpMethod, Parameter, RequestBody, Authentication } from '../types/documentation';

export function generateCurlSnippet(
  method: HttpMethod,
  url: string,
  headers: Parameter[],
  auth?: Authentication,
  requestBody?: RequestBody
): string {
  const parts: string[] = [`curl --request ${method}`];
  parts.push(`  --url '${url}'`);

  // Add auth header if applicable
  if (auth && auth.type !== 'none') {
    if (auth.type === 'bearer') {
      const token = auth.details?.token || 'YOUR_ACCESS_TOKEN';
      parts.push(`  --header 'Authorization: Bearer ${token}'`);
    } else if (auth.type === 'basic') {
      const u = auth.details?.username || 'username';
      const p = auth.details?.password || 'password';
      parts.push(`  --user '${u}:${p}'`);
    } else if (auth.type === 'apikey') {
      const k = auth.details?.key || 'X-API-Key';
      const v = auth.details?.value || 'YOUR_API_KEY';
      if (auth.details?.in !== 'query') {
        parts.push(`  --header '${k}: ${v}'`);
      }
    }
  }

  // Headers
  for (const h of headers) {
    if (h.name.toLowerCase() === 'authorization' && auth?.type === 'bearer') {
      continue; // already added
    }
    const val = h.example || h.default || 'value';
    parts.push(`  --header '${h.name}: ${val}'`);
  }

  // Body
  if (requestBody && requestBody.mode !== 'none') {
    if (requestBody.mode === 'raw' && requestBody.rawContent) {
      // Check if JSON
      if (requestBody.rawType === 'json') {
        parts.push(`  --data '${requestBody.rawContent.trim()}'`);
      } else {
        parts.push(`  --data '${requestBody.rawContent.trim()}'`);
      }
    } else if (requestBody.mode === 'urlencoded' && requestBody.parameters) {
      for (const p of requestBody.parameters) {
        parts.push(`  --data-urlencode '${p.name}=${p.example ?? p.default ?? ''}'`);
      }
    } else if (requestBody.mode === 'formdata' && requestBody.parameters) {
      for (const p of requestBody.parameters) {
        parts.push(`  --form '${p.name}=${p.example ?? p.default ?? ''}'`);
      }
    }
  }

  return parts.join(' \\\n');
}

export function generateHttpSnippet(
  method: HttpMethod,
  fullUrl: string,
  headers: Parameter[],
  auth?: Authentication,
  requestBody?: RequestBody
): string {
  let host = 'api.example.com';
  let path = fullUrl;

  try {
    if (fullUrl.startsWith('http')) {
      const parsed = new URL(fullUrl);
      host = parsed.host;
      path = parsed.pathname + parsed.search;
    }
  } catch {
    // fallback
  }

  const lines: string[] = [`${method} ${path} HTTP/1.1`, `Host: ${host}`];

  if (auth?.type === 'bearer') {
    lines.push(`Authorization: Bearer ${auth.details?.token || 'YOUR_ACCESS_TOKEN'}`);
  }

  for (const h of headers) {
    if (h.name.toLowerCase() === 'authorization' && auth?.type === 'bearer') continue;
    lines.push(`${h.name}: ${h.example || h.default || 'value'}`);
  }

  if (requestBody && requestBody.mode === 'raw' && requestBody.rawContent) {
    lines.push('');
    lines.push(requestBody.rawContent.trim());
  }

  return lines.join('\n');
}

