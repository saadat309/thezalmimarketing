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

const propertiesUrl = new URL('/api/v1/properties/', origin)
const listResponse = await fetch(propertiesUrl)
const listBody = await listResponse.json()
const listedJson = JSON.stringify(listBody)
const listChecks = {
  status: listResponse.status === 200,
  defaultPageSize: listBody.items.length === 20,
  hasContinuation: listBody.page.hasMore && Boolean(listBody.page.nextCursor),
  hiddenAndFileOnlyExcluded: !listedJson.includes('hidden-home') && !listedJson.includes('sample-file'),
  noInternalKeysOrIds: !listedJson.includes('synthetic-private-key') && !/"id"\s*:/.test(listedJson),
  noStoreKeys: listBody.items.every((item) => item.media.images.every((image) => !('key' in image))),
  revalidationHeader: listResponse.headers.get('cache-control') === 'no-cache, must-revalidate',
  etag: Boolean(listResponse.headers.get('etag')),
}
if (Object.values(listChecks).some((passed) => !passed)) failed = true
console.log(JSON.stringify({ path: propertiesUrl.pathname, status: listResponse.status, checks: listChecks }))

const unchangedResponse = await fetch(propertiesUrl, {
  headers: { 'If-None-Match': listResponse.headers.get('etag') },
})
const validationChecks = {
  status: unchangedResponse.status === 304,
  emptyBody: (await unchangedResponse.text()) === '',
}
if (Object.values(validationChecks).some((passed) => !passed)) failed = true
console.log(JSON.stringify({ path: propertiesUrl.pathname, method: 'GET If-None-Match', status: unchangedResponse.status, checks: validationChecks }))

const cursorUrl = new URL(propertiesUrl)
cursorUrl.searchParams.set('cursor', listBody.page.nextCursor)
const nextPage = await (await fetch(cursorUrl)).json()
const cursorChecks = {
  size: nextPage.items.length === 20,
  noDuplicates: nextPage.items.every((item) => !listBody.items.some((first) => first.slug === item.slug)),
}
if (Object.values(cursorChecks).some((passed) => !passed)) failed = true
console.log(JSON.stringify({ path: cursorUrl.pathname, method: 'GET cursor', status: 200, checks: cursorChecks }))

const oversizedResponse = await fetch(new URL('/api/v1/properties/?limit=51', origin))
const oversizedBody = await oversizedResponse.json()
const oversizedChecks = {
  status: oversizedResponse.status === 400,
  fieldError: oversizedBody.error?.fields?.limit !== undefined,
}
if (Object.values(oversizedChecks).some((passed) => !passed)) failed = true
console.log(JSON.stringify({ path: '/api/v1/properties/?limit=51', status: oversizedResponse.status, checks: oversizedChecks }))

const maximumPage = await (await fetch(new URL('/api/v1/properties/?limit=50', origin))).json()
const maximumChecks = { pageSize: maximumPage.items.length === 50, stillHasMore: maximumPage.page.hasMore }
if (Object.values(maximumChecks).some((passed) => !passed)) failed = true
console.log(JSON.stringify({ path: '/api/v1/properties/?limit=50', status: 200, checks: maximumChecks }))

const filterResponse = await fetch(new URL('/api/v1/properties/?category=houses&city=sample-city&purchase_type=sale&min_beds=3&min_baths=2&min_area=1000&area_unit=sqft', origin))
const filterBody = await filterResponse.json()
const filterChecks = { status: filterResponse.status === 200, results: filterBody.items.length > 0 }
if (Object.values(filterChecks).some((passed) => !passed)) failed = true
console.log(JSON.stringify({ path: '/api/v1/properties/?category=houses&city=sample-city', status: filterResponse.status, checks: filterChecks }))
const invalidFilter = await fetch(new URL('/api/v1/properties/?purchase_type=unknown', origin))
const invalidFilterBody = await invalidFilter.json()
const invalidFilterChecks = { status: invalidFilter.status === 400, fieldError: Boolean(invalidFilterBody.error?.fields?.purchase_type) }
if (Object.values(invalidFilterChecks).some((passed) => !passed)) failed = true
console.log(JSON.stringify({ path: '/api/v1/properties/?purchase_type=unknown', status: invalidFilter.status, checks: invalidFilterChecks }))

for (const slug of ['sample-residence', 'private-video-home', 'hidden-home', '123456']) {
  const detailResponse = await fetch(new URL(`/api/v1/properties/${slug}`, origin))
  const isVisible = slug === 'sample-residence' || slug === 'private-video-home'
  const detailBody = await detailResponse.json()
  const html = detailBody.descriptionHtml ?? ''
  const detailChecks = {
    status: detailResponse.status === (isVisible ? 200 : 404),
    cachePolicy: detailResponse.headers.get('cache-control') === (isVisible ? 'no-cache, must-revalidate' : 'no-store'),
    sanitizedDescription: !isVisible || (
      html.includes('<strong>formatting</strong>') &&
      html.includes('<a href="/details">Safe relative link</a>') &&
      !/<script\b|<iframe\b|\son[a-z]+=|javascript:|href="\/\\evil/i.test(html)
    ),
    videoRequiresBothPublicFlags: slug !== 'private-video-home' || detailBody.media?.video === null,
    mediaStorageDisabled: !isVisible || (
      detailBody.media.thumbnail === null &&
      detailBody.media.images.length === 0 &&
      detailBody.media.video === null
    ),
    internalFieldsHidden: !('id' in detailBody) && !JSON.stringify(detailBody).includes('synthetic-private-key'),
  }
  if (Object.values(detailChecks).some((passed) => !passed)) failed = true
  console.log(JSON.stringify({ path: `/api/v1/properties/${slug}`, status: detailResponse.status, checks: detailChecks }))
}

if (failed) process.exitCode = 1
