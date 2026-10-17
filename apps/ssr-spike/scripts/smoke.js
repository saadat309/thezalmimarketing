const origin = 'http://127.0.0.1:4175'
const cases = [
  {
    path: '/',
    status: 200,
    title: 'Staging SSR Home | Zalmi Marketing',
    marker: 'Property marketing, rendered on the server',
    canonical: 'https://migration.local.invalid/',
  },
  {
    path: '/properties/sample-residence/',
    status: 200,
    title: 'Sample Residence | Zalmi Marketing',
    marker: 'Synthetic District',
    canonical: 'https://migration.local.invalid/properties/sample-residence/',
  },
  {
    path: '/missing-route/',
    status: 404,
    marker: 'Page not found',
  },
  {
    path: '/properties/not-a-fixture/',
    status: 404,
    marker: 'Page not found',
  },
  {
    path: '/api/health',
    status: 200,
    json: { status: 'ok', environment: 'synthetic' },
  },
]

let failed = false

for (const testCase of cases) {
  const response = await fetch(new URL(testCase.path, origin))
  const html = await response.text()
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1]
  const json = testCase.json ? JSON.parse(html) : undefined
  const checks = {
    status: response.status === testCase.status,
    body: testCase.json
      ? JSON.stringify(json) === JSON.stringify(testCase.json)
      : html.includes(testCase.marker),
    title: testCase.title ? title === testCase.title : true,
    canonical: testCase.canonical ? canonical === testCase.canonical : true,
    contentType: testCase.json
      ? response.headers.get('content-type')?.includes('application/json')
      : true,
    cacheControl: testCase.json
      ? response.headers.get('cache-control') === 'no-store'
      : true,
  }

  if (Object.values(checks).some((passed) => !passed)) failed = true
  console.log(JSON.stringify({ path: testCase.path, status: response.status, checks }))
}

const headResponse = await fetch(new URL('/api/health', origin), { method: 'HEAD' })
const headChecks = {
  status: headResponse.status === 200,
  body: (await headResponse.text()) === '',
}
if (Object.values(headChecks).some((passed) => !passed)) failed = true
console.log(JSON.stringify({ path: '/api/health', method: 'HEAD', status: headResponse.status, checks: headChecks }))

const postResponse = await fetch(new URL('/api/health', origin), { method: 'POST' })
const postBody = await postResponse.json()
const postChecks = {
  status: postResponse.status === 405,
  body: postBody.error === 'Method not allowed',
  allow: postResponse.headers.get('allow') === 'GET, HEAD',
}
if (Object.values(postChecks).some((passed) => !passed)) failed = true
console.log(JSON.stringify({ path: '/api/health', method: 'POST', status: postResponse.status, checks: postChecks }))

if (failed) process.exitCode = 1
