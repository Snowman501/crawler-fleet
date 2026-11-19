import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { POST } from '../app/api/leads/route.ts';

const originalFetch = globalThis.fetch;
const originalToken = process.env.GITHUB_LEAD_TOKEN;
const originalRepo = process.env.GITHUB_LEAD_REPO;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalToken === undefined) delete process.env.GITHUB_LEAD_TOKEN;
  else process.env.GITHUB_LEAD_TOKEN = originalToken;
  if (originalRepo === undefined) delete process.env.GITHUB_LEAD_REPO;
  else process.env.GITHUB_LEAD_REPO = originalRepo;
});

function request() {
  return new Request('http://localhost/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Person', email: 'test@example.invalid', website: 'https://example.org', message: 'Please review this synthetic page' }),
  });
}

test('absent explicit repository fails to email fallback without contacting GitHub', async () => {
  process.env.GITHUB_LEAD_TOKEN = 'synthetic-token';
  delete process.env.GITHUB_LEAD_REPO;
  globalThis.fetch = () => { throw new Error('Must not call GitHub'); };
  const response = await POST(request());
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.stored, false);
});

test('public repository is rejected before writing an issue', async () => {
  process.env.GITHUB_LEAD_TOKEN = 'synthetic-token';
  process.env.GITHUB_LEAD_REPO = 'example/public';
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), method: init.method || 'GET' });
    return Response.json({ private: false });
  };
  const result = await (await POST(request())).json();
  assert.equal(result.stored, false);
  assert.deepEqual(calls.map(c => c.method), ['GET']);
});

test('private repository allows an issue to be created', async () => {
  process.env.GITHUB_LEAD_TOKEN = 'synthetic-token';
  process.env.GITHUB_LEAD_REPO = 'example/private';
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), method: init.method || 'GET' });
    return init.method === 'POST' ? Response.json({ html_url: 'https://example.invalid/issue/1' }) : Response.json({ private: true, archived: false });
  };
  const result = await (await POST(request())).json();
  assert.equal(result.stored, true);
  assert.deepEqual(calls.map(c => c.method), ['GET', 'POST']);
});
