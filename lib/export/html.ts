import { DocumentationProject, DocumentationSection, Endpoint } from '../types/documentation';

export function exportToHtml(project: DocumentationProject): string {
  const title = escapeHtml(project.metadata.title);
  const subtitle = escapeHtml(project.metadata.subtitle || 'API Reference');
  const version = escapeHtml(project.metadata.version || '1.0.0');
  const date = escapeHtml(project.metadata.date || '');
  const primaryColor = project.theme.primaryColor || '#2563eb';
  const logo = project.metadata.logoUrl
    ? `<img src="${project.metadata.logoUrl}" alt="Logo" style="max-height: 48px; max-width: 180px; object-fit: contain;" />`
    : `<div style="font-weight: 800; font-size: 24px; color: ${primaryColor}; letter-spacing: -0.025em;">${title}</div>`;

  let navItemsHtml = '';
  let contentHtml = '';

  // Render navigation & content
  for (const sec of project.sections) {
    if (sec.type === 'cover') continue;

    if (sec.type === 'toc') {
      navItemsHtml += `<li><a href="#section-toc" class="nav-link">Table of Contents</a></li>`;
      contentHtml += renderTocHtml(project);
      continue;
    }

    if (sec.type === 'overview') {
      navItemsHtml += `<li><a href="#section-overview" class="nav-link">${escapeHtml(sec.title)}</a></li>`;
      contentHtml += renderOverviewHtml(sec, project);
      continue;
    }

    if (sec.type === 'group') {
      navItemsHtml += `<li class="nav-group-header">${escapeHtml(sec.title)}</li>`;
      if (sec.children) {
        for (const child of sec.children) {
          if (child.endpoint) {
            const ep = child.endpoint;
            navItemsHtml += `
              <li>
                <a href="#ep-${ep.id}" class="nav-link nav-ep-link">
                  <span class="method-badge badge-${ep.method.toLowerCase()}">${ep.method}</span>
                  <span class="ep-title">${escapeHtml(ep.name)}</span>
                </a>
              </li>`;
            contentHtml += renderEndpointHtml(ep, primaryColor);
          }
        }
      }
      continue;
    }

    if (sec.type === 'endpoint' && sec.endpoint) {
      const ep = sec.endpoint;
      navItemsHtml += `
        <li>
          <a href="#ep-${ep.id}" class="nav-link nav-ep-link">
            <span class="method-badge badge-${ep.method.toLowerCase()}">${ep.method}</span>
            <span class="ep-title">${escapeHtml(ep.name)}</span>
          </a>
        </li>`;
      contentHtml += renderEndpointHtml(ep, primaryColor);
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - API Documentation</title>
  <style>
    :root {
      --primary: ${primaryColor};
      --bg: #ffffff;
      --sidebar-bg: #f8fafc;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --card-bg: #ffffff;
      --code-bg: #0f172a;
      --code-text: #f8fafc;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: var(--text);
      background: var(--bg);
      line-height: 1.5;
      display: flex;
      min-height: 100vh;
    }
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Sidebar */
    .sidebar {
      width: 290px;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border);
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      overflow-y: auto;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .sidebar-header {
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    .sidebar-version {
      display: inline-block;
      margin-top: 4px;
      font-size: 12px;
      font-weight: 600;
      background: #e2e8f0;
      color: #334155;
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .nav-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
    .nav-group-header {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-top: 16px;
      margin-bottom: 4px;
      padding-left: 8px;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 13px;
      color: #334155;
      font-weight: 500;
      transition: all 0.15s;
    }
    .nav-link:hover {
      background: #e2e8f0;
      text-decoration: none;
      color: var(--text);
    }
    .nav-ep-link {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ep-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Badges */
    .method-badge {
      font-family: monospace;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .badge-get { background: #dbeafe; color: #1e40af; }
    .badge-post { background: #dcfce7; color: #166534; }
    .badge-put { background: #fef3c7; color: #92400e; }
    .badge-patch { background: #f3e8ff; color: #6b21a8; }
    .badge-delete { background: #ffe4e6; color: #9f1239; }

    /* Main Content */
    .main {
      margin-left: 290px;
      flex: 1;
      padding: 48px 56px;
      max-width: 1020px;
    }
    .doc-section {
      margin-bottom: 56px;
      scroll-margin-top: 32px;
    }
    .doc-section h1 {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 8px;
    }
    .doc-section h2 {
      font-size: 20px;
      font-weight: 700;
      margin: 28px 0 12px 0;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }
    .doc-section h3 {
      font-size: 15px;
      font-weight: 600;
      margin: 20px 0 8px 0;
      color: #334155;
    }
    .desc {
      color: #475569;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    /* Endpoint Box */
    .endpoint-header-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f1f5f9;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      margin-bottom: 16px;
      border: 1px solid var(--border);
    }
    .endpoint-path {
      font-weight: 600;
      color: #0f172a;
    }

    /* Tables */
    .table-container {
      width: 100%;
      overflow-x: auto;
      margin: 16px 0;
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }
    th {
      background: #f8fafc;
      padding: 10px 14px;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      color: #1e293b;
    }
    tr:last-child td { border-bottom: none; }
    .req-badge {
      display: inline-block;
      font-size: 10px;
      background: #fee2e2;
      color: #991b1b;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .opt-badge {
      display: inline-block;
      font-size: 10px;
      background: #f1f5f9;
      color: #64748b;
      padding: 1px 6px;
      border-radius: 4px;
    }

    /* Code Block */
    pre {
      background: var(--code-bg);
      color: var(--code-text);
      padding: 16px;
      border-radius: 8px;
      font-family: "SFMono-Regular", Consolas, Menlo, monospace;
      font-size: 13px;
      overflow-x: auto;
      line-height: 1.5;
      margin: 12px 0;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .sidebar { display: none; }
      .main { margin-left: 0; padding: 24px 20px; }
    }

    /* Print Styles */
    @media print {
      body { display: block; background: white; color: black; }
      .sidebar { display: none; }
      .main { margin: 0; padding: 0; max-width: 100%; }
      .doc-section { page-break-inside: avoid; margin-bottom: 32px; }
      pre { background: #f8fafc !important; color: #0f172a !important; border: 1px solid #cbd5e1; }
    }
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-header">
      ${logo}
      <div><span class="sidebar-version">v${version}</span></div>
    </div>
    <ul class="nav-list">
      ${navItemsHtml}
    </ul>
  </aside>

  <main class="main">
    <section class="doc-section" style="padding-bottom: 24px; border-bottom: 2px solid var(--border); margin-bottom: 40px;">
      <h1>${title}</h1>
      <p class="desc">${subtitle}</p>
      <div style="font-size: 13px; color: var(--text-muted);">
        <strong>Version:</strong> ${version} &bull; <strong>Updated:</strong> ${date}
      </div>
    </section>

    ${contentHtml}
  </main>
</body>
</html>`;
}

function renderTocHtml(project: DocumentationProject): string {
  let list = '<ol style="padding-left: 20px; line-height: 1.8;">';
  for (const sec of project.sections) {
    if (sec.type === 'cover' || sec.type === 'toc') continue;
    list += `<li><a href="#${sec.type === 'overview' ? 'section-overview' : sec.children ? 'group-' + sec.id : 'ep-' + sec.id}"><strong>${escapeHtml(sec.title)}</strong></a>`;
    if (sec.children && sec.children.length > 0) {
      list += '<ul style="padding-left: 20px; list-style-type: circle;">';
      for (const child of sec.children) {
        list += `<li><a href="#ep-${child.id}">${escapeHtml(child.title)}</a></li>`;
      }
      list += '</ul>';
    }
    list += `</li>`;
  }
  list += '</ol>';

  return `
    <section id="section-toc" class="doc-section">
      <h2>Table of Contents</h2>
      <div class="table-container" style="padding: 20px; background: #fafafa;">
        ${list}
      </div>
    </section>
  `;
}

function renderOverviewHtml(sec: DocumentationSection, project: DocumentationProject): string {
  let varsHtml = '';
  if (project.variables.length > 0) {
    varsHtml = `
      <h3>Environment & Variables</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr><th>Variable</th><th>Default Value</th><th>Description</th></tr>
          </thead>
          <tbody>
            ${project.variables.map(v => `
              <tr>
                <td><code>${escapeHtml(v.key)}</code></td>
                <td><code>${escapeHtml(v.value)}</code></td>
                <td>${escapeHtml(v.description || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return `
    <section id="section-overview" class="doc-section">
      <h2>${escapeHtml(sec.title)}</h2>
      <p class="desc">${escapeHtml(sec.description || '')}</p>
      ${varsHtml}
    </section>
  `;
}

function renderEndpointHtml(ep: Endpoint, primaryColor: string): string {
  let headersTable = '';
  if (ep.headers && ep.headers.length > 0) {
    headersTable = `
      <h3>Headers</h3>
      <div class="table-container">
        <table>
          <thead><tr><th>Header</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
          <tbody>
            ${ep.headers.map(h => `
              <tr>
                <td><code>${escapeHtml(h.name)}</code></td>
                <td>${escapeHtml(h.type || 'string')}</td>
                <td>${h.required ? '<span class="req-badge">Required</span>' : '<span class="opt-badge">Optional</span>'}</td>
                <td>${escapeHtml(h.description || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  let pathParamsTable = '';
  if (ep.pathParameters && ep.pathParameters.length > 0) {
    pathParamsTable = `
      <h3>Path Parameters</h3>
      <div class="table-container">
        <table>
          <thead><tr><th>Parameter</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
          <tbody>
            ${ep.pathParameters.map(p => `
              <tr>
                <td><code>${escapeHtml(p.name)}</code></td>
                <td>${escapeHtml(p.type || 'string')}</td>
                <td><span class="req-badge">Required</span></td>
                <td>${escapeHtml(p.description || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  let queryParamsTable = '';
  if (ep.queryParameters && ep.queryParameters.length > 0) {
    queryParamsTable = `
      <h3>Query Parameters</h3>
      <div class="table-container">
        <table>
          <thead><tr><th>Parameter</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
          <tbody>
            ${ep.queryParameters.map(p => `
              <tr>
                <td><code>${escapeHtml(p.name)}</code></td>
                <td>${escapeHtml(p.type || 'string')}</td>
                <td>${p.required ? '<span class="req-badge">Required</span>' : '<span class="opt-badge">Optional</span>'}</td>
                <td>${escapeHtml(p.description || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  let bodyHtml = '';
  if (ep.requestBody && ep.requestBody.mode !== 'none') {
    bodyHtml = `
      <h3>Request Body (${escapeHtml(ep.requestBody.mode)})</h3>
      ${ep.requestBody.rawContent ? `<pre><code>${escapeHtml(ep.requestBody.rawContent.trim())}</code></pre>` : ''}
    `;
  }

  let curlHtml = '';
  if (ep.curlSnippet) {
    curlHtml = `
      <h3>cURL Request</h3>
      <pre><code>${escapeHtml(ep.curlSnippet)}</code></pre>
    `;
  }

  let responsesHtml = '';
  if (ep.responses && ep.responses.length > 0) {
    responsesHtml = `<h3>Responses</h3>`;
    for (const res of ep.responses) {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
      responsesHtml += `
        <div style="margin: 16px 0; border: 1px solid var(--border); border-radius: 8px; overflow: hidden;">
          <div style="padding: 8px 14px; background: ${isSuccess ? '#f0fdf4' : '#fef2f2'}; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px;">
            <strong style="color: ${isSuccess ? '#166534' : '#991b1b'};">${res.statusCode} ${escapeHtml(res.statusText || '')}</strong>
            <span style="font-size: 13px; color: var(--text-muted);">&bull; ${escapeHtml(res.name)}</span>
          </div>
          ${res.body ? `<pre style="margin: 0; border-radius: 0;"><code>${escapeHtml(res.body.trim())}</code></pre>` : ''}
        </div>
      `;
    }
  }

  return `
    <section id="ep-${ep.id}" class="doc-section">
      <h2>${escapeHtml(ep.name)}</h2>
      ${ep.description ? `<p class="desc">${escapeHtml(ep.description)}</p>` : ''}
      <div class="endpoint-header-box">
        <span class="method-badge badge-${ep.method.toLowerCase()}">${ep.method}</span>
        <span class="endpoint-path">${escapeHtml(ep.path)}</span>
      </div>
      ${headersTable}
      ${pathParamsTable}
      ${queryParamsTable}
      ${bodyHtml}
      ${curlHtml}
      ${responsesHtml}
    </section>
  `;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

