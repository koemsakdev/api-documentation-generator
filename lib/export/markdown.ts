import { DocumentationProject, DocumentationSection, Endpoint } from '../types/documentation';

export function exportToMarkdown(project: DocumentationProject): string {
  const lines: string[] = [];

  // Document Title & Metadata
  lines.push(`# ${project.metadata.title}`);
  if (project.metadata.subtitle) {
    lines.push(`> ${project.metadata.subtitle}`);
  }
  lines.push('');
  lines.push(`* **Version**: ${project.metadata.version}`);
  if (project.metadata.date) lines.push(`* **Date**: ${project.metadata.date}`);
  if (project.metadata.companyName) lines.push(`* **Author / Company**: ${project.metadata.companyName}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Table of contents
  lines.push('## Table of Contents');
  lines.push('');
  let tocIndex = 1;
  for (const sec of project.sections) {
    if (sec.type === 'cover' || sec.type === 'toc') continue;
    lines.push(`${tocIndex}. [${sec.title}](#${slugify(sec.title)})`);
    if (sec.children && sec.children.length > 0) {
      let subIndex = 1;
      for (const child of sec.children) {
        lines.push(`   ${tocIndex}.${subIndex}. [${child.title}](#${slugify(child.title)})`);
        subIndex++;
      }
    }
    tocIndex++;
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Sections
  for (const sec of project.sections) {
    if (sec.type === 'cover' || sec.type === 'toc') continue;

    if (sec.type === 'overview') {
      lines.push(`## ${sec.title}`);
      lines.push('');
      if (sec.description) lines.push(sec.description);
      lines.push('');

      if (project.variables.length > 0) {
        lines.push('### Variables & Environment');
        lines.push('');
        lines.push('| Variable | Value | Description |');
        lines.push('| :--- | :--- | :--- |');
        for (const v of project.variables) {
          lines.push(`| \`${v.key}\` | \`${v.value}\` | ${v.description || '-'} |`);
        }
        lines.push('');
      }
      lines.push('---');
      lines.push('');
      continue;
    }

    if (sec.type === 'group') {
      lines.push(`## ${sec.title}`);
      lines.push('');
      if (sec.description) {
        lines.push(sec.description);
        lines.push('');
      }

      if (sec.children) {
        for (const child of sec.children) {
          if (child.endpoint) {
            lines.push(renderEndpointMarkdown(child.endpoint, 3));
          }
        }
      }
      lines.push('---');
      lines.push('');
      continue;
    }

    if (sec.type === 'endpoint' && sec.endpoint) {
      lines.push(renderEndpointMarkdown(sec.endpoint, 2));
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

function renderEndpointMarkdown(ep: Endpoint, level: number): string {
  const h = '#'.repeat(level);
  const subH = '#'.repeat(level + 1);
  const lines: string[] = [];

  lines.push(`${h} ${ep.name}`);
  lines.push('');
  if (ep.description) {
    lines.push(ep.description);
    lines.push('');
  }

  lines.push(`${subH} Endpoint`);
  lines.push('');
  lines.push(`\`${ep.method}\` \`${ep.path}\``);
  lines.push('');

  if (ep.authentication && ep.authentication.type !== 'none') {
    lines.push(`* **Authentication**: ${formatAuthType(ep.authentication.type)}`);
    lines.push('');
  }

  // Headers
  if (ep.headers && ep.headers.length > 0) {
    lines.push(`${subH} Headers`);
    lines.push('');
    lines.push('| Header | Type | Required | Description |');
    lines.push('| :--- | :--- | :--- | :--- |');
    for (const hdr of ep.headers) {
      lines.push(`| \`${hdr.name}\` | ${hdr.type || 'string'} | ${hdr.required ? 'Yes' : 'No'} | ${hdr.description || '-'} |`);
    }
    lines.push('');
  }

  // Path parameters
  if (ep.pathParameters && ep.pathParameters.length > 0) {
    lines.push(`${subH} Path Parameters`);
    lines.push('');
    lines.push('| Parameter | Type | Required | Description |');
    lines.push('| :--- | :--- | :--- | :--- |');
    for (const p of ep.pathParameters) {
      lines.push(`| \`${p.name}\` | ${p.type || 'string'} | Yes | ${p.description || '-'} |`);
    }
    lines.push('');
  }

  // Query parameters
  if (ep.queryParameters && ep.queryParameters.length > 0) {
    lines.push(`${subH} Query Parameters`);
    lines.push('');
    lines.push('| Parameter | Type | Required | Description |');
    lines.push('| :--- | :--- | :--- | :--- |');
    for (const p of ep.queryParameters) {
      lines.push(`| \`${p.name}\` | ${p.type || 'string'} | ${p.required ? 'Yes' : 'No'} | ${p.description || '-'} |`);
    }
    lines.push('');
  }

  // Request Body
  if (ep.requestBody && ep.requestBody.mode !== 'none') {
    lines.push(`${subH} Request Body (${ep.requestBody.mode})`);
    lines.push('');
    if (ep.requestBody.rawContent) {
      lines.push('```' + (ep.requestBody.rawType || 'json'));
      lines.push(ep.requestBody.rawContent.trim());
      lines.push('```');
      lines.push('');
    }

    if (ep.requestBody.parameters && ep.requestBody.parameters.length > 0) {
      lines.push('| Field | Type | Required | Description |');
      lines.push('| :--- | :--- | :--- | :--- |');
      for (const p of ep.requestBody.parameters) {
        lines.push(`| \`${p.name}\` | ${p.type || 'string'} | ${p.required ? 'Yes' : 'No'} | ${p.description || '-'} |`);
      }
      lines.push('');
    }
  }

  // cURL Example
  if (ep.curlSnippet) {
    lines.push(`${subH} cURL Example`);
    lines.push('');
    lines.push('```bash');
    lines.push(ep.curlSnippet);
    lines.push('```');
    lines.push('');
  }

  // Responses
  if (ep.responses && ep.responses.length > 0) {
    lines.push(`${subH} Responses`);
    lines.push('');
    for (const res of ep.responses) {
      lines.push(`#### Status ${res.statusCode} ${res.statusText || ''} - ${res.name}`);
      lines.push('');
      if (res.description) {
        lines.push(res.description);
        lines.push('');
      }
      if (res.body) {
        lines.push('```' + (res.bodyType || 'json'));
        lines.push(res.body.trim());
        lines.push('```');
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

function formatAuthType(type: string): string {
  switch (type) {
    case 'bearer': return 'Bearer Token';
    case 'basic': return 'Basic Authentication';
    case 'apikey': return 'API Key';
    case 'oauth2': return 'OAuth 2.0';
    default: return type;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

