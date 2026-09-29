import test from 'node:test';
import assert from 'node:assert';
import { validatePostmanCollection } from '../lib/postman/validator';
import { normalizePostmanCollection } from '../lib/postman/normalizer';
import { detectAndMaskSecrets } from '../lib/postman/secrets';
import { exportToMarkdown } from '../lib/export/markdown';
import { exportToHtml } from '../lib/export/html';
import { samplePostmanCollection } from '../lib/sample/sample-collection';

test('Validator: should validate sample Postman collection v2.1', () => {
  const res = validatePostmanCollection(samplePostmanCollection);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.version, 'v2.1');
  assert.strictEqual(res.collectionName, 'Acme Payments & Commerce API');
});

test('Validator: should reject invalid json / malformed collection', () => {
  const invalidJson = '{ bad: json';
  const res1 = validatePostmanCollection(invalidJson);
  assert.strictEqual(res1.valid, false);

  const missingItems = { info: { schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' } };
  const res2 = validatePostmanCollection(missingItems);
  assert.strictEqual(res2.valid, false);
});

test('Secret Protection: should detect and mask Bearer JWT tokens', () => {
  const rawJwt = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature';
  const { value, findings } = detectAndMaskSecrets('target-1', 'Endpoint 1', 'Authorization Header', rawJwt, true);

  assert.strictEqual(findings.length, 1);
  assert.strictEqual(findings[0].type, 'bearer_token');
  assert.strictEqual(value, 'Bearer YOUR_ACCESS_TOKEN');
});

test('Secret Protection: should detect and mask API keys and secrets', () => {
  const rawKey = 'sk_live_99482910482910382910';
  const { value, findings } = detectAndMaskSecrets('target-2', 'Create Payment', 'Header: x-api-key', rawKey, true);

  assert.strictEqual(findings.length, 1);
  assert.strictEqual(value, 'YOUR_API_KEY');
});

test('Normalizer: should parse sample collection into normalized model', () => {
  const project = normalizePostmanCollection(samplePostmanCollection, { maskSecrets: true });

  assert.ok(project.id);
  assert.strictEqual(project.metadata.title, 'Acme Payments & Commerce API');
  assert.strictEqual(project.metadata.version, '1.4.0');

  // Verify Cover and TOC presence
  const hasCover = project.sections.some((s) => s.type === 'cover');
  const hasToc = project.sections.some((s) => s.type === 'toc');
  const hasOverview = project.sections.some((s) => s.type === 'overview');

  assert.strictEqual(hasCover, true);
  assert.strictEqual(hasToc, true);
  assert.strictEqual(hasOverview, true);

  // Check groups (Authentication, Users, Payments)
  const authGroup = project.sections.find((s) => s.title === 'Authentication');
  assert.ok(authGroup);
  assert.strictEqual(authGroup.children?.length, 2); // Login and Refresh

  const usersGroup = project.sections.find((s) => s.title === 'Users');
  assert.ok(usersGroup);
  assert.strictEqual(usersGroup.children?.length, 4); // Create, Get, Update, Delete

  const paymentsGroup = project.sections.find((s) => s.title === 'Payments');
  assert.ok(paymentsGroup);
  assert.strictEqual(paymentsGroup.children?.length, 2); // Create Payment, Status
});

test('Normalizer: endpoints should have cURL and HTTP snippets generated', () => {
  const project = normalizePostmanCollection(samplePostmanCollection, { maskSecrets: true });
  const usersGroup = project.sections.find((s) => s.title === 'Users');
  const createUserEp = usersGroup?.children?.find((c) => c.title === 'Create User')?.endpoint;

  assert.ok(createUserEp);
  assert.strictEqual(createUserEp.method, 'POST');
  assert.ok(createUserEp.curlSnippet?.includes('curl --request POST'));
  assert.ok(createUserEp.curlSnippet?.includes('--data'));
  assert.ok(createUserEp.httpSnippet?.includes('POST'));
});

test('Quality Report: should calculate health metrics and findings', () => {
  const project = normalizePostmanCollection(samplePostmanCollection, { maskSecrets: true });
  const report = project.qualityReport;

  assert.ok(report.totalEndpoints > 0);
  assert.strictEqual(report.totalEndpoints, 8);
  assert.ok(report.score >= 70);
  assert.ok(report.findings.length > 0);
});

test('Exporter: Markdown export generates valid structure', () => {
  const project = normalizePostmanCollection(samplePostmanCollection, { maskSecrets: true });
  const md = exportToMarkdown(project);

  assert.ok(md.includes('# Acme Payments & Commerce API'));
  assert.ok(md.includes('## Table of Contents'));
  assert.ok(md.includes('POST `/users`') || md.includes('Create User'));
  assert.ok(md.includes('```bash\ncurl'));
});

test('Exporter: HTML export generates standalone document', () => {
  const project = normalizePostmanCollection(samplePostmanCollection, { maskSecrets: true });
  const html = exportToHtml(project);

  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('Acme Payments') && html.includes('API Documentation'));
  assert.ok(html.includes('class="sidebar"'));
  assert.ok(html.includes('Table of Contents'));
});
